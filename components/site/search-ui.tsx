import {
  Calendar,
  Camera,
  Clapperboard,
  Factory,
  FileText,
  Handshake,
  Megaphone,
  Newspaper,
  Rows3,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { splitMatches } from "@/lib/site-search";

/** Pieces shared by the header search and the /search page (no hooks — renders on the server too). */

const KIND_ICON: Record<string, LucideIcon> = {
  Sahifa: FileText,
  Yangilik: Newspaper,
  Loyiha: Rows3,
  "E’lon": Megaphone,
  "Kengash a’zosi": Users,
  Boshqaruv: ShieldCheck,
  Rahbariyat: UserRound,
  "Yig‘ilish": Calendar,
  Forum: Factory,
  Film: Clapperboard,
  Fotohisobot: Camera,
  Hamkor: Handshake,
};

export const kindIcon = (kind: string) => KIND_ICON[kind] ?? FileText;

/** `text` with the searched words marked. */
export function Highlight({ text, q }: { text: string; q: string }) {
  return (
    <>
      {splitMatches(text, q).map(({ part, hit }, i) =>
        hit ? (
          <mark key={i} className="rounded-[3px] bg-turq/20 px-px text-inherit">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}
