import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LandingClient } from "./landing-client";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return <LandingClient />;
}
