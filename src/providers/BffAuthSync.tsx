"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { setClerkContext } from "@/api/client";

export function BffAuthSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        setClerkContext({
          userId: user.id,
          plan: (user.publicMetadata?.plan as string) || "free",
        });
      } else {
        setClerkContext({});
      }
    }
  }, [isLoaded, user]);

  return null;
}
