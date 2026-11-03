// Firebase는 선택 사항이다 — env 값이 없으면 앱은 지금처럼 이 기기(localStorage)에만 저장된다.
// Vite는 VITE_ 접두사 env만 클라이언트 번들에 넣어준다(import.meta.env).
//
// firebase SDK(약 1MB)는 동기화를 안 쓰는 절대다수 사용자에게는 불필요한 무게라, 정적 import 대신
// 전부 동적 import로 묶어서 "로그인 기능을 실제로 켠(firebaseEnabled) 기기에서만, 첫 렌더를 막지
// 않고" 별도 청크로 받는다. 모바일 우선 원칙(CLAUDE.md) 때문에 중요하다.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseEnabled = !!config.apiKey && !!config.projectId;

export interface FirebaseSdk {
  auth: import("firebase/auth").Auth;
  db: import("firebase/firestore").Firestore;
  GoogleAuthProvider: typeof import("firebase/auth").GoogleAuthProvider;
  onAuthStateChanged: typeof import("firebase/auth").onAuthStateChanged;
  signInWithPopup: typeof import("firebase/auth").signInWithPopup;
  signOut: typeof import("firebase/auth").signOut;
  doc: typeof import("firebase/firestore").doc;
  getDoc: typeof import("firebase/firestore").getDoc;
  onSnapshot: typeof import("firebase/firestore").onSnapshot;
  setDoc: typeof import("firebase/firestore").setDoc;
}

let sdkPromise: Promise<FirebaseSdk> | null = null;

/** firebaseEnabled일 때만 불러라 — 아니면 굳이 번들을 받을 이유가 없다. */
export function loadFirebaseSdk(): Promise<FirebaseSdk> {
  if (!firebaseEnabled) return Promise.reject(new Error("firebase가 설정되지 않았어요"));
  if (!sdkPromise) {
    sdkPromise = Promise.all([import("firebase/app"), import("firebase/auth"), import("firebase/firestore")]).then(
      ([{ initializeApp, getApps }, authMod, dbMod]) => {
        const app = getApps()[0] ?? initializeApp(config);
        return {
          auth: authMod.getAuth(app),
          db: dbMod.getFirestore(app),
          GoogleAuthProvider: authMod.GoogleAuthProvider,
          onAuthStateChanged: authMod.onAuthStateChanged,
          signInWithPopup: authMod.signInWithPopup,
          signOut: authMod.signOut,
          doc: dbMod.doc,
          getDoc: dbMod.getDoc,
          onSnapshot: dbMod.onSnapshot,
          setDoc: dbMod.setDoc,
        };
      },
    );
  }
  return sdkPromise;
}
