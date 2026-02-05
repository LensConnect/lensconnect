-- ==========================================
-- SQL to fix "new row violates row-level security policy"
-- for the photographer_portfolio table.
-- ==========================================

-- 1. Enable RLS
ALTER TABLE photographer_portfolio ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid name/logic conflicts
DROP POLICY IF EXISTS "Anyone can view portfolios" ON photographer_portfolio;
DROP POLICY IF EXISTS "Photographers can upload their own portfolios" ON photographer_portfolio;
DROP POLICY IF EXISTS "Photographers can update their own portfolios" ON photographer_portfolio;
DROP POLICY IF EXISTS "Photographers can delete their own portfolios" ON photographer_portfolio;
DROP POLICY IF EXISTS "Users can insert their own portfolio" ON photographer_portfolio;
DROP POLICY IF EXISTS "Public can view portfolios" ON photographer_portfolio;
DROP POLICY IF EXISTS "Users can update their own portfolio" ON photographer_portfolio;
DROP POLICY IF EXISTS "Users can delete their own portfolio" ON photographer_portfolio;

-- 3. Create Robust Policies

-- Allow public read access
CREATE POLICY "Anyone can view portfolios"
ON photographer_portfolio FOR SELECT 
USING (true);

-- Allow insertion with ROBUST role check and owner check
-- ILIKE handles 'Photographer' vs 'photographer'
CREATE POLICY "Photographers can upload their own portfolios"
ON photographer_portfolio FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = photographer_id AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role ILIKE 'photographer'
  )
);

-- Allow update/delete by owner
CREATE POLICY "Photographers can update their own portfolios"
ON photographer_portfolio FOR UPDATE 
TO authenticated
USING (auth.uid() = photographer_id);

CREATE POLICY "Photographers can delete their own portfolios"
ON photographer_portfolio FOR DELETE 
TO authenticated
USING (auth.uid() = photographer_id);
