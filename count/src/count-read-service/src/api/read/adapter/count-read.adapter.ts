import { Injectable, Inject } from '@nestjs/common';
import { ICountInfoService } from '@count/common-count-info';
import { ICountValueService } from '@count/common-count-value';
import { CountReadResponseDto } from '../dto/count-read-response.dto';

@Injectable()
export class CountReadAdapter {
  constructor(
    @Inject('ICountInfoService')
    private readonly countInfoService: ICountInfoService,
    @Inject('ICountValueService')
    private readonly countValueService: ICountValueService,
  ) {}

  async findById(id: string): Promise<CountReadResponseDto> {
    // 병렬 조회
    const [countInfo, countValue] = await Promise.all([
      this.countInfoService.findById(id),
      this.countValueService.findById(id),
    ]);

    if (!countInfo) {
      throw new Error(`Count not found: ${id}`);
    }

    if (!countValue) {
      throw new Error(`Count value not found: ${id}`);
    }

    return {
      id,
      value: countValue.value,
      description: countInfo.description || undefined,
      updatedAt: countValue.updatedAt,
      createdAt: countInfo.createdAt,
    };
  }
}
