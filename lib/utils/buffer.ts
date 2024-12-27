export function serializeToBuffer(data: any): Buffer {
  return Buffer.from(JSON.stringify(data));
}

export function deserializeFromBuffer<T>(buffer: Buffer): T {
  return JSON.parse(buffer.toString());
}
