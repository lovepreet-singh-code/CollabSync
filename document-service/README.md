# CollabSync Document Service

![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-4.x-3178C6?logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Cache-D82C20?logo=redis&logoColor=white)
![Kafka](https://img.shields.io/badge/Kafka-kafkajs-231F20?logo=apache-kafka&logoColor=white)

## Overview
- Document CRUD service for CollabSync: create, list, fetch by id, update, delete.
- Authentication via JWT (`Authorization: Bearer <token>`), and ACL for per-document read/write access.
- Caching with Redis, persistence with MongoDB, and Kafka events on document lifecycle.
- Structured JSON responses with `status`, `message`, and `data` payloads.

## Tech Stack
- Runtime: Node.js 18.x
- Language: TypeScript
- Framework: Express
- Database: MongoDB (Mongoose)
- Cache: Redis (classic client v3 style)
- Messaging: Apache Kafka (kafkajs)
- Validation: Joi
- Testing: Jest + Supertest + mongodb-memory-server

## Features
- JWT authentication with `verifyToken` middleware (rejects invalid or missing tokens).
- ACL middleware `requireDocumentAccess('read'|'write')` checks ownership and `sharedWith` permissions.
- API validation using Joi for request bodies, params, and queries.
- Redis caching for `getDocumentById` and owner document lists; cache invalidation on writes.
- Kafka events for `document.created`, `document.updated`, and `document.deleted`.
- Consistent JSON responses:
  - Success: `{ status: 'success', message, data }`
  - Error: `{ status: 'error', message }`

## API Endpoints
- Base path: `/api/v1/documents`
- `POST /` (Auth required): Create a document
- `GET /` (Auth required): List documents owned by requester
- `GET /:id` (Auth + ACL read): Fetch document by id
- `PUT /:id` (Auth + ACL write): Update document
- `DELETE /:id` (Auth + ACL write): Soft delete document

## Setup (Local)
### Prerequisites
- Node.js 18+
- MongoDB running and reachable
- Redis running
- Kafka broker running

### Install & Run
1. Copy `.env.example` to `.env` and adjust values.
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Service runs on `http://localhost:${PORT}` (default `PORT` comes from `.env`).

### Environment Variables
Defined and validated in `src/config/index.ts`.
- `PORT` — Service port (default `3001`; example uses `4002`)
- `NODE_ENV` — `development`|`test`|`production`
- `MONGO_URI` — Mongo connection string (e.g., `mongodb://localhost:27017/collabsync-documentdb`)
- `REDIS_URL` — Redis connection string (e.g., `redis://localhost:6379`)
- `JWT_SECRET` — HMAC secret used to verify JWTs
- `JWT_EXPIRES_IN` — JWT expiry (e.g., `7d`)
- `KAFKA_BROKERS` — Comma-delimited brokers (e.g., `localhost:9092`)
- `KAFKA_CLIENT_ID` — Kafka client id (default `document-service`)
- `KAFKA_GROUP_ID` — Kafka group id (default `document-service-group`)

> Note: The `.env.example` in this repository provides container-oriented defaults. Ensure `KAFKA_BROKERS` is set if your environment uses `KAFKA_BROKER`.

## Setup (Docker)
### Build & Run
- Build: `docker build -t collabsync-document-service ./document-service`
- Run: `docker run --rm -p 4002:4002 --env-file ./.env collabsync-document-service`

Dockerfile highlights:
- Base image: `node:18-alpine`
- `WORKDIR /app`, copies `package*.json`, installs deps
- Copies `src` and `tsconfig.json`
- Exposes port `4002`
- Command: `npm run dev`

## Kafka Topics
- `document.created` — emitted after successful creation
- `document.updated` — emitted after successful update
- `document.deleted` — emitted after successful soft delete

Payload example:
```json
{ "id": "<docId>", "ownerId": "<ownerId>", "timestamp": 1690000000000 }
```

## Example Requests
Assume `PORT=4002` and `base=http://localhost:4002/api/v1/documents`.

- Generate a JWT (Node snippet):
```js
const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: '507f1f77bcf86cd799439011', email: 'user@example.com' }, 'testsecret', { expiresIn: '1h' });
```

- Create
```bash
curl -X POST "$base" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Project Plan", "content": "Initial draft"}'
```

- List
```bash
curl -X GET "$base" \
  -H "Authorization: Bearer $TOKEN"
```

- Get by id
```bash
curl -X GET "$base/64b0f0e76b6c6c5e9a42f111" \
  -H "Authorization: Bearer $TOKEN"
```

- Update
```bash
curl -X PUT "$base/64b0f0e76b6c6c5e9a42f111" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Project Plan (Updated)", "content": "Updated draft"}'
```

- Delete
```bash
curl -X DELETE "$base/64b0f0e76b6c6c5e9a42f111" \
  -H "Authorization: Bearer $TOKEN"
```

## Postman Collection
- Import `CollabSync-DocumentService.postman_collection.json` (included in repo).
- Set environment variables: `baseUrl` and `jwt`.

## Testing
- Jest + Supertest integration tests are included:
  - In-memory MongoDB for isolation.
  - Redis and Kafka are mocked in tests.
- Run: `npm test`

## Access Control
- Owner has full read/write access.
- `sharedWith`: users with `read` or `write` permission; write required for update/delete.
- ACL enforced by `requireDocumentAccess` middleware on `GET /:id`, `PUT /:id`, `DELETE /:id`.

## Error Responses
- Missing/invalid JWT: `403 { status: 'error', message }`
- Not found: `404 { status: 'error', message: 'Document not found' }`
- Validation errors: `400 { status: 'error', message }`
- Unauthorized ACL: `403 { status: 'error', message }`

---
For questions or improvements, feel free to open an issue or PR.