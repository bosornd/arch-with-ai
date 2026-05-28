import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ICountInfoRepository } from './count-info.repository.interface';
import { CountInfoEntity } from '../entity/count-info.entity';

@Injectable()
export class CountInfoRepositoryImpl implements ICountInfoRepository {
  constructor(
    private readonly repository: Repository<CountInfoEntity>,
  ) {}

  async findById(id: string): Promise<CountInfoEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAll(): Promise<CountInfoEntity[]> {
    return this.repository.find();
  }

  async save(entity: CountInfoEntity): Promise<CountInfoEntity> {
    return this.repository.save(entity);
  }

  async update(id: string, entity: Partial<CountInfoEntity>): Promise<void> {
    await this.repository.update(id, entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }
}
