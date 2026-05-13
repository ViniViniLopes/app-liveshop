export type StreamStatus = 'idle' | 'preparing' | 'connecting' | 'live' | 'reconnecting' | 'ended' | 'failed';

export interface LiveStreamConfig {
  rtmpUrl: string;
  streamKey: string;
  videoBitrate?: number;
  audioBitrate?: number;
  resolution?: '720p' | '1080p';
}

export interface LiveStreamModule {
  startStream(config: LiveStreamConfig): Promise<void>;
  stopStream(): Promise<void>;
  switchCamera(): Promise<void>;
  getStatus(): StreamStatus;
  onStatusChange(callback: (status: StreamStatus) => void): void;
}

// Mock implementation for development
export class MockLiveStreamModule implements LiveStreamModule {
  private status: StreamStatus = 'idle';
  private statusCallback?: (status: StreamStatus) => void;

  async startStream(config: LiveStreamConfig) {
    this.updateStatus('preparing');
    setTimeout(() => this.updateStatus('connecting'), 1000);
    setTimeout(() => this.updateStatus('live'), 3000);
  }

  async stopStream() {
    this.updateStatus('ended');
  }

  async switchCamera() {
    console.log('Switched camera');
  }

  getStatus() {
    return this.status;
  }

  onStatusChange(callback: (status: StreamStatus) => void) {
    this.statusCallback = callback;
  }

  private updateStatus(newStatus: StreamStatus) {
    this.status = newStatus;
    this.statusCallback?.(newStatus);
  }
}
