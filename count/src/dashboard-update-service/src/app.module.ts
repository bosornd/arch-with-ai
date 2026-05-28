import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Kafka } from 'kafkajs';
import Redis from 'ioredis';
import { HealthController } from './health.controller';
import { DashboardSSEController } from './logic/dashboard/controller/dashboard-sse.controller';
import { DashboardUpdater } from './logic/dashboard/updater/dashboard-updater';
import { SSEHandler } from './logic/dashboard/sse/sse-handler';
import { DashboardEventHandler } from './logic/dashboard/event/dashboard-event-handler';
import { KafkaConsumerService } from './logic/dashboard/kafka/kafka-consumer';
import { CountValueRepositoryImpl } from '@count/common-count-value';
import { CountValueServiceImpl } from '@count/common-count-value';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [HealthController, DashboardSSEController],
  providers: [
    {
      provide: 'KAFKA_CLIENT',
      useFactory: () => {
        return new Kafka({
          clientId: 'dashboard-update-service',
          brokers: (process.env.KAFKA_BROKERS || 'kafka-service:9092').split(','),
        });
      },
    },
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || 'redis-service',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
        });
      },
    },
    {
      provide: 'ICountValueRepository',
      useFactory: (redis: Redis) => {
        return new CountValueRepositoryImpl(redis);
      },
      inject: ['REDIS_CLIENT'],
    },
    {
      provide: 'ICountValueService',
      useFactory: (repository: any) => {
        return new CountValueServiceImpl(repository);
      },
      inject: ['ICountValueRepository'],
    },
    SSEHandler,
    DashboardEventHandler,
    DashboardUpdater,
    KafkaConsumerService,
  ],
})
export class AppModule {}
