import { CountInfoEntity } from '../../infra/entity/count-info.entity';

export interface ICountInfoService {
  findById(id: string): Promise<CountInfoEntity | null>;
  findAll(): Promise<CountInfoEntity[]>;
  create(id: string, description?: string): Promise<CountInfoEntity>;
  update(id: string, description?: string): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
