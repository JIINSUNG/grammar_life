import { Ruby } from "./Ruby";
import type { VocabWordRw } from "../data";

export function VWord({ w, big, furi }: { w: VocabWordRw; big?: boolean; furi?: boolean }) {
  return (
    <span className={"vw" + (big ? " big" : "") + (w.r ? " ja" : "")}>
      <Ruby text={w.rw} furi={furi} />
    </span>
  );
}
