import { Injectable, Inject } from '@nestjs/common';
import { ICountInfoService } from './count-info.service.interface';
import { ICountInfoRepository } from '../../infra/repository/count-info.repository.interface';
import { CountInfoEntity } from '../../infra/entity/count-info.entity';

@Injectable()
export class CountInfoServiceImpl implements ICountInfoService {
  constructor(
    @Inject('ICountInfoRepository')
    private readonly repository: ICountInfoRepository,
  ) {}

  async findById(id: string): Promise<CountInfoEntity | null> {
    return this.repository.findById(id);
  }

  async findAll(): Promise<CountInfoEntity[]> {
    return this.repository.findAll();
  }

  async create(id: string, description?: string): Promise<CountInfoEntity> {
    const entity = new CountInfoEntity();
    entity.id = id;
    entity.description = description || null;
    return this.repository.save(entity);
  }

  async update(id: string, description?: string): Promise<void> {
    await this.repository.update(id, { description });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.repository.exists(id);
  }
}
