"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export function SyncUserOnSignIn() {
  const { user, isSignedIn } = useUser();
  useEffect(() => {
    if (isSignedIn && user) {
      fetch('/api/auth/sync', { method: 'POST' });
    }
  }, [isSignedIn, user]);
  return null;
}