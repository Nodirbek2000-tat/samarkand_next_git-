import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PersonProfile, ProfileSkeleton } from "@/components/site/person-profile";
import { api } from "@/lib/api/server";

export async function generateMetadata({ params }: PageProps<"/council/members/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const m = await api.councilMember(slug);
  return { title: m ? `${m.full_name} — Kengash a’zosi` : "Kengash a’zosi" };
}

export default function MemberPage({ params }: PageProps<"/council/members/[slug]">) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Member params={params} />
    </Suspense>
  );
}

async function Member({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = await api.councilMember(slug);
  if (!m) notFound();
  return (
    <PersonProfile
      name={m.full_name}
      photo={m.photo}
      role="Kengash a’zosi"
      lines={[
        { label: "Kompaniya", value: m.company },
        { label: "Lavozimi", value: m.position },
        { label: "Faoliyat sohasi", value: m.industry },
        { label: "A’zo bo‘lgan yili", value: m.joined_year ? String(m.joined_year) : "" },
      ]}
      bio={m.bio}
      contacts={{ phone: m.contact_phone, email: m.contact_email, website: m.website }}
      back={{ href: "/council/members", label: "Barcha a’zolar" }}
    />
  );
}
