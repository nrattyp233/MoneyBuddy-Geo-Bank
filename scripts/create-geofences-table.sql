-- Create geofences table for location-based transfers
-- Execute this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create geofences table
CREATE TABLE IF NOT EXISTS public.geofences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    transaction_id UUID,
    name TEXT NOT NULL,
    center_lat DOUBLE PRECISION NOT NULL,
    center_lng DOUBLE PRECISION NOT NULL,
    radius INTEGER NOT NULL DEFAULT 100,
    amount DECIMAL(10,2) NOT NULL,
    recipient_email TEXT NOT NULL,
    recipient_id UUID,
    memo TEXT,
    is_active BOOLEAN DEFAULT true,
    is_claimed BOOLEAN DEFAULT false,
    claimed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_geofences_user_id ON public.geofences(user_id);
CREATE INDEX IF NOT EXISTS idx_geofences_active ON public.geofences(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_geofences_location ON public.geofences(center_lat, center_lng);
CREATE INDEX IF NOT EXISTS idx_geofences_recipient ON public.geofences(recipient_email);

-- Create function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION public.point_in_geofence(
    check_lat DOUBLE PRECISION,
    check_lng DOUBLE PRECISION,
    center_lat DOUBLE PRECISION,
    center_lng DOUBLE PRECISION,
    radius_meters INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    earth_radius CONSTANT DOUBLE PRECISION := 6371000; -- Earth radius in meters
    lat1_rad DOUBLE PRECISION;
    lat2_rad DOUBLE PRECISION;
    delta_lat DOUBLE PRECISION;
    delta_lng DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
    distance DOUBLE PRECISION;
BEGIN
    -- Convert degrees to radians
    lat1_rad := radians(check_lat);
    lat2_rad := radians(center_lat);
    delta_lat := radians(center_lat - check_lat);
    delta_lng := radians(center_lng - check_lng);

    -- Haversine formula
    a := sin(delta_lat/2) * sin(delta_lat/2) + 
         cos(lat1_rad) * cos(lat2_rad) * 
         sin(delta_lng/2) * sin(delta_lng/2);
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    distance := earth_radius * c;

    RETURN distance <= radius_meters;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to get active geofences at a location
CREATE OR REPLACE FUNCTION public.get_active_geofences_at_location(
    check_lat DOUBLE PRECISION,
    check_lng DOUBLE PRECISION
) RETURNS SETOF public.geofences AS $$
BEGIN
    RETURN QUERY
    SELECT g.*
    FROM public.geofences g
    WHERE g.is_active = true
      AND g.is_claimed = false
      AND (g.expires_at IS NULL OR g.expires_at > NOW())
      AND public.point_in_geofence(check_lat, check_lng, g.center_lat, g.center_lng, g.radius);
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_geofences_updated_at
    BEFORE UPDATE ON public.geofences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.geofences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own geofences" ON public.geofences
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own geofences" ON public.geofences
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own geofences" ON public.geofences
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own geofences" ON public.geofences
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Grant necessary permissions
GRANT ALL ON public.geofences TO authenticated;
GRANT ALL ON public.geofences TO service_role;

-- Insert sample geofence for testing
INSERT INTO public.geofences (
    user_id,
    name,
    center_lat,
    center_lng,
    radius,
    amount,
    recipient_email,
    memo
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Coffee Shop Transfer',
    40.7128,
    -74.0060,
    50,
    25.00,
    'friend@example.com',
    'Coffee money when you get to the shop!'
) ON CONFLICT DO NOTHING;
