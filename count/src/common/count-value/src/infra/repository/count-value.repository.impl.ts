import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ICountValueRepository } from './count-value.repository.interface';
import { CountValueEntity, CountValueHistoryEntity } from '../entity/count-value.entity';

@Injectable()
export class CountValueRepositoryImpl implements ICountValueRepository {
  private readonly redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  private getKey(id: string): string {
    return `count:${id}`;
  }

  private getHistoryKey(id: string): string {
    return `count:${id}:history`;
  }

  async findById(id: string): Promise<CountValueEntity | null> {
    const key = this.getKey(id);
    const value = await this.redis.get(key);
    
    if (value === null) {
      return null;
    }

    const updatedAt = await this.redis.get(`${key}:updatedAt`);
    
    return {
      id,
      value: parseInt(value, 10),
      updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
    };
  }

  async save(entity: CountValueEntity): Promise<CountValueEntity> {
    const key = this.getKey(entity.id);
    const pipeline = this.redis.pipeline();
    
    pipeline.set(key, entity.value.toString());
    pipeline.set(`${key}:updatedAt`, entity.updatedAt.toISOString());
    
    // 히스토리 저장
    const historyKey = this.getHistoryKey(entity.id);
    pipeline.zadd(historyKey, Date.now(), JSON.stringify({
      value: entity.value,
      timestamp: entity.updatedAt.toISOString(),
    }));
    
    await pipeline.exec();
    
    return entity;
  }

  async delete(id: string): Promise<void> {
    const key = this.getKey(id);
    const historyKey = this.getHistoryKey(id);
    
    await this.redis.del(key, `${key}:updatedAt`, historyKey);
  }

  async increment(id: string, amount: number): Promise<number> {
    const key = this.getKey(id);
    const newValue = await this.redis.incrby(key, amount);
    
    // 히스토리 저장
    const historyKey = this.getHistoryKey(id);
    await this.redis.zadd(historyKey, Date.now(), JSON.stringify({
      value: newValue,
      timestamp: new Date().toISOString(),
    }));
    
    await this.redis.set(`${key}:updatedAt`, new Date().toISOString());
    
    return newValue;
  }

  async decrement(id: string, amount: number): Promise<number> {
    const key = this.getKey(id);
    const newValue = await this.redis.decrby(key, amount);
    
    // 히스토리 저장
    const historyKey = this.getHistoryKey(id);
    await this.redis.zadd(historyKey, Date.now(), JSON.stringify({
      value: newValue,
      timestamp: new Date().toISOString(),
    }));
    
    await this.redis.set(`${key}:updatedAt`, new Date().toISOString());
    
    return newValue;
  }

  async set(id: string, value: number): Promise<void> {
    const key = this.getKey(id);
    const pipeline = this.redis.pipeline();
    
    pipeline.set(key, value.toString());
    pipeline.set(`${key}:updatedAt`, new Date().toISOString());
    
    // 히스토리 저장
    const historyKey = this.getHistoryKey(id);
    pipeline.zadd(historyKey, Date.now(), JSON.stringify({
      value,
      timestamp: new Date().toISOString(),
    }));
    
    await pipeline.exec();
  }

  async findHistory(id: string, startTime: Date, endTime: Date): Promise<CountValueHistoryEntity[]> {
    const historyKey = this.getHistoryKey(id);
    const start = startTime.getTime();
    const end = endTime.getTime();
    
    const items = await this.redis.zrangebyscore(historyKey, start, end);
    
    return items.map(item => {
      const data = JSON.parse(item);
      return {
        id,
        value: data.value,
        timestamp: new Date(data.timestamp),
      };
    });
  }
}
