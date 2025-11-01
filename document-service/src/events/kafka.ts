import { Kafka, Consumer, Producer } from 'kafkajs';
import { KAFKA_BROKERS, KAFKA_CLIENT_ID, KAFKA_GROUP_ID } from '../config';

let kafka: Kafka | null = null;
let producer: Producer | null = null;
let consumer: Consumer | null = null;

export const initKafka = async () => {
  kafka = new Kafka({ clientId: KAFKA_CLIENT_ID, brokers: KAFKA_BROKERS });
  producer = kafka.producer();
  consumer = kafka.consumer({ groupId: KAFKA_GROUP_ID });

  await producer.connect();
  await consumer.connect();
};

export const getProducer = () => {
  if (!producer) throw new Error('Kafka producer not initialized');
  return producer;
};

export const getConsumer = () => {
  if (!consumer) throw new Error('Kafka consumer not initialized');
  return consumer;
};