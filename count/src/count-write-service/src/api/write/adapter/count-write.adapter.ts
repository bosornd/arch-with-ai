import { Injectable, Inject } from '@nestjs/common';
import { ICountInfoService } from '@count/common-count-info';
import { ICountValueService } from '@count/common-count-value';
import { CountWriteResponseDto } from '../dto/count-write-response.dto';
import { KafkaProducerService } from '../kafka/kafka-producer';

export interface WriteRequest {
  id: string;
  type: 'increment' | 'decrement' | 'set';
  amount?: number;
  value?: number;
  description?: string;
}

@Injectable()
export class CountWriteAdapter {
  constructor(
    @Inject('ICountInfoService')
    private readonly countInfoService: ICountInfoService,
    @Inject('ICountValueService')
    private readonly countValueService: ICountValueService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async handleWrite(request: WriteRequest): Promise<CountWriteResponseDto> {
    // CountInfo 존재 확인, 없으면 생성
    let countInfo = await this.countInfoService.findById(request.id);
    if (!countInfo) {
      // 새로운 Count 생성
      countInfo = await this.countInfoService.create(request.id, request.description);
    } else if (request.description !== undefined) {
      // 기존 Count의 description 업데이트
      await this.countInfoService.update(request.id, request.description);
    }

    let newValue: number;

    switch (request.type) {
      case 'increment':
        if (request.amount === undefined) {
          throw new Error('Amount is required for increment');
        }
        newValue = await this.countValueService.increment(request.id, request.amount);
        break;
      case 'decrement':
        if (request.amount === undefined) {
          throw new Error('Amount is required for decrement');
        }
        newValue = await this.countValueService.decrement(request.id, request.amount);
        break;
      case 'set':
        if (request.value === undefined) {
          throw new Error('Value is required for set');
        }
        // CountValue가 없으면 생성, 있으면 업데이트
        const existing = await this.countValueService.findById(request.id);
        if (existing) {
          await this.countValueService.update(request.id, request.value);
        } else {
          await this.countValueService.create(request.id, request.value);
        }
        const updated = await this.countValueService.findById(request.id);
        if (!updated) {
          throw new Error(`Count value not found: ${request.id}`);
        }
        newValue = updated.value;
        break;
      default:
        throw new Error(`Unknown write type: ${request.type}`);
    }

    const countValue = await this.countValueService.findById(request.id);
    if (!countValue) {
      throw new Error(`Count value not found: ${request.id}`);
    }

    // Kafka로 이벤트 발행
    await this.kafkaProducer.publishCountUpdate(request.id, newValue);

    return {
      id: request.id,
      value: newValue,
      updatedAt: countValue.updatedAt,
    };
  }
}
