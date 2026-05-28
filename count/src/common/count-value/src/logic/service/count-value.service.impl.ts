import { Injectable, Inject } from '@nestjs/common';
import { ICountValueService } from './count-value.service.interface';
import { ICountValueRepository } from '../../infra/repository/count-value.repository.interface';
import { CountValueEntity, CountValueHistoryEntity } from '../../infra/entity/count-value.entity';

@Injectable()
export class CountValueServiceImpl implements ICountValueService {
  constructor(
    @Inject('ICountValueRepository')
    private readonly repository: ICountValueRepository,
  ) {}

  async findById(id: string): Promise<CountValueEntity | null> {
    return this.repository.findById(id);
  }

  async create(id: string, initialValue: number): Promise<CountValueEntity> {
    const entity: CountValueEntity = {
      id,
      value: initialValue,
      updatedAt: new Date(),
    };
    return this.repository.save(entity);
  }

  async update(id: string, value: number): Promise<CountValueEntity> {
    await this.repository.set(id, value);
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new Error(`Count value not found: ${id}`);
    }
    return entity;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async increment(id: string, amount: number): Promise<number> {
    return this.repository.increment(id, amount);
  }

  async decrement(id: string, amount: number): Promise<number> {
    return this.repository.decrement(id, amount);
  }

  async findHistory(id: string, startTime: Date, endTime: Date): Promise<CountValueHistoryEntity[]> {
    return this.repository.findHistory(id, startTime, endTime);
  }
}
