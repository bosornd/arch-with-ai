import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { CountReadController } from './api/read/controller/count-read.controller';
import { CountReadAdapter } from './api/read/adapter/count-read.adapter';
import { HealthController } from './health.controller';
import { CountInfoEntity } from '@count/common-count-info';
import { CountInfoRepositoryImpl } from '@count/common-count-info';
import { CountInfoServiceImpl } from '@count/common-count-info';
import { CountValueRepositoryImpl } from '@count/common-count-value';
import { CountValueServiceImpl } from '@count/common-count-value';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'postgresql-service',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      username: process.env.POSTGRES_USER || 'countuser',
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.COUNT_INFO_DB_NAME || 'countinfo',
      entities: [CountInfoEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([CountInfoEntity]),
  ],
  controllers: [CountReadController, HealthController],
  providers: [
    CountReadAdapter,
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
      provide: 'ICountInfoRepository',
      useFactory: (repository: any) => {
        return new CountInfoRepositoryImpl(repository);
      },
      inject: [getRepositoryToken(CountInfoEntity)],
    },
    {
      provide: 'ICountInfoService',
      useFactory: (repository: any) => {
        return new CountInfoServiceImpl(repository);
      },
      inject: ['ICountInfoRepository'],
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
  ],
})
export class AppModule {}
