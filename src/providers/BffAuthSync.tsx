"use client";

// import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { setClerkContext } from "@/api/client";

export function BffAuthSync() {
  // Temporary bypass: Clerk keys are missing on Vercel
  // const { user, isLoaded } = useUser();

  useEffect(() => {
    // Mocking logged out state
    setClerkContext({});
  }, []);

  return null;
}
