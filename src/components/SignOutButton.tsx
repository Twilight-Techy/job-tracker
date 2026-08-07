"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/signin");
          router.refresh();
        },
      },
    });
  };

  return (
    <button 
      onClick={handleSignOut}
      disabled={loading}
      className="btn-secondary" 
      style={{ width: '100%', borderColor: 'var(--danger)', color: 'var(--danger)' }}
    >
      {loading ? "Signing Out..." : "Sign Out"}
    </button>
  );
}
