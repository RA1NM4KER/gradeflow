import type { Session } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const PASSWORD_RECOVERY_STORAGE_KEY = "gradelog-password-recovery";

function requireSupabaseClient() {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error(
      "Sync is not configured in this build. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable connected devices.",
    );
  }

  return client;
}

export async function signUpWithEmailPassword(email: string, password: string) {
  const client = requireSupabaseClient();

  return await client.auth.signUp({
    email,
    password,
  });
}

export async function signInWithEmailPassword(email: string, password: string) {
  const client = requireSupabaseClient();

  return await client.auth.signInWithPassword({
    email,
    password,
  });
}

export async function requestPasswordResetForEmail(email: string) {
  const client = requireSupabaseClient();

  if (typeof window === "undefined") {
    throw new Error("Password reset is only available in the browser.");
  }

  return await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

export async function updateCurrentSyncPassword(password: string) {
  const client = requireSupabaseClient();

  return await client.auth.updateUser({
    password,
  });
}

export async function signOutFromSync() {
  const client = requireSupabaseClient();

  return await client.auth.signOut();
}

export async function getCurrentSyncSession(): Promise<Session | null> {
  const client = getSupabaseBrowserClient();

  if (!client) {
    return null;
  }

  const { data, error } = await client.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}
export function markPasswordRecoverySession() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(PASSWORD_RECOVERY_STORAGE_KEY, "true");
}

export function hasPasswordRecoverySession() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.location.search.includes("type=recovery") ||
    window.location.hash.includes("type=recovery") ||
    window.sessionStorage.getItem(PASSWORD_RECOVERY_STORAGE_KEY) === "true"
  );
}

export function clearPasswordRecoverySession() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(PASSWORD_RECOVERY_STORAGE_KEY);
}
