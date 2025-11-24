// ======================================================
// File: src/app/(auth)/register/components/PersonalInfoSection.tsx
// ======================================================

import { User } from "lucide-react";

interface PersonalInfoSectionProps {
  familyName: string;
  name: string;
  onFamilyNameChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onErrorClear: () => void;
  onEnterKey: () => void;
}

export default function PersonalInfoSection({
  familyName,
  name,
  onFamilyNameChange,
  onNameChange,
  onErrorClear,
  onEnterKey,
}: PersonalInfoSectionProps) {
  return (
    <>
      {/* Family Name */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-gray-600">Family Name</label>
        <div className="flex items-center px-3 py-2 border rounded-md">
          <User size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Family name"
            className="w-full outline-none"
            value={familyName}
            onChange={(e) => {
              onFamilyNameChange(e.target.value);
              onErrorClear();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") onEnterKey();
            }}
          />
        </div>
      </div>

      {/* Name */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-gray-600">Name</label>
        <div className="flex items-center px-3 py-2 border rounded-md">
          <User size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Name"
            className="w-full outline-none"
            value={name}
            onChange={(e) => {
              onNameChange(e.target.value);
              onErrorClear();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") onEnterKey();
            }}
          />
        </div>
      </div>
    </>
  );
}

