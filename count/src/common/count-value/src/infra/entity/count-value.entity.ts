export interface CountValueEntity {
  id: string;
  value: number;
  updatedAt: Date;
}

export interface CountValueHistoryEntity {
  id: string;
  value: number;
  timestamp: Date;
}
