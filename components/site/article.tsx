import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Cover } from "./cover";
import { Reveal } from "./reveal";
import { ShareBar } from "./share-bar";
import { Container, Pill, RichText } from "./ui";

/** Shared long-read layout for news, announcements and films. */
export function ArticleLayout({
  back,
  pills,
  title,
  lead,
  meta,
  cover,
  seed,
  body,
  aside,
  children,
}: {
  back: { href: string; label: string };
  pills?: React.ReactNode;
  title: string;
  lead?: string;
  meta?: React.ReactNode;
  cover?: string | null;
  seed: string;
  body?: string;
  aside?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <article>
      <Container className="pb-12 pt-28 md:pt-32">
        <Link href={back.href} data-cursor="hover" className="mb-10 inline-flex items-center gap-2 text-base font-semibold text-turq">
          <ArrowLeft className="size-5" /> {back.label}
        </Link>
        <Reveal className="max-w-5xl">
          {pills && <div className="flex flex-wrap gap-2">{pills}</div>}
          <h1 className="mt-4 font-display text-[clamp(1.5rem,3.2vw,3rem)] [overflow-wrap:anywhere] font-bold leading-[1.02] tracking-[-0.03em]">{title}</h1>
          {meta && <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-base text-ivory/75">{meta}</div>}
          {lead && <p className="mt-8 text-xl leading-relaxed text-ivory/90 md:text-2xl">{lead}</p>}
        </Reveal>
      </Container>
      <Container>
        <Reveal className="relative aspect-[21/9] overflow-hidden rounded-[2.2rem]">
          <Cover src={cover} alt={title} seed={seed} className="absolute inset-0" sizes="100vw" priority />
        </Reveal>
      </Container>
      <Container className="py-10 md:py-12">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {body && (
              <Reveal>
                <RichText html={body} />
              </Reveal>
            )}
            {children}
            <ShareBar title={title} className="mt-14" />
          </div>
          {aside && <aside className="lg:col-span-4">{aside}</aside>}
        </div>
      </Container>
    </article>
  );
}

export { Pill };
