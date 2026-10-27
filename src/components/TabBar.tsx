import { Icon } from "./Icon";

const TABS: [string, string][] = [
  ["today", "오늘"],
  ["grammar", "문법"],
  ["vocab", "단어"],
  ["note", "노트"],
  ["exam", "실전"],
  ["me", "나"],
];

export function TabBar({ tab, onChange }: { tab: string; onChange: (tab: string) => void }) {
  return (
    <nav className="tabbar" aria-label="메뉴">
      <div className="wrap tabin">
        {TABS.map(([k, l]) => (
          <button key={k} type="button" aria-current={tab === k ? "page" : undefined} onClick={() => onChange(k)}>
            <Icon n={k} />
            <span>{l}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
