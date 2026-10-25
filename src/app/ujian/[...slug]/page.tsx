import { redirect } from "next/navigation";

export default async function UjianCatchAllRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") {
      urlParams.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((v) => urlParams.append(key, v));
    }
  }
  const query = urlParams.toString() ? `?${urlParams.toString()}` : "";
  const subpath = slug && slug.length > 0 ? slug.join("/") : "";
  if (subpath) {
    redirect(`/dashboard/pendaftar/ujian/${subpath}${query}`);
  }
  redirect(`/dashboard/pendaftar/undangan-seleksi${query}`);
}
