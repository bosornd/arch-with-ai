import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { DashboardEventHandler } from '../event/dashboard-event-handler';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private consumer: Consumer | null = null;
  private readonly topic = process.env.KAFKA_TOPIC_COUNT_UPDATES || 'count-updates';

  constructor(
    @Inject('KAFKA_CLIENT')
    private readonly kafka: Kafka,
    private readonly eventHandler: DashboardEventHandler,
  ) {}

  async onModuleInit() {
    console.log('[Kafka Consumer] onModuleInit called, starting background initialization');
    // Kafka 연결을 백그라운드에서 비동기로 실행 (앱 시작을 blocking하지 않음)
    this.initializeKafkaConsumer().catch((error) => {
      console.error('[Kafka Consumer] Initialization failed:', error);
    });
  }

  private async initializeKafkaConsumer() {
    console.log('[Kafka Consumer] initializeKafkaConsumer started, waiting 5 seconds...');
    // Kafka가 완전히 시작될 때까지 초기 대기
    await this.sleep(5000);
    console.log('[Kafka Consumer] Starting connection attempts...');
    
    let retries = 0;
    const maxRetries = 10;
    
    while (retries < maxRetries) {
      try {
        this.consumer = this.kafka.consumer({ 
          groupId: 'dashboard-update-group',
          retry: {
            initialRetryTime: 1000,
            retries: 8,
            multiplier: 2,
            maxRetryTime: 30000,
          },
        });
        
        await this.consumer.connect();
        await this.consumer.subscribe({ topic: this.topic, fromBeginning: false });

        await this.consumer.run({
          eachMessage: async (payload: EachMessagePayload) => {
            await this.handleMessage(payload);
          },
        });

        console.log(`Kafka consumer connected and listening to topic: ${this.topic}`);
        break;
      } catch (error) {
        retries++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Kafka connection attempt ${retries}/${maxRetries} failed:`, errorMessage);
        
        if (retries >= maxRetries) {
          console.error('Failed to initialize Kafka consumer after max retries');
          // 서비스는 계속 실행되지만 Kafka 기능은 비활성화
        } else {
          await this.sleep(3000);
        }
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    try {
      const { message } = payload;
      const value = message.value?.toString();
      
      if (!value) {
        console.warn('[Kafka Consumer] Received empty message');
        return;
      }

      console.log(`[Kafka Consumer] Received message: ${value}`);
      const event = JSON.parse(value);
      
      // Count 업데이트 이벤트 처리
      if (event.type === 'count_updated') {
        console.log(`[Kafka Consumer] Processing count_updated: ${event.countId} = ${event.value}`);
        await this.eventHandler.handleCountUpdate({
          countId: event.countId,
          newValue: event.value,
          timestamp: new Date(event.timestamp),
        });
      } else {
        console.log(`[Kafka Consumer] Ignoring event type: ${event.type}`);
      }
    } catch (error) {
      console.error('[Kafka Consumer] Error handling message:', error);
    }
  }

  async onModuleDestroy() {
    if (this.consumer) {
      await this.consumer.disconnect();
    }
  }
}
