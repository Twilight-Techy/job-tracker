import { auth } from "@/lib/auth-server";

export async function getUserFromReq(req?: Request) {
  try {
    const { data: session } = await auth.getSession();
    return session?.user || null;
  } catch (error) {
    return null;
  }
}

