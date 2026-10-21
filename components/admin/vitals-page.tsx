"use client";

import { useCallback, useEffect, useState } from "react";
import { Gauge, Globe2, Monitor, Smartphone, Tablet } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { Badge, Card, Empty, PageHeader } from "./ui";

type Stats = {
  samples: number;
  lcp_p75: number | null;
  ready_p75: number | null;
  tbt_p75: number | null;
  longest_p75: number | null;
  inp_p75: number | null;
  cls_p75: number | null;
  jank_pct: number | null;
};
type Sample = {
  created_at: string;
  page: string;
  device: string;
  browser: string;
  lite: boolean;
  cores: number | null;
  memory: number | null;
  net: string;
  width: number | null;
  lcp_ms: number | null;
  tbt_ms: number | null;
  longest_ms: number | null;
  inp_ms: number | null;
  culprit: string;
};
type Report = {
  days: number;
  summary: Stats & { lite_pct: number | null };
  globe: Record<string, number>;
  groups: (Stats & { device: string; label: string; lite: boolean })[];
  pages: (Stats & { page: string })[];
  browsers: { browser: string; samples: number }[];
  culprits: { culprit: string; samples: number; longest_p75: number | null }[];
  worst: Sample[];
};

// Google's thresholds (good / needs improvement); jank: share of frames slower than 50 ms while scrolling
const LIMITS = { lcp: [2500, 4000], inp: [200, 500], tbt: [200, 600], jank: [5, 15], cls: [0.1, 0.25] } as const;
type Kind = keyof typeof LIMITS;
const tone = (kind: Kind, v: number | null) =>
  v === null ? "text-ivory/40" : v <= LIMITS[kind][0] ? "text-turq" : v <= LIMITS[kind][1] ? "text-gold" : "text-ember";
const ms = (v: number | null) => (v === null ? "—" : v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${v} ms`);
const pct = (v: number | null) => (v === null ? "—" : `${v}%`);
const DEVICE_ICON = { phone: Smartphone, tablet: Tablet, desktop: Monitor } as Record<string, typeof Monitor>;
const when = (iso: string) =>
  new Date(iso).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function Metric({
  label,
  value,
  hint,
  kind,
  raw,
}: {
  label: string;
  value: string;
  hint: string;
  kind?: Kind;
  raw?: number | null;
}) {
  return (
    <Card className="!p-5">
      <p className="text-sm text-ivory/65">{label}</p>
      <p className={cn("mt-2 font-display text-3xl font-semibold tabular-nums", kind ? tone(kind, raw ?? null) : "text-ivory")}>
        {value}
      </p>
      <p className="mt-1 text-xs leading-snug text-ivory/50">{hint}</p>
    </Card>
  );
}

function Cell({ kind, value, text }: { kind: Kind; value: number | null; text: string }) {
  return <td className={cn("px-3 py-2.5 text-right tabular-nums", tone(kind, value))}>{text}</td>;
}

export function VitalsPage() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<Report | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(
    (d: number) =>
      apiFetch<Report>(`admin/vitals?days=${d}`)
        .then((r) => {
          setData(r);
          setFailed(false);
        })
        .catch(() => setFailed(true)),
    [],
  );
  useEffect(() => {
    load(days);
  }, [days, load]);

  const s = data?.summary;
  const globeTotal = data ? Object.values(data.globe).reduce((a, b) => a + b, 0) : 0;

  return (
    <div>
      <PageHeader
        title="Sayt tezligi"
        subtitle="Haqiqiy mehmonlar qurilmasidan o‘lchovlar — taxmin emas (shaxsiy ma’lumot yig‘ilmaydi)"
        icon={Gauge}
        actions={[1, 7, 30].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDays(d)}
            className={cn(
              "h-10 rounded-full border px-4 text-sm font-semibold transition-colors",
              days === d ? "border-turq bg-turq/15 text-ivory" : "border-ivory/15 text-ivory/70 hover:border-turq/60",
            )}
          >
            {d === 1 ? "Bugun" : `${d} kun`}
          </button>
        ))}
      />

      {failed && !data ? (
        <Empty title="Ma’lumot olinmadi" text="Birozdan so‘ng sahifani yangilang." />
      ) : !data ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-[1.4rem] bg-ivory/[0.05]" />
          ))}
        </div>
      ) : data.summary.samples === 0 ? (
        <Empty title="Hali o‘lchov yo‘q" text="Mehmonlar saytni ochib, yopganda o‘lchovlar shu yerda paydo bo‘ladi." />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="O‘lchangan tashriflar" value={String(s!.samples)} hint={`Yengil rejimda: ${pct(s!.lite_pct)}`} />
            <Metric
              label="Kirishdagi qotish (75%)"
              value={ms(s!.tbt_p75)}
              hint="Sahifa ochilayotganda bosish/scroll javobsiz qolgan vaqt"
              kind="tbt"
              raw={s!.tbt_p75}
            />
            <Metric
              label="Asosiy kontent (LCP, 75%)"
              value={ms(s!.lcp_p75)}
              hint="Ekrandagi asosiy rasm yoki matn chiqqan vaqt"
              kind="lcp"
              raw={s!.lcp_p75}
            />
            <Metric
              label="Scroll qotishi"
              value={pct(s!.jank_pct)}
              hint="Scroll paytida 50 ms dan sekin kadrlar ulushi"
              kind="jank"
              raw={s!.jank_pct}
            />
            <Metric
              label="Bosishga javob (INP, 75%)"
              value={ms(s!.inp_p75)}
              hint="Tugma bosilgandan ekran o‘zgarguncha"
              kind="inp"
              raw={s!.inp_p75}
            />
            <Metric
              label="Sahifa siljishi (CLS, 75%)"
              value={s!.cls_p75 === null ? "—" : String(s!.cls_p75)}
              hint="Yuklanayotganda elementlar sakrashi"
              kind="cls"
              raw={s!.cls_p75}
            />
            <Metric label="Bosh sahifa tayyor (75%)" value={ms(s!.ready_p75)} hint="Preloader pardasi ko‘tarilgan vaqt" />
            <Card className="!p-5">
              <p className="flex items-center gap-2 text-sm text-ivory/65">
                <Globe2 className="size-4" /> Globus
              </p>
              <div className="mt-3 space-y-1.5 text-sm">
                {[
                  ["3d", "3D aylanmoqda"],
                  ["slow", "Qurilma tortolmadi → rasm"],
                  ["poster", "Rasm"],
                ].map(([k, label]) => (
                  <p key={k} className="flex justify-between gap-3">
                    <span className="text-ivory/75">{label}</span>
                    <b className="tabular-nums">
                      {globeTotal ? `${Math.round(((data.globe[k] ?? 0) * 100) / globeTotal)}%` : "—"}
                    </b>
                  </p>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <h2 className="font-display text-xl font-semibold">Qurilmalar bo‘yicha</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-left text-ivory/55">
                  <tr>
                    <th className="px-3 py-2 font-medium">Qurilma</th>
                    <th className="px-3 py-2 text-right font-medium">Tashrif</th>
                    <th className="px-3 py-2 text-right font-medium">Kirishdagi qotish</th>
                    <th className="px-3 py-2 text-right font-medium">Eng uzun qotish</th>
                    <th className="px-3 py-2 text-right font-medium">LCP</th>
                    <th className="px-3 py-2 text-right font-medium">INP</th>
                    <th className="px-3 py-2 text-right font-medium">Scroll qotishi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory/10">
                  {data.groups.map((g) => {
                    const Icon = DEVICE_ICON[g.device] ?? Monitor;
                    return (
                      <tr key={`${g.device}-${g.lite}`}>
                        <td className="px-3 py-2.5">
                          <span className="flex items-center gap-2 font-semibold">
                            <Icon className="size-4 text-turq" /> {g.label}
                            {g.lite && <Badge tone="muted">yengil rejim</Badge>}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{g.samples}</td>
                        <Cell kind="tbt" value={g.tbt_p75} text={ms(g.tbt_p75)} />
                        <Cell kind="tbt" value={g.longest_p75} text={ms(g.longest_p75)} />
                        <Cell kind="lcp" value={g.lcp_p75} text={ms(g.lcp_p75)} />
                        <Cell kind="inp" value={g.inp_p75} text={ms(g.inp_p75)} />
                        <Cell kind="jank" value={g.jank_pct} text={pct(g.jank_pct)} />
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <h2 className="font-display text-xl font-semibold">Sahifalar</h2>
              <ul className="mt-4 divide-y divide-ivory/10 text-sm">
                {data.pages.map((p) => (
                  <li key={p.page} className="flex items-center gap-3 py-2.5">
                    <span className="min-w-0 flex-1 truncate font-mono text-[13px]">{p.page}</span>
                    <span className="tabular-nums text-ivory/60">{p.samples}</span>
                    <span className={cn("w-20 text-right tabular-nums", tone("lcp", p.lcp_p75))}>{ms(p.lcp_p75)}</span>
                    <span className={cn("w-20 text-right tabular-nums", tone("tbt", p.tbt_p75))}>{ms(p.tbt_p75)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-ivory/50">Ustunlar: tashriflar · LCP · kirishdagi qotish (75%)</p>
            </Card>
            <Card>
              <h2 className="font-display text-xl font-semibold">Eng og‘ir ish</h2>
              <p className="mt-1 text-sm text-ivory/60">Eng uzun kadrga sabab bo‘lgan kod (dasturchi uchun)</p>
              <ul className="mt-4 divide-y divide-ivory/10 text-sm">
                {data.culprits.length === 0 && <li className="py-2.5 text-ivory/50">Hali yo‘q</li>}
                {data.culprits.map((c) => (
                  <li key={c.culprit} className="flex items-center gap-3 py-2.5">
                    <span className="min-w-0 flex-1 truncate font-mono text-[13px]">{c.culprit}</span>
                    <span className="tabular-nums text-ivory/60">{c.samples}×</span>
                    <span className={cn("w-20 text-right tabular-nums", tone("tbt", c.longest_p75))}>{ms(c.longest_p75)}</span>
                  </li>
                ))}
              </ul>
              <h3 className="mt-6 font-semibold">Brauzerlar</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.browsers.map((b) => (
                  <Badge key={b.browser}>
                    {b.browser} · {b.samples}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <h2 className="font-display text-xl font-semibold">Eng sekin tashriflar</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="text-left text-ivory/55">
                  <tr>
                    <th className="px-3 py-2 font-medium">Vaqt</th>
                    <th className="px-3 py-2 font-medium">Sahifa</th>
                    <th className="px-3 py-2 font-medium">Qurilma</th>
                    <th className="px-3 py-2 text-right font-medium">Qotish</th>
                    <th className="px-3 py-2 text-right font-medium">LCP</th>
                    <th className="px-3 py-2 font-medium">Sabab</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory/10">
                  {data.worst.map((w, i) => (
                    <tr key={i}>
                      <td className="whitespace-nowrap px-3 py-2.5 text-ivory/65">{when(w.created_at)}</td>
                      <td className="max-w-[180px] truncate px-3 py-2.5 font-mono text-[13px]">{w.page}</td>
                      <td className="px-3 py-2.5 text-ivory/75">
                        {w.browser || "—"} · {w.cores ?? "?"} yadro{w.memory ? ` · ${w.memory} GB` : ""}
                        {w.net ? ` · ${w.net}` : ""}
                        {w.lite ? " · yengil" : ""}
                      </td>
                      <Cell kind="tbt" value={w.tbt_ms} text={ms(w.tbt_ms)} />
                      <Cell kind="lcp" value={w.lcp_ms} text={ms(w.lcp_ms)} />
                      <td className="max-w-[220px] truncate px-3 py-2.5 font-mono text-[12px] text-ivory/60">
                        {w.culprit || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
