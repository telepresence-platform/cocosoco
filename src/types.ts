export interface Map {
  key: string,
  lat: number,
  lng: number,
  defaultZoom: number,
}

export interface Member {
  peerId: string,
  stream: any,
}

export interface Pointing {
  audience: Member,
  x: number,
  y: number,
}

export interface Transform {
  x: number,
  y: number,
  scale: number,
}
