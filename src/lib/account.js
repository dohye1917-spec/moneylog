import { deleteUser, reauthenticateWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { deleteAccountData } from "./firestore";
import { deleteProfilePhoto } from "./storage";

/**
 * 계정 탈퇴: Firestore 데이터 정리 → 프로필 사진 정리 → Firebase Auth 계정 삭제 순으로 진행한다.
 * Auth 계정 삭제는 보안상 "최근 로그인"을 요구할 수 있어(auth/requires-recent-login),
 * 그 경우 구글 재인증 팝업을 한 번 더 띄우고 재시도한다.
 * 계정 삭제가 성공하면 onAuthStateChanged가 자동으로 null을 흘려보내 로그인 화면으로 돌아간다.
 */
export async function deleteAccount(uid, shareId) {
  await deleteAccountData(uid, shareId);
  await deleteProfilePhoto(uid);

  try {
    await deleteUser(auth.currentUser);
  } catch (err) {
    if (err.code !== "auth/requires-recent-login") throw err;
    await reauthenticateWithPopup(auth.currentUser, googleProvider);
    await deleteUser(auth.currentUser);
  }
}
