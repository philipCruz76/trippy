import { unstable_setRequestLocale } from "next-intl/server";
import { CreatePageClient } from "./CreatePageClient";

type PageProps = {
  params: { locale: string };
};

// This becomes the server component
const Page = ({ params: { locale } }: PageProps) => {
  unstable_setRequestLocale(locale);

  return <CreatePageClient />;
};

export default Page;
