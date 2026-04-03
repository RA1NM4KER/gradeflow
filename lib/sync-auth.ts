import type { Session, User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

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

export async function getCurrentSyncUser(): Promise<User | null> {
  const session = await getCurrentSyncSession();
  return session?.user ?? null;
}
