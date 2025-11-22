// ======================================================
// File: src/app/(main)/home/components/Device/DeviceGrid.tsx
// ======================================================

import { Device } from "../../types/device";
import DeviceCardSmall from "./DeviceCardSmall";
import DeviceCardExpanded from "./DeviceCardExpanded";
import AddDeviceCard from "./AddDeviceCard";

export default function DeviceGrid({
  devices,
  expandedId,
  setExpandedId,
  setDevices,
}: {
  devices: Device[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  setDevices: (fn: (prev: Device[]) => Device[]) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {devices.map((device) => {
        const isExpanded = expandedId === device.id;

        if (isExpanded)
          return (
            <div key={device.id} className="col-span-2 animate-grow">
              <DeviceCardExpanded
                device={device}
                onClose={() => setExpandedId(null)}
                onDelete={() =>
                  setDevices((prev: Device[]) =>
                    prev.filter((d) => d.id !== device.id)
                  )
                }
              />
            </div>
          );

        return (
          <DeviceCardSmall
            key={device.id}
            device={device}
            onClick={() => {
              if (isExpanded) return setExpandedId(null);
              setExpandedId(device.id);
            }}
          />
        );
      })}

      <AddDeviceCard onAdd={() => alert("디바이스 추가 예정")} />
    </div>
  );
}
