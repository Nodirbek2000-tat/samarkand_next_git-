import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PersonProfile, ProfileSkeleton } from "@/components/site/person-profile";
import { api } from "@/lib/api/server";

export async function generateMetadata({ params }: PageProps<"/council/management/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const m = await api.boardMember(slug);
  return { title: m ? `${m.full_name} — Boshqaruv` : "Boshqaruv" };
}

export default function BoardMemberPage({ params }: PageProps<"/council/management/[slug]">) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <BoardMember params={params} />
    </Suspense>
  );
}

async function BoardMember({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = await api.boardMember(slug);
  if (!m) notFound();
  return (
    <PersonProfile
      name={m.full_name}
      photo={m.photo}
      role={m.role_label}
      lines={[{ label: "Ish joyi va lavozimi", value: m.workplace }]}
      bio={m.bio}
      back={{ href: "/council/management", label: "Boshqaruv" }}
    />
  );
}
