-- ============================================
-- Sparky Notes — Storage migration (avatares + wallpapers)
-- Rode isso no SQL Editor do Supabase, depois do supabase-migration.sql
-- ============================================

-- bucket para fotos de perfil
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- bucket para wallpapers da biblioteca
insert into storage.buckets (id, name, public)
values ('library-wallpapers', 'library-wallpapers', true)
on conflict (id) do nothing;

-- leitura pública (as imagens aparecem no app sem precisar de token)
create policy "avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "wallpapers are publicly readable"
  on storage.objects for select
  using (bucket_id = 'library-wallpapers');

-- cada usuário só grava/atualiza/apaga dentro da própria pasta,
-- ex: avatars/<user_id>/foto.png
create policy "users upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users upload own wallpaper"
  on storage.objects for insert
  with check (
    bucket_id = 'library-wallpapers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users update own wallpaper"
  on storage.objects for update
  using (
    bucket_id = 'library-wallpapers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users delete own wallpaper"
  on storage.objects for delete
  using (
    bucket_id = 'library-wallpapers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
