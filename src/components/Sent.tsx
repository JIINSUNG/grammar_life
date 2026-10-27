import { Ruby } from "./Ruby";
import type { Lang } from "../types";

/** 예문을 보여주고, [정답] 부분만 노란 형광펜(mark)으로 강조한다. */
export function Sent({ raw, lang, big, furi }: { raw: string; lang: Lang; big?: boolean; furi?: boolean }) {
  const parts = raw.split(/\[([^\]]+)\]/);
  return (
    <span className={"sent" + (lang === "ja" ? " ja" : "") + (big ? " big" : "")}>
      {parts.length > 1 ? (
        <>
          <Ruby text={parts[0]} furi={furi} />
          <mark>
            <Ruby text={parts[1]} furi={furi} />
          </mark>
          <Ruby text={parts[2]} furi={furi} />
        </>
      ) : (
        <Ruby text={parts[0]} furi={furi} />
      )}
    </span>
  );
}
