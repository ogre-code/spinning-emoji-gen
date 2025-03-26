declare module 'gif.js-upgrade' {
  interface GifOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    workerScript?: string;
    background?: string;
    dither?: boolean;
  }

  interface FrameOptions {
    delay?: number;
    copy?: boolean;
  }

  class GIF {
    constructor(options: GifOptions);
    addFrame(element: HTMLCanvasElement, options?: FrameOptions): void;
    on(event: 'progress', callback: (progress: number) => void): void;
    on(event: 'finished', callback: (blob: Blob) => void): void;
    render(): void;
  }

  export default GIF;
} 