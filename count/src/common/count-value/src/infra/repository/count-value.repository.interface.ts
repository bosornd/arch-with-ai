import { CountValueEntity, CountValueHistoryEntity } from '../entity/count-value.entity';

export interface ICountValueRepository {
  findById(id: string): Promise<CountValueEntity | null>;
  save(entity: CountValueEntity): Promise<CountValueEntity>;
  delete(id: string): Promise<void>;
  increment(id: string, amount: number): Promise<number>;
  decrement(id: string, amount: number): Promise<number>;
  set(id: string, value: number): Promise<void>;
  findHistory(id: string, startTime: Date, endTime: Date): Promise<CountValueHistoryEntity[]>;
}
