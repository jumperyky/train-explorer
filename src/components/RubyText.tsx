import { parseRuby, toPlainText } from "@/lib/ruby";

/**
 * 漢字にふりがな（ルビ）を振って表示する。
 * 5歳児向けなので、ルビは大きめ（親文字の 50%）で表示する。
 */
export default function RubyText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const segments = parseRuby(text);

  return (
    <span className={className} aria-label={toPlainText(text)}>
      {segments.map((seg, i) =>
        seg.kind === "text" ? (
          <span key={i}>{seg.text}</span>
        ) : (
          <ruby key={i} className="ruby-lg">
            {seg.base}
            <rp>(</rp>
            <rt>{seg.reading}</rt>
            <rp>)</rp>
          </ruby>
        ),
      )}
    </span>
  );
}
