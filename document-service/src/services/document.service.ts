import { DocumentModel, IDocument } from '../models/document.model';
import { Producer } from 'kafkajs';
import { createKafkaProducer, createRedisClient } from '../config';
import { Types } from 'mongoose';
import { promisify } from 'util';

type Pagination = { page?: number; limit?: number };

const CACHE_TTL_SECONDS = 60;

const docCacheKey = (id: string) => `document:${id}`;
const ownerListCacheKey = (ownerId: string, page: number, limit: number) =>
  `documents:owner:${ownerId}:${page}:${limit}`;

export class DocumentService {
  private producer: Producer;
  private redisClient: any;
  private getAsync: (key: string) => Promise<string | null>;
  private setAsync: (key: string, value: string, mode?: string, ttl?: number) => Promise<'OK' | null>;
  private delAsync: (...keys: string[]) => Promise<number>;
  private keysAsync: (pattern: string) => Promise<string[]>;

  private constructor(producer: Producer, redisClient: any) {
    this.producer = producer;
    this.redisClient = redisClient;
    this.getAsync = promisify(this.redisClient.get).bind(this.redisClient);
    this.setAsync = promisify(this.redisClient.set).bind(this.redisClient);
    this.delAsync = promisify(this.redisClient.del).bind(this.redisClient);
    this.keysAsync = promisify(this.redisClient.keys).bind(this.redisClient);
  }

  static async init(): Promise<DocumentService> {
    const producer = await createKafkaProducer();
    const redisClient = createRedisClient();
    return new DocumentService(producer, redisClient);
  }

  async createDocument(payload: Partial<IDocument>): Promise<IDocument> {
    const doc = new DocumentModel(payload as IDocument);
    await doc.save();

    // Cache the newly created document
    await this.setAsync(docCacheKey(String(doc._id)), JSON.stringify(doc), 'EX', CACHE_TTL_SECONDS);

    // Invalidate owner list caches
    await this.invalidateOwnerCaches(String(doc.ownerId));

    // Produce Kafka event
    await this.producer.send({
      topic: 'document.created',
      messages: [
        {
          key: String(doc._id),
          value: JSON.stringify({ id: doc._id, ownerId: doc.ownerId, timestamp: Date.now() }),
        },
      ],
    });

    return doc;
  }

  async getDocumentsByOwner(ownerId: string, pagination: Pagination = {}): Promise<IDocument[]> {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.max(1, Math.min(100, pagination.limit || 10));
    const skip = (page - 1) * limit;
    const cacheKey = ownerListCacheKey(ownerId, page, limit);

    const cached = await this.getAsync(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const docs = await DocumentModel.find({ ownerId: new Types.ObjectId(ownerId), isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    await this.setAsync(cacheKey, JSON.stringify(docs), 'EX', CACHE_TTL_SECONDS);
    return docs;
  }

  async getDocumentById(id: string): Promise<IDocument | null> {
    const cacheKey = docCacheKey(id);
    const cached = await this.getAsync(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return parsed;
    }

    const doc = await DocumentModel.findById(id);
    if (doc) {
      await this.setAsync(cacheKey, JSON.stringify(doc), 'EX', CACHE_TTL_SECONDS);
    }
    return doc;
  }

  async updateDocument(id: string, updates: Partial<IDocument>, userId: string): Promise<IDocument | null> {
    const existing = await DocumentModel.findById(id);
    if (!existing) return null;
    if (String(existing.ownerId) !== String(userId)) {
      throw new Error('Not authorized to update this document');
    }

    const updated = await DocumentModel.findByIdAndUpdate(id, updates, { new: true });
    if (updated) {
      // Update cache for the document
      await this.setAsync(docCacheKey(id), JSON.stringify(updated), 'EX', CACHE_TTL_SECONDS);

      // Invalidate owner list caches
      await this.invalidateOwnerCaches(String(updated.ownerId));

      // Produce Kafka event
      await this.producer.send({
        topic: 'document.updated',
        messages: [
          {
            key: String(updated._id),
            value: JSON.stringify({ id: updated._id, ownerId: updated.ownerId, timestamp: Date.now() }),
          },
        ],
      });
    }
    return updated;
  }

  async deleteDocument(id: string, userId: string): Promise<IDocument | null> {
    const existing = await DocumentModel.findById(id);
    if (!existing) return null;
    if (String(existing.ownerId) !== String(userId)) {
      throw new Error('Not authorized to delete this document');
    }

    // Soft delete
    const deleted = await DocumentModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (deleted) {
      // Update cache
      await this.setAsync(docCacheKey(id), JSON.stringify(deleted), 'EX', CACHE_TTL_SECONDS);
      await this.invalidateOwnerCaches(String(deleted.ownerId));

      // Produce Kafka event
      await this.producer.send({
        topic: 'document.deleted',
        messages: [
          {
            key: String(deleted._id),
            value: JSON.stringify({ id: deleted._id, ownerId: deleted.ownerId, timestamp: Date.now() }),
          },
        ],
      });
    }

    return deleted;
  }

  private async invalidateOwnerCaches(ownerId: string) {
    try {
      const keys = await this.keysAsync(`documents:owner:${ownerId}:*`);
      if (keys && keys.length) {
        await this.delAsync(...keys);
      }
    } catch (e) {
      // Non-fatal: log and continue
      console.warn('Failed to invalidate owner caches', e);
    }
  }
}