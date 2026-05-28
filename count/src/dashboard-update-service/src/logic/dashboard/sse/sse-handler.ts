import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class SSEHandler {
  private clients: Map<string, Response> = new Map();

  addClient(clientId: string, response: Response): void {
    // SSE 헤더 설정
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('X-Accel-Buffering', 'no');

    this.clients.set(clientId, response);

    // 연결 종료 시 클라이언트 제거
    response.on('close', () => {
      this.clients.delete(clientId);
    });
  }

  sendUpdate(clientId: string, data: any, eventType?: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      const message = this.formatSSEMessage(data, eventType);
      client.write(message);
    }
  }

  sendToAll(data: any, eventType?: string): void {
    const message = this.formatSSEMessage(data, eventType);
    this.clients.forEach((client) => {
      client.write(message);
    });
  }

  private formatSSEMessage(data: any, eventType?: string): string {
    let message = '';
    
    // 이벤트 타입이 있으면 event: 필드 추가
    if (eventType) {
      message += `event: ${eventType}\n`;
    } else if (data.type) {
      // data에 type이 있으면 그것을 이벤트 타입으로 사용
      message += `event: ${data.type}\n`;
    }
    
    // data 필드
    message += `data: ${JSON.stringify(data)}\n\n`;
    
    return message;
  }

  removeClient(clientId: string): void {
    this.clients.delete(clientId);
  }

  getClientCount(): number {
    return this.clients.size;
  }
}
