import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeroDetailBody } from "@/components/hero-detail/HeroDetailBody";
import { HeroHeader } from "@/components/hero-detail/HeroHeader";
import { allHeroSlugs, getHeroDetail } from "@/lib/hero-detail";
import { ROLE_LABEL } from "@/lib/labels";

// 영웅 54명 상세 페이지를 빌드 때 모두 미리 만듦
export function generateStaticParams() {
  return allHeroSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/heroes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const detail = getHeroDetail(slug);
  if (!detail) return { title: "영웅을 찾을 수 없어요" };
  const { hero, stats } = detail;
  const tier = stats.map((s) => `${s.tier}티어 ${s.winRate}%`).join(" / ");
  const title = `${hero.nameKo} (${hero.nameEn})`;
  const description = `${hero.nameKo} — ${hero.roles.map((r) => ROLE_LABEL[r]).join("/")} · ${tier}. 스킬·쿨타임·궁극기 비용, 카운터 TOP5, 협공 스킬, 조합 성향(P/D/R)을 한글로 확인하세요.`;
  const image = { url: `/images/heroes/${hero.slug}.png`, width: 680, height: 961, alt: `${hero.nameKo} 전신 이미지` };
  return {
    title,
    description,
    openGraph: { title: `${title} | Rivals Dex`, description, images: [image], type: "article" },
    twitter: { card: "summary", title, description, images: [image.url] },
  };
}

export default async function HeroDetailPage({ params }: PageProps<"/heroes/[slug]">) {
  const { slug } = await params;
  const detail = getHeroDetail(slug);
  if (!detail) notFound();

  return (
    <>
      <HeroHeader detail={detail} />
      <HeroDetailBody detail={detail} />
    </>
  );
}
