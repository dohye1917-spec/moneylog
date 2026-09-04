import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { updateUserProfile } from "../lib/firestore";
import { uploadProfilePhoto } from "../lib/storage";

/**
 * 프로필 사진 원형 버튼. 헤더(작은 크기)와 설정 화면(큰 크기) 양쪽에서
 * 같은 업로드 로직을 공유하기 위해 분리했다. 클릭하면 바로 파일 선택창이 열린다.
 */
export default function ProfilePhotoButton({ user, profile, size = "w-9 h-9", onToast }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadProfilePhoto(user.uid, file);
      await updateUserProfile(user.uid, { photoURL: url });
      onToast?.("프로필 사진을 변경했어요!");
    } catch (err) {
      console.error("프로필 사진 업로드 실패:", err);
      onToast?.(err.message || "사진 업로드에 실패했어요. 다시 시도해줘.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={uploading}
        title="프로필 사진 변경"
        className={`relative ${size} rounded-full overflow-hidden bg-slate-200 shrink-0`}
      >
        {profile?.photoURL && (
          <img
            src={profile.photoURL}
            alt={profile.displayName || "프로필"}
            className="w-full h-full object-cover"
          />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
          <Camera className="w-1/3 h-1/3 text-white" />
        </span>
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="w-1/3 h-1/3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </span>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </>
  );
}
