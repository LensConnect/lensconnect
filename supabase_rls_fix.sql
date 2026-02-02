-- Add missing INSERT policies for profiles and photographer_profiles

-- Allow users to insert their own core profile (if not already handled by a trigger)
CREATE POLICY "Users can insert own profile" 
ON profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow photographers to insert their own extended profile
CREATE POLICY "Photographers can insert own extended profile" 
ON photographer_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);
