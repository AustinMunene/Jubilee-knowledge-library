-- Supabase Storage Setup for Jubilee Knowledge Library
-- Run this in your Supabase SQL Editor after creating your project

-- Create storage buckets
insert into storage.buckets (id, name, public)
values
  ('book-covers', 'book-covers', true),
  ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

-- Storage policies for book-covers bucket
-- Allow authenticated users to upload book covers (admins only in practice)
create policy "book_covers_upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'book-covers');

-- Allow public read access for book covers (anyone can view)
create policy "book_covers_read"
on storage.objects for select
to public
using (bucket_id = 'book-covers');

create policy "book_covers_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'book-covers');

-- Storage policies for profile-photos bucket
-- Users can upload their own profile photos
create policy "profile_photos_upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can read all profile photos (public access)
create policy "profile_photos_read"
on storage.objects for select
to public
using (bucket_id = 'profile-photos');

-- Users can update/delete their own profile photos
create policy "profile_photos_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "profile_photos_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

