export interface Like {
  id: number;
  x: number;
  y: number;
}

export interface Map {
  key?: string;
  lat: number;
  lng: number;
  defaultZoom: number;
  watchId: number | null;
}

export interface Member {
  peerId: string;
  stream?: any;
  dataURL?: string;
}

export interface Pointing {
  audience: Member;
  x: number;
  y: number;
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
}
