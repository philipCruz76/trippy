import HeroExplainer from "@/components/hero/HeroExplainer";
import HeroLanding from "@/components/hero/HeroLanding";
import { unstable_setRequestLocale } from 'next-intl/server';

export default function Home({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  
  return (
    <main className="flex min-h-[200dvh] min-w-[100dvw] flex-col items-center text-center justify-between text-black">
      <HeroLanding />
      <HeroExplainer />
    </main>
  );
}
