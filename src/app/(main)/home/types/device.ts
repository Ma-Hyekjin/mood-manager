/**
 * File: src/app/(main)/home/types/device.ts
 *
 * Device Type Definition
 */

export type DeviceType = "manager" | "light" | "scent" | "speaker";

export interface Device {
  id: string;
  type: DeviceType;
  name: string;

  battery: number; // 0~100
  power: boolean;

  // 출력값 (디바이스 타입별로 사용되는 필드만 세팅됨)
  output: {
    brightness?: number; // light
    color?: string;      // light RGB or HEX
    scentType?: string;  // scent preset
    scentLevel?: number; // scent intensity
    volume?: number;     // speaker volume
    nowPlaying?: string; // speaker now playing info
  };
}
