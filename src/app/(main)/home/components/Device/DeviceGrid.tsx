/**
 * File: src/app/(main)/home/components/Device/DeviceGrid.tsx
 *
 * DeviceGrid Component
 *
 * 구성 요소:
 *  - DeviceCardFront / DeviceCardBack
 *  - AddDeviceCard
 *
 * Props:
 *  - devices: Device[]
 *  - onAddDevice()
 *  - onUpdateDevice()
 *  - onDeleteDevice()
 *
 * 역할:
 *  - 2×N 레이아웃
 *  - 어떤 카드가 뒤집혀 있는지 상태 관리
 */

import { useState } from "react";
import DeviceCardFront from "./DeviceCardFront";
import DeviceCardBack from "./DeviceCardBack";
import AddDeviceCard from "./AddDeviceCard";
import { Device } from "../../types/device";

interface DeviceGridProps {
  devices: Device[];
  onAddDevice: () => void;
  onUpdateDevice: (d: Device) => void;
  onDeleteDevice: (id: string) => void;
}

export default function DeviceGrid({
  devices,
  onAddDevice,
  onUpdateDevice,
  onDeleteDevice,
}: DeviceGridProps) {
  const [openedId, setOpenedId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      {devices.map((d) =>
        openedId === d.id ? (
          <DeviceCardBack
            key={d.id}
            device={d}
            onClose={() => setOpenedId(null)}
            onUpdateSettings={onUpdateDevice}
            onDelete={() => onDeleteDevice(d.id)}
          />
        ) : (
          <DeviceCardFront
            key={d.id}
            device={d}
            onClick={() => setOpenedId(d.id)}
            onTogglePower={() =>
              onUpdateDevice({ ...d, power: !d.power })
            }
          />
        )
      )}

      {/* Add Device Card */}
      <AddDeviceCard onAdd={() => onAddDevice()} />
    </div>
  );
}
