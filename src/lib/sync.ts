// 로그인(Google 팝업)한 사용자의 학습 기록을 Firestore(users/{uid}/grammarLife/main)와 맞춘다.
// Firebase가 꺼져 있거나(env 없음) 로그인 전이면 아무 일도 하지 않는다 — 지금처럼 이 기기에만 저장.
//
// 전략: 로그인 직후 1회 클라우드 문서를 읽어 updatedAt이 더 최신인 쪽을 채택(로컬이 더 최신이면
// 그대로 두고 아래 쓰기가 올려보낸다) → 이후 다른 기기 변경을 실시간 구독 → 로컬 변경은 1.5초
// 디바운스 후 통째로 덮어쓰기(마지막 쓰기가 이긴다). daily_topic의 lib/sync와 같은 전략이다.
import { useEffect, useRef, useState } from "react";
import type { User } from "firebase/auth";
import { firebaseEnabled, loadFirebaseSdk, type FirebaseSdk } from "./firebase";
import type { AppState } from "../types";

const DEBOUNCE_MS = 1500;

export interface SyncState {
  enabled: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

export function useFirebaseSync(st: AppState, applyRemote: (next: AppState) => void): SyncState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseEnabled);
  const [error, setError] = useState<string | null>(null);

  const stateRef = useRef(st);
  useEffect(() => {
    stateRef.current = st;
  }, [st]);

  const sdkRef = useRef<FirebaseSdk | null>(null);
  const pulledFor = useRef<string | null>(null);
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 로그인 상태 구독 — firebaseEnabled일 때만 SDK를 비동기로 받아온다(초기 렌더를 막지 않음).
  useEffect(() => {
    if (!firebaseEnabled) return;
    let unsub: (() => void) | undefined;
    let cancelled = false;
    loadFirebaseSdk().then((sdk) => {
      if (cancelled) return;
      sdkRef.current = sdk;
      unsub = sdk.onAuthStateChanged(sdk.auth, (u) => {
        setUser(u);
        setLoading(false);
      });
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  // 로그인되면: 최초 1회 비교 pull → 이후 실시간 구독
  useEffect(() => {
    if (!firebaseEnabled || !user) return;
    let unsub: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const sdk = sdkRef.current ?? (await loadFirebaseSdk());
      sdkRef.current = sdk;
      if (cancelled) return;
      const ref = sdk.doc(sdk.db, "users", user.uid, "grammarLife", "main");
      const snap = await sdk.getDoc(ref);
      if (cancelled) return;
      if (snap.exists()) {
        const remote = snap.data() as AppState;
        const local = stateRef.current.updatedAt ?? "";
        if ((remote.updatedAt ?? "") > local) applyRemote(remote);
      } else {
        await sdk.setDoc(ref, stateRef.current);
      }
      pulledFor.current = user.uid;

      unsub = sdk.onSnapshot(ref, (s) => {
        if (s.metadata.hasPendingWrites) return; // 방금 내가 쓴 건 무시(루프 방지)
        if (!s.exists()) return;
        const remote = s.data() as AppState;
        if ((remote.updatedAt ?? "") > (stateRef.current.updatedAt ?? "")) applyRemote(remote);
      });
    })();

    return () => {
      cancelled = true;
      unsub?.();
      pulledFor.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- applyRemote는 App.tsx에서 매번 새로 만들어져 deps에 넣으면 재구독 루프가 됨
  }, [user]);

  // 로컬 변경은 디바운스 후 업로드(최초 비교가 끝난 뒤부터)
  useEffect(() => {
    if (!firebaseEnabled || !user) return;
    if (pulledFor.current !== user.uid) return;
    const sdk = sdkRef.current;
    if (!sdk) return;
    if (writeTimer.current) clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => {
      const ref = sdk.doc(sdk.db, "users", user.uid, "grammarLife", "main");
      sdk.setDoc(ref, st).catch(() => {
        /* 오프라인 등으로 실패해도 로컬 데이터는 안전 — 다음 변경 때 다시 시도됨 */
      });
    }, DEBOUNCE_MS);
    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, [user, st]);

  const signIn = async () => {
    setError(null);
    try {
      const sdk = sdkRef.current ?? (await loadFirebaseSdk());
      sdkRef.current = sdk;
      await sdk.signInWithPopup(sdk.auth, new sdk.GoogleAuthProvider());
    } catch {
      setError("로그인에 실패했어요. 다시 시도해주세요.");
    }
  };

  const signOutUser = async () => {
    const sdk = sdkRef.current;
    if (!sdk) return;
    await sdk.signOut(sdk.auth);
  };

  return { enabled: firebaseEnabled, user, loading, error, signIn, signOutUser };
}
