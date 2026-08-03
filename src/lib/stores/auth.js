import { writable, derived } from "svelte/store";
import { supabase } from "../services/supabase.js";

export const session = writable(null);
export const authLoading = writable(true);
export const authError = writable("");

export const isLoggedIn = derived(session, ($s) => !!$s);
export const currentUser = derived(session, ($s) => $s?.user ?? null);

export async function initAuth() {
  authLoading.set(true);

  const { data } = await supabase.auth.getSession();
  session.set(data.session);

  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.set(newSession);
  });

  authLoading.set(false);
}

export async function signInWithEmail(email, password) {
  authError.set("");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    authError.set(error.message);
    return false;
  }
  return true;
}

export async function signUpWithEmail(email, password) {
  authError.set("");
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    authError.set(error.message);
    return false;
  }
  return true;
}

export async function signInWithMagicLink(email) {
  authError.set("");
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) {
    authError.set(error.message);
    return false;
  }
  return true;
}

export async function signOut() {
  await supabase.auth.signOut();
  session.set(null);
}

// merges into user_metadata (full_name, avatar_url, library_wallpaper, ...)
// and refreshes the local session so the UI updates immediately.
export async function updateProfile(updates) {
  authError.set("");
  const { data, error } = await supabase.auth.updateUser({ data: updates });
  if (error) {
    authError.set(error.message);
    return false;
  }
  session.update((s) => (s ? { ...s, user: data.user } : s));
  return true;
}

async function uploadToBucket(bucket, file, userId) {
  const ext = file.name.split(".").pop() || "png";
  const path = `${userId}/${bucket === "avatars" ? "avatar" : "wallpaper"}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, cacheControl: "3600" });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAvatar(file, userId) {
  authError.set("");
  try {
    const url = await uploadToBucket("avatars", file, userId);
    const ok = await updateProfile({ avatar_url: url });
    return ok ? url : null;
  } catch (err) {
    authError.set(err.message || "falha ao enviar a foto");
    return null;
  }
}

export async function uploadLibraryWallpaper(file, userId) {
  authError.set("");
  try {
    const url = await uploadToBucket("library-wallpapers", file, userId);
    const ok = await updateProfile({ library_wallpaper: url });
    return ok ? url : null;
  } catch (err) {
    authError.set(err.message || "falha ao enviar o wallpaper");
    return null;
  }
}

export async function removeLibraryWallpaper() {
  return updateProfile({ library_wallpaper: "" });
}
