// shuffle/pick도 계획의 template.ts 목록엔 없었지만 퀴즈·실전·단어·노트 복습 전체에서 쓰는
// 공용 유틸이라 별도로 뺐다. 로직은 레거시 app.js와 동일.

/** 시드 기반 결정적 선택 (같은 seed·salt면 항상 같은 값 → "오늘의 예문"이 리렌더돼도 안 바뀜) */
export function pick<T>(arr: T[], seed: number, salt: number): T | null {
  if (!arr.length) return null;
  return arr[Math.abs((seed * 31 + salt * 7) % arr.length)];
}

/** Fisher–Yates. 원본 배열은 바꾸지 않음. */
export function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
