import type { Metadata } from "next";
import { Cabinet } from "@/components/site/cabinet";
import { PageHero } from "@/components/site/page-hero";
import { Container } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Shaxsiy kabinet — Yangi Samarqand",
  robots: { index: false },
};

export default function CabinetPage() {
  return (
    <>
      <PageHero
        kicker="Shaxsiy kabinet"
        title="Xush"
        highlight="kelibsiz"
        description="Murojaatlaringiz holati, Kengash javoblari va shaxsiy ma’lumotlaringiz — bir joyda."
        crumbs={[{ label: "Kabinet" }]}
        compact
      />
      <Container className="pb-14">
        <Cabinet />
      </Container>
    </>
  );
}
