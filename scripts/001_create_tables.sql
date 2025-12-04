-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  classe TEXT NOT NULL,
  annee TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create lots table
CREATE TABLE IF NOT EXISTS lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INT NOT NULL,
  nom TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  numero INT NOT NULL UNIQUE,
  winner BOOLEAN DEFAULT FALSE,
  lot TEXT,
  drawn_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create draw_settings table
CREATE TABLE IF NOT EXISTS draw_settings (
  id INT PRIMARY KEY DEFAULT 1,
  draw_date DATE,
  draw_time TIME,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can insert their own tickets" ON tickets;
DROP POLICY IF EXISTS "Service role can manage tickets" ON tickets;
DROP POLICY IF EXISTS "Everyone can view lots" ON lots;
DROP POLICY IF EXISTS "Everyone can view draw settings" ON draw_settings;
DROP POLICY IF EXISTS "Service role can manage draw settings" ON draw_settings;

-- RLS policies for profiles - Allow ANON to insert during signup
CREATE POLICY "Enable insert for auth users" ON profiles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS policies for tickets
CREATE POLICY "Users can view their own tickets" ON tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tickets" ON tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role can manage tickets" ON tickets FOR ALL USING (auth.role() = 'service_role');

-- RLS policies for lots (everyone can view)
CREATE POLICY "Everyone can view lots" ON lots FOR SELECT USING (TRUE);

-- RLS policies for draw_settings (everyone can view)
CREATE POLICY "Everyone can view draw settings" ON draw_settings FOR SELECT USING (TRUE);
CREATE POLICY "Service role can manage draw settings" ON draw_settings FOR ALL USING (auth.role() = 'service_role');

-- Create or replace profiles trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nom, prenom, classe, annee)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.user_metadata->>'nom', ''),
    COALESCE(NEW.user_metadata->>'prenom', ''),
    COALESCE(NEW.user_metadata->>'classe', ''),
    COALESCE(NEW.user_metadata->>'annee', '')
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
