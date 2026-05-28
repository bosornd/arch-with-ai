import { CountInfoEntity } from '../entity/count-info.entity';

export interface ICountInfoRepository {
  findById(id: string): Promise<CountInfoEntity | null>;
  findAll(): Promise<CountInfoEntity[]>;
  save(entity: CountInfoEntity): Promise<CountInfoEntity>;
  update(id: string, entity: Partial<CountInfoEntity>): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
