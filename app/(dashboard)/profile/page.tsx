// app/(dashboard)/profile/page.tsx
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function MyProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");
  redirect(`/profile/${session.user.id}`);
}
