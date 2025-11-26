// src/app/api/devices/route.ts
/**
 * [파일 역할]
 * - 디바이스 목록 조회 및 생성 API
 * - GET: 현재 사용자의 모든 디바이스 목록 조회
 * - POST: 새 디바이스 생성
 *
 * [사용되는 위치]
 * - 홈 페이지에서 디바이스 목록 로드 시 사용
 * - 디바이스 추가 시 사용
 *
 * [주의사항]
 * - 인증이 필요한 엔드포인트
 * - 사용자별로 디바이스를 분리하여 관리
 * - 디바이스 타입: manager | light | scent | speaker
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { validateRequiredFields } from "@/lib/utils/validation";

/**
 * GET /api/devices
 *
 * 디바이스 목록 조회
 *
 * 응답:
 * - 성공: { devices: Device[] }
 * - 실패: { error: "ERROR_CODE", message: "에러 메시지" }
 */
export async function GET(_request: NextRequest) {
  try {
    // 1. 세션 검증
    const sessionOrError = await requireAuth();
    if (sessionOrError instanceof NextResponse) {
      return sessionOrError; // 401 응답 반환
    }
    const session = sessionOrError;

    // 2. 사용자의 모든 디바이스 조회
    const devices = await prisma.device.findMany({
      where: {
        userId: parseInt(session.user.id),
        status: "active", // 활성화된 디바이스만 조회
      },
      orderBy: {
        registeredAt: "desc",
      },
    });

    // 3. 디바이스 데이터 포맷팅
    const formattedDevices = devices.map((device) => ({
      id: device.id.toString(),
      type: device.type,
      name: device.name,
      battery: device.battery ?? 100,
      power: device.power ?? true,
      output: formatDeviceOutput(device),
    }));

    return NextResponse.json({ devices: formattedDevices });
  } catch (error) {
    console.error("[GET /api/devices] 디바이스 목록 조회 실패:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "디바이스 목록 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/devices
 *
 * 디바이스 생성
 *
 * 요청:
 * - type (required): 디바이스 타입 ("manager" | "light" | "scent" | "speaker")
 * - name (optional): 디바이스 이름 (미제공 시 자동 생성)
 *
 * 응답:
 * - 성공: { device: Device }
 * - 실패: { error: "ERROR_CODE", message: "에러 메시지" }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 세션 검증
    const sessionOrError = await requireAuth();
    if (sessionOrError instanceof NextResponse) {
      return sessionOrError; // 401 응답 반환
    }
    const session = sessionOrError;

    // 2. 요청 본문 파싱
    const body = await request.json();
    const validation = validateRequiredFields(body, ["type"]);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "INVALID_INPUT",
          message: "디바이스 타입은 필수 입력 항목입니다.",
        },
        { status: 400 }
      );
    }

    const { type, name } = body;

    // 3. 디바이스 타입 검증
    const validTypes = ["manager", "light", "scent", "speaker"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          error: "INVALID_INPUT",
          message: "유효하지 않은 디바이스 타입입니다.",
        },
        { status: 400 }
      );
    }

    // 4. 디바이스 이름 자동 생성 (미제공 시)
    let deviceName = name;
    if (!deviceName) {
      const existingDevices = await prisma.device.count({
        where: {
          userId: parseInt(session.user.id),
          type,
          status: "active",
        },
      });
      const typeNames: Record<string, string> = {
        manager: "Mood Manager",
        light: "Smart Light",
        scent: "Scent Diffuser",
        speaker: "Smart Speaker",
      };
      deviceName = `${typeNames[type]} ${existingDevices + 1}`;
    }

    // 5. 디바이스 기본 설정값
    const defaultSettings = getDefaultDeviceSettings(type);

    // 6. 디바이스 생성
    const device = await prisma.device.create({
      data: {
        userId: parseInt(session.user.id),
        name: deviceName,
        type,
        status: "active",
        battery: defaultSettings.battery,
        power: defaultSettings.power,
        brightness: defaultSettings.brightness,
        color: defaultSettings.color,
        scentType: defaultSettings.scentType,
        scentLevel: defaultSettings.scentLevel,
        scentInterval: defaultSettings.scentInterval,
        volume: defaultSettings.volume,
        nowPlaying: defaultSettings.nowPlaying,
      },
    });

    // 7. 응답 데이터 포맷팅
    const formattedDevice = {
      id: device.id.toString(),
      type: device.type,
      name: device.name,
      battery: device.battery ?? 100,
      power: device.power ?? true,
      output: formatDeviceOutput(device),
    };

    return NextResponse.json({ device: formattedDevice });
  } catch (error) {
    console.error("[POST /api/devices] 디바이스 생성 실패:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "디바이스 생성 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

/**
 * 디바이스 타입별 기본 설정값 반환
 */
function getDefaultDeviceSettings(type: string) {
  const baseSettings = {
    battery: 100,
    power: true,
    brightness: null,
    color: null,
    scentType: null,
    scentLevel: null,
    scentInterval: null,
    volume: null,
    nowPlaying: null,
  };

  switch (type) {
    case "manager":
      return {
        ...baseSettings,
        brightness: 85,
        color: "#FFD966",
        scentType: "Lavender",
        scentLevel: 7,
        scentInterval: 30,
        volume: 65,
        nowPlaying: "Calm Breeze",
      };
    case "light":
      return {
        ...baseSettings,
        brightness: 75,
        color: "#FFD966",
      };
    case "scent":
      return {
        ...baseSettings,
        scentType: "Lavender",
        scentLevel: 7,
        scentInterval: 30,
      };
    case "speaker":
      return {
        ...baseSettings,
        volume: 65,
        nowPlaying: "Calm Breeze",
      };
    default:
      return baseSettings;
  }
}

/**
 * 디바이스 출력 데이터 포맷팅
 */
function formatDeviceOutput(device: {
  type: string;
  brightness: number | null;
  color: string | null;
  scentType: string | null;
  scentLevel: number | null;
  scentInterval: number | null;
  volume: number | null;
  nowPlaying: string | null;
}) {
  const output: Record<string, unknown> = {};

  // 조명 관련 (light, manager)
  if (device.type === "light" || device.type === "manager") {
    if (device.brightness !== null) output.brightness = device.brightness;
    if (device.color !== null) output.color = device.color;
  }

  // 향 관련 (scent, manager)
  if (device.type === "scent" || device.type === "manager") {
    if (device.scentType !== null) output.scentType = device.scentType;
    if (device.scentLevel !== null) output.scentLevel = device.scentLevel;
    if (device.scentInterval !== null)
      output.scentInterval = device.scentInterval;
  }

  // 스피커 관련 (speaker, manager)
  if (device.type === "speaker" || device.type === "manager") {
    if (device.volume !== null) output.volume = device.volume;
    if (device.nowPlaying !== null) output.nowPlaying = device.nowPlaying;
  }

  return output;
}
