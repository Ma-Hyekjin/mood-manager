import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface UserProfile {
  email: string;
  name: string;
  familyName: string;
  birthDate: string;
  gender: string;
  createdAt: string;
  profileImageUrl?: string | null;
}

/**
 * 프로필 관리 커스텀 훅
 * 
 * [MOCK] 목업 모드로 동작
 * TODO: 백엔드 API로 교체 필요
 */
export function useProfile() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedFamilyName, setEditedFamilyName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [_profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // [MOCK] 프로필 정보 조회
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      const mockProfile: UserProfile = {
        email: "test@example.com",
        name: "John",
        familyName: "Doe",
        birthDate: "1990-01-15",
        gender: "Male",
        createdAt: "2024-01-01",
        profileImageUrl: null,
      };
      setProfile(mockProfile);
      setProfileImage(mockProfile.profileImageUrl || null);
    }
  }, [status, session]);

  // 프로필 정보가 변경되면 편집 필드도 업데이트
  useEffect(() => {
    if (profile) {
      setEditedName(profile.name);
      setEditedFamilyName(profile.familyName);
    }
  }, [profile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setProfileImageFile(file);
    }
  };

  const handleProfileUpdate = async () => {
    if (!editedName.trim() || !editedFamilyName.trim()) {
      toast.error("Name and Family Name are required.");
      return;
    }

    setIsUpdating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (profile) {
        const updatedProfile = {
          ...profile,
          name: editedName.trim(),
          familyName: editedFamilyName.trim(),
          profileImageUrl: profileImage || profile.profileImageUrl || null,
        };
        setProfile(updatedProfile);
        setProfileImage(updatedProfile.profileImageUrl || null);
      }

      toast.success("Profile updated successfully.");
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProfileCancel = () => {
    if (profile) {
      setEditedName(profile.name);
      setEditedFamilyName(profile.familyName);
      setProfileImage(profile.profileImageUrl || null);
    }
    setProfileImageFile(null);
    setIsEditingProfile(false);
  };

  return {
    profile,
    isEditingProfile,
    editedName,
    editedFamilyName,
    profileImage,
    isUpdating,
    setIsEditingProfile,
    setEditedName,
    setEditedFamilyName,
    handleImageChange,
    handleProfileUpdate,
    handleProfileCancel,
  };
}

