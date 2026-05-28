import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardConfigEntity } from './dashboard-config.entity';

@Injectable()
export class DashboardConfigRepository {
  constructor(
    @InjectRepository(DashboardConfigEntity)
    private readonly repository: Repository<DashboardConfigEntity>,
  ) {}

  async findById(id: string): Promise<DashboardConfigEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async save(entity: DashboardConfigEntity): Promise<DashboardConfigEntity> {
    return this.repository.save(entity);
  }

  async update(id: string, entity: Partial<DashboardConfigEntity>): Promise<void> {
    await this.repository.update(id, entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
