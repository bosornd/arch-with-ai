import { Controller, Get, Param } from '@nestjs/common';
import { CountReadAdapter } from '../adapter/count-read.adapter';
import { CountReadResponseDto } from '../dto/count-read-response.dto';

@Controller('api/v1/counts')
export class CountReadController {
  constructor(private readonly adapter: CountReadAdapter) {}

  @Get(':id')
  async findById(@Param('id') id: string): Promise<CountReadResponseDto> {
    return this.adapter.findById(id);
  }
}
