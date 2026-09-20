import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";

const STORAGE_TIMEOUT_MS = 15000;

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

/**
 * 프로필 사진을 유저당 고정 경로(profile-photos/{uid})에 덮어쓰기 방식으로 올린다.
 * 파일명을 따로 관리하지 않아 이전 사진이 자동으로 교체되고, 오래된 파일이 쌓이지 않는다.
 *
 * Storage 버킷이 아직 프로비저닝되지 않은 상태(Blaze 미전환 등)에서는 요청이
 * 응답도 에러도 없이 무한정 걸려있을 수 있어, 타임아웃을 걸어 UI가 항상
 * "업로드 중" 상태에서 빠져나오도록 한다.
 */
export async function uploadProfilePhoto(uid, file) {
  const fileRef = ref(storage, `profile-photos/${uid}`);
  await withTimeout(
    uploadBytes(fileRef, file),
    STORAGE_TIMEOUT_MS,
    "업로드 응답이 없어요. Firebase Storage가 아직 활성화되지 않았을 수 있어요."
  );
  return getDownloadURL(fileRef);
}

/**
 * 계정 탈퇴 시 프로필 사진을 정리한다. 애초에 사진을 올린 적이 없으면
 * storage/object-not-found로 실패하는 게 정상이라 조용히 무시한다.
 * Storage가 아직 활성화되지 않은 상태에서는 요청이 응답 없이 걸려있을 수 있어
 * 타임아웃을 건다 (계정 삭제 전체 흐름이 여기서 막히면 안 되므로).
 */
export async function deleteProfilePhoto(uid) {
  try {
    await withTimeout(
      deleteObject(ref(storage, `profile-photos/${uid}`)),
      STORAGE_TIMEOUT_MS,
      "사진 삭제 응답이 없어요."
    );
  } catch (err) {
    if (err.code !== "storage/object-not-found") throw err;
  }
}
