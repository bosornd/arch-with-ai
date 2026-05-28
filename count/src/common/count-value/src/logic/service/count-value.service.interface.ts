import { CountValueEntity, CountValueHistoryEntity } from '../../infra/entity/count-value.entity';

export interface ICountValueService {
  findById(id: string): Promise<CountValueEntity | null>;
  create(id: string, initialValue: number): Promise<CountValueEntity>;
  update(id: string, value: number): Promise<CountValueEntity>;
  delete(id: string): Promise<void>;
  increment(id: string, amount: number): Promise<number>;
  decrement(id: string, amount: number): Promise<number>;
  findHistory(id: string, startTime: Date, endTime: Date): Promise<CountValueHistoryEntity[]>;
}
