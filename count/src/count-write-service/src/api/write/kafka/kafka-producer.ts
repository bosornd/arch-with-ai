import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit {
  private producer: Producer | null = null;
  private readonly topic = process.env.KAFKA_TOPIC_COUNT_UPDATES || 'count-updates';

  constructor(
    @Inject('KAFKA_CLIENT')
    private readonly kafka: Kafka,
  ) {}

  async onModuleInit() {
    // Kafka가 완전히 시작될 때까지 초기 대기
    await this.sleep(5000);
    
    let retries = 0;
    const maxRetries = 10;
    
    while (retries < maxRetries) {
      try {
        this.producer = this.kafka.producer({
          retry: {
            initialRetryTime: 1000,
            retries: 8,
            multiplier: 2,
            maxRetryTime: 30000,
          },
        });
        
        await this.producer.connect();
        console.log('Kafka producer connected');
        break;
      } catch (error) {
        retries++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Kafka producer connection attempt ${retries}/${maxRetries} failed:`, errorMessage);
        
        if (retries >= maxRetries) {
          console.error('Failed to initialize Kafka producer after max retries');
          // 서비스는 계속 실행되지만 이벤트 발행 기능은 비활성화
        } else {
          await this.sleep(3000);
        }
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async publishCountUpdate(countId: string, value: number): Promise<void> {
    if (!this.producer) {
      console.warn('Kafka producer not initialized');
      return;
    }

    try {
      const message = {
        type: 'count_updated',
        countId,
        value,
        timestamp: new Date().toISOString(),
      };

      await this.producer.send({
        topic: this.topic,
        messages: [
          {
            key: countId,
            value: JSON.stringify(message),
          },
        ],
      });

      console.log(`Published count update: ${countId} = ${value}`);
    } catch (error) {
      console.error('Error publishing to Kafka:', error);
    }
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect();
    }
  }
}
