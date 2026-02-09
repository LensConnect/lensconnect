-- =========================================
-- STORAGE BUCKET RLS (REFINED)
-- =========================================

-- Note: Ensure 'portfolios' bucket exists in Supabase Storage

-- 1. Public Read Access for Portfolios
-- This allows clients to actually see the images in the portfolio
create policy "Public can view portfolio assets"
on storage.objects for select
using ( bucket_id = 'portfolios' );

-- 2. Authenticated Uploads
-- Restricted to the 'portfolios' bucket and owner-only
create policy "Photographers can upload portfolio assets"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'portfolios' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Owner Management (Update/Delete)
create policy "Owners can manage their portfolio assets"
on storage.objects for update, delete
to authenticated
using (
  bucket_id = 'portfolios' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
