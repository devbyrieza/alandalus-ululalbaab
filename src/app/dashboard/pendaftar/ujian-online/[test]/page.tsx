import { redirect } from "next/navigation";

export default async function UjianOnlineRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ test: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { test } = await params;
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
  redirect(`/dashboard/pendaftar/ujian/${test}${query}`);
}
