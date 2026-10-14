import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { MembersGrid } from "@/components/site/people-grid";
import { Container, EmptyState } from "@/components/site/ui";
import { api } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Kengash a’zolari — Yangi Samarqand",
  description: "Samarqand viloyati tadbirkorlari jamoat maslahat kengashi a’zolari ro‘yxati.",
};

export default async function MembersPage() {
  const members = await api.councilMembers();
  return (
    <>
      <PageHero
        kicker="Kengash a’zolari"
        title="Viloyatning"
        highlight="yetakchi tadbirkorlari"
        description="Kengash a’zolari — Fond Nizomini tan olgan, Kengash faoliyatida faol ishtirok etadigan tadbirkorlar va korxona rahbarlari."
        crumbs={[{ label: "Kengash", href: "/council" }, { label: "A’zolar" }]}
        compact
      />
      <Container className="pb-14">
        {members?.length ? <MembersGrid members={members} /> : <EmptyState title="Ro‘yxat tez orada e’lon qilinadi" />}
      </Container>
    </>
  );
}
