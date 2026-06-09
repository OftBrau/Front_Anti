import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private client!: Client;

  connect(onConnected: () => void) {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      onConnect: onConnected,
    });
    this.client.activate();
  }

  subscribe(topic: string, callback: (data: any) => void) {
    this.client.subscribe(topic, msg => callback(JSON.parse(msg.body)));
  }

  disconnect() {
    this.client?.deactivate();
  }
}
