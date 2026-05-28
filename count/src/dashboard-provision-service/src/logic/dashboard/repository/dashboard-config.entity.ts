import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('dashboard_config')
export class DashboardConfigEntity {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id!: string;

  @Column({ type: 'json' })
  countIds!: string[];

  @Column({ type: 'json', nullable: true })
  analysisDataIds!: string[] | null;

  @Column({ type: 'json' })
  layout!: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
