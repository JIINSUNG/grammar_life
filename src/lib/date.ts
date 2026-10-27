// 계획엔 명시적인 파일이 없었지만, pad/ymd/today/addDays는 storage·srs·notes 전반에서 쓰는
// 순수 날짜 유틸이라 별도 파일로 뺐다 (레거시 app.js 로직 그대로, 손으로 바꾸지 않음).
export const pad = (n: number) => String(n).padStart(2, "0");

export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const today = () => ymd(new Date());

export function addDays(s: string, n: number): string {
  const [y, m, d] = s.split("-").map(Number);
  return ymd(new Date(y, m - 1, d + n));
}
