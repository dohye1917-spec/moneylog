import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

/**
 * 프로필 사진을 유저당 고정 경로(profile-photos/{uid})에 덮어쓰기 방식으로 올린다.
 * 파일명을 따로 관리하지 않아 이전 사진이 자동으로 교체되고, 오래된 파일이 쌓이지 않는다.
 */
export async function uploadProfilePhoto(uid, file) {
  const fileRef = ref(storage, `profile-photos/${uid}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}
