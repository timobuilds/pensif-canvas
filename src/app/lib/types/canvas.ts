export interface Point {
  x: number;
  y: number;
}

export type FrameType = 'sketch' | 'image' | 'model';

export interface Connection {
  id: string;
  from: string;
  to: string;
  points: Array<Point>;
}

export interface Frame {
  id: string;
  type: FrameType;
  position: Point;
  content: {
    sketch?: ImageData;
    image?: string;
    model?: string;
  };
  connections: Connection[];
}

export interface ApiUsage {
  fluxSchnell: { calls: number; spend: number };
  removeBg: { calls: number; spend: number };
  tripoSr: { calls: number; spend: number };
}

export interface Project {
  id: string;
  name: string;
  created: Date;
  lastModified: Date;
  canvas: {
    frames: Frame[];
    apiUsage: ApiUsage;
    spendLimit: number;
  };
}
