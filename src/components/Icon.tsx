const PATHS: Record<string, string> = {
  today: "M4 11l6-6 6 6v6H4z",
  grammar: "M4 4h9a3 3 0 0 1 3 3v9H7a3 3 0 0 1-3-3z M7 8h6 M7 11h4",
  exam: "M5 3h10v14H5z M8 7h4 M8 10h4 M8 13h2",
  vocab: "M5 3h10v14l-5-3.2L5 17z M8 7h4",
  note: "M4 16.5l.8-3.6L13 4.7l2.8 2.8-8.2 8.2z M11.5 6.2l2.8 2.8",
  me: "M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M4 17c1-3 3.5-4.5 6-4.5s5 1.5 6 4.5",
};

export function Icon({ n }: { n: string }) {
  return (
    <svg viewBox="0 0 20 20" width={22} height={22} aria-hidden="true">
      <path d={PATHS[n]} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
