import { Controller, Get, Post, Put, Param, Body, HttpCode, HttpStatus, HttpException, Inject } from '@nestjs/common';
import { CountWriteAdapter, WriteRequest } from '../adapter/count-write.adapter';
import { IncrementCountRequestDto, DecrementCountRequestDto, SetCountRequestDto } from '../dto/count-write-request.dto';
import { CountWriteResponseDto } from '../dto/count-write-response.dto';
import { ICountInfoService } from '@count/common-count-info';
import { ICountValueService } from '@count/common-count-value';

@Controller('api/v1/counts')
export class CountWriteController {
  constructor(
    private readonly adapter: CountWriteAdapter,
    @Inject('ICountInfoService')
    private readonly countInfoService: ICountInfoService,
    @Inject('ICountValueService')
    private readonly countValueService: ICountValueService,
  ) {}

  @Post(':id/increment')
  @HttpCode(HttpStatus.OK)
  async increment(
    @Param('id') id: string,
    @Body() dto: IncrementCountRequestDto,
  ): Promise<CountWriteResponseDto> {
    const request: WriteRequest = {
      id,
      type: 'increment',
      amount: dto.amount,
    };
    return this.adapter.handleWrite(request);
  }

  @Post(':id/decrement')
  @HttpCode(HttpStatus.OK)
  async decrement(
    @Param('id') id: string,
    @Body() dto: DecrementCountRequestDto,
  ): Promise<CountWriteResponseDto> {
    const request: WriteRequest = {
      id,
      type: 'decrement',
      amount: dto.amount,
    };
    return this.adapter.handleWrite(request);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async set(
    @Param('id') id: string,
    @Body() dto: SetCountRequestDto,
  ): Promise<CountWriteResponseDto> {
    const request: WriteRequest = {
      id,
      type: 'set',
      value: dto.value,
      description: dto.description,
    };
    return this.adapter.handleWrite(request);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<any> {
    // Read 요청 처리 (CQRS Read Side)
    const [countInfo, countValue] = await Promise.all([
      this.countInfoService.findById(id),
      this.countValueService.findById(id),
    ]);

    if (!countInfo) {
      throw new HttpException(`Count not found: ${id}`, HttpStatus.NOT_FOUND);
    }

    if (!countValue) {
      throw new HttpException(`Count value not found: ${id}`, HttpStatus.NOT_FOUND);
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
