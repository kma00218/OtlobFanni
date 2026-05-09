-- ============================================================
-- اطلب فني - Otlob Fanni Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

-- Cities table (must be created before profiles and technicians)
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text UNIQUE,
  role text CHECK (role IN ('super_admin','sub_admin','technician','user')) DEFAULT 'user',
  city_id uuid REFERENCES cities(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  icon text DEFAULT 'Wrench',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Technicians table
CREATE TABLE IF NOT EXISTS technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text,
  phone text,
  whatsapp text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  city_id uuid REFERENCES cities(id) ON DELETE SET NULL,
  rating numeric DEFAULT 0,
  reviews_count integer DEFAULT 0,
  experience_years integer DEFAULT 0,
  price_from numeric DEFAULT 0,
  status text CHECK (status IN ('available','busy','inactive')) DEFAULT 'available',
  description_ar text,
  description_en text,
  image_url text,
  is_featured boolean DEFAULT false,
  is_approved boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Service Requests table
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text,
  customer_phone text,
  city_id uuid REFERENCES cities(id) ON DELETE SET NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  technician_id uuid REFERENCES technicians(id) ON DELETE SET NULL,
  description text,
  status text CHECK (status IN ('new','assigned','in_progress','completed','cancelled')) DEFAULT 'new',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Ads table
CREATE TABLE IF NOT EXISTS ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text,
  title_en text,
  description_ar text,
  description_en text,
  image_url text,
  link_url text,
  placement text DEFAULT 'home',
  is_active boolean DEFAULT true,
  start_date date,
  end_date date,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- App Settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamp DEFAULT now()
);

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text,
  table_name text,
  record_id uuid,
  details text,
  created_at timestamp DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to get current user city_id
CREATE OR REPLACE FUNCTION get_my_city_id()
RETURNS uuid AS $$
  SELECT city_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is active
CREATE OR REPLACE FUNCTION is_my_account_active()
RETURNS boolean AS $$
  SELECT is_active FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- CITIES POLICIES
-- ============================================================
CREATE POLICY "public_read_active_cities" ON cities
  FOR SELECT USING (is_active = true);

CREATE POLICY "super_admin_all_cities" ON cities
  FOR ALL USING (get_my_role() = 'super_admin' AND is_my_account_active() = true);

-- ============================================================
-- CATEGORIES POLICIES
-- ============================================================
CREATE POLICY "public_read_active_categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "super_admin_all_categories" ON categories
  FOR ALL USING (get_my_role() = 'super_admin' AND is_my_account_active() = true);

-- ============================================================
-- PROFILES POLICIES
-- ============================================================
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "super_admin_all_profiles" ON profiles
  FOR ALL USING (get_my_role() = 'super_admin' AND is_my_account_active() = true);

CREATE POLICY "sub_admin_read_own_profile" ON profiles
  FOR SELECT USING (get_my_role() = 'sub_admin' AND auth.uid() = id);

-- ============================================================
-- TECHNICIANS POLICIES
-- ============================================================
CREATE POLICY "public_read_active_technicians" ON technicians
  FOR SELECT USING (is_active = true AND is_approved = true);

CREATE POLICY "super_admin_all_technicians" ON technicians
  FOR ALL USING (get_my_role() = 'super_admin' AND is_my_account_active() = true);

CREATE POLICY "sub_admin_read_city_technicians" ON technicians
  FOR SELECT USING (
    get_my_role() = 'sub_admin' 
    AND is_my_account_active() = true
    AND city_id = get_my_city_id()
  );

CREATE POLICY "sub_admin_insert_city_technicians" ON technicians
  FOR INSERT WITH CHECK (
    get_my_role() = 'sub_admin'
    AND is_my_account_active() = true
    AND city_id = get_my_city_id()
  );

CREATE POLICY "sub_admin_update_city_technicians" ON technicians
  FOR UPDATE USING (
    get_my_role() = 'sub_admin'
    AND is_my_account_active() = true
    AND city_id = get_my_city_id()
  );

-- ============================================================
-- SERVICE REQUESTS POLICIES
-- ============================================================
CREATE POLICY "public_insert_requests" ON service_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "super_admin_all_requests" ON service_requests
  FOR ALL USING (get_my_role() = 'super_admin' AND is_my_account_active() = true);

CREATE POLICY "sub_admin_read_city_requests" ON service_requests
  FOR SELECT USING (
    get_my_role() = 'sub_admin'
    AND is_my_account_active() = true
    AND city_id = get_my_city_id()
  );

CREATE POLICY "sub_admin_update_city_requests" ON service_requests
  FOR UPDATE USING (
    get_my_role() = 'sub_admin'
    AND is_my_account_active() = true
    AND city_id = get_my_city_id()
  );

-- ============================================================
-- ADS POLICIES
-- ============================================================
CREATE POLICY "public_read_active_ads" ON ads
  FOR SELECT USING (is_active = true);

CREATE POLICY "super_admin_all_ads" ON ads
  FOR ALL USING (get_my_role() = 'super_admin' AND is_my_account_active() = true);

-- ============================================================
-- APP SETTINGS POLICIES
-- ============================================================
CREATE POLICY "public_read_settings" ON app_settings
  FOR SELECT USING (true);

CREATE POLICY "super_admin_all_settings" ON app_settings
  FOR ALL USING (get_my_role() = 'super_admin' AND is_my_account_active() = true);

-- ============================================================
-- ACTIVITY LOGS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_logs" ON activity_logs
  FOR ALL USING (get_my_role() = 'super_admin' AND is_my_account_active() = true);

CREATE POLICY "sub_admin_insert_logs" ON activity_logs
  FOR INSERT WITH CHECK (
    get_my_role() IN ('super_admin','sub_admin')
    AND is_my_account_active() = true
  );

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cities_updated_at BEFORE UPDATE ON cities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER technicians_updated_at BEFORE UPDATE ON technicians FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER service_requests_updated_at BEFORE UPDATE ON service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- TRIGGER: auto-create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SEED DATA: Cities
-- ============================================================
INSERT INTO cities (name_ar, name_en, sort_order) VALUES
  ('طرابلس', 'Tripoli', 1),
  ('بنغازي', 'Benghazi', 2),
  ('مصراتة', 'Misrata', 3),
  ('الزاوية', 'Zawiya', 4),
  ('سبها', 'Sabha', 5),
  ('البيضاء', 'Al Bayda', 6),
  ('الخمس', 'Al Khoms', 7),
  ('زليتن', 'Zliten', 8),
  ('صبراتة', 'Sabratha', 9),
  ('زوارة', 'Zuwara', 10),
  ('غريان', 'Gharyan', 11),
  ('ترهونة', 'Tarhuna', 12),
  ('اجدابيا', 'Ajdabiya', 13),
  ('درنة', 'Derna', 14),
  ('طبرق', 'Tobruk', 15),
  ('المرج', 'Al Marj', 16),
  ('سرت', 'Sirte', 17),
  ('بني وليد', 'Bani Walid', 18),
  ('نالوت', 'Nalut', 19),
  ('الزنتان', 'Zintan', 20),
  ('صرمان', 'Surman', 21),
  ('مسلاتة', 'Msallata', 22),
  ('الرجبان', 'Al Rajban', 23)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: Categories
-- ============================================================
INSERT INTO categories (name_ar, name_en, icon, sort_order) VALUES
  ('كهرباء', 'Electricity', 'Zap', 1),
  ('سباكة', 'Plumbing', 'Droplets', 2),
  ('تكييف', 'Air Conditioning', 'Wind', 3),
  ('دهانات', 'Painting', 'Paintbrush', 4),
  ('نجارة', 'Carpentry', 'Hammer', 5),
  ('تنظيف', 'Cleaning', 'Sparkles', 6),
  ('نقل أثاث', 'Furniture Moving', 'Truck', 7),
  ('كاميرات مراقبة', 'CCTV', 'Camera', 8),
  ('شبكات وإنترنت', 'Networks & Internet', 'Wifi', 9),
  ('صيانة عامة', 'General Maintenance', 'Wrench', 10),
  ('أجهزة منزلية', 'Home Appliances', 'Tv', 11),
  ('حدادة', 'Welding', 'Flame', 12),
  ('ألمنيوم وزجاج', 'Aluminum & Glass', 'Square', 13),
  ('عزل مائي', 'Waterproofing', 'Droplet', 14),
  ('عزل حراري', 'Thermal Insulation', 'Thermometer', 15),
  ('تأسيس غاز', 'Gas Installation', 'Gauge', 16),
  ('أقفال وأبواب', 'Locks & Doors', 'Lock', 17),
  ('مقاولات', 'Contracting', 'Building2', 18),
  ('مكيفات', 'AC Units', 'AirVent', 19),
  ('خدمات أخرى', 'Other Services', 'Grid3X3', 20)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: App Settings
-- ============================================================
INSERT INTO app_settings (key, value) VALUES
  ('app_name_ar', 'اطلب فني'),
  ('app_name_en', 'Otlob Fanni'),
  ('slogan_ar', 'الفني الأقرب إليك'),
  ('slogan_en', 'The nearest technician to you'),
  ('support_whatsapp', '+218910000000'),
  ('support_phone', '+218910000000'),
  ('support_email', 'support@otlobfanni.ly'),
  ('default_city', 'طرابلس'),
  ('ads_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
