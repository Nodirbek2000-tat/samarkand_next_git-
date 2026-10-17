import type { CSSProperties } from "react";

/**
 * Lusion uslubidagi "harf aylanishi": havola/tugma ustiga kelganda har bir harf ketma-ket yuqoriga
 * aylanib, ostidan nusxasi chiqadi. Faqat CSS (globals.css `.roll`), JS ham, qo'shimcha kutubxona ham yo'q.
 * Ekran o'quvchilari butun so'zni bir marta eshitadi.
 */
export function Roll({ children }: { children: string }) {
  return (
    <span className="roll">
      <span className="sr-only">{children}</span>
      <span aria-hidden className="roll-chars">
        {Array.from(children).map((ch, i) => (
          <span key={i} data-ch={ch} style={{ "--i": i } as CSSProperties}>
            {ch === " " ? " " : ch}
          </span>
        ))}
      </span>
    </span>
  );
}
