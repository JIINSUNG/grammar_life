import { Fragment } from "react";
import { plain, splitRuby } from "../lib/ruby";

/** ｜漢字《かな》 표기 문자열을 <ruby><rt> 또는(후리가나 끈 상태면) 평문으로 렌더한다. */
export function Ruby({ text, furi = true }: { text: string; furi?: boolean }) {
  const t = String(text);
  if (t.indexOf("《") < 0) return <>{t}</>;
  if (!furi) return <>{plain(t)}</>;
  return (
    <>
      {splitRuby(t).map((part, i) =>
        part.reading ? (
          <ruby key={i}>
            {part.text}
            <rt>{part.reading}</rt>
          </ruby>
        ) : (
          <Fragment key={i}>{part.text}</Fragment>
        )
      )}
    </>
  );
}
