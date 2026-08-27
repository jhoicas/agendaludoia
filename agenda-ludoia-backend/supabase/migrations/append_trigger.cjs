const fs = require('fs');
const path = require('path');

const file = 'c:\\Users\\yoiner.castillo\\source\\repos\\AgendadorLudoia\\agenda-ludoia-backend\\supabase\\migrations\\20260827000001_kinesys_schemas.sql';

const triggerCode = `

-- ==============================================================================
-- 7. TRIGGER DE SINCRONIZACIÓN AUTH.USERS -> PUBLIC.USERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_app_meta_data->>'role', new.raw_user_meta_data->>'role', 'patient')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`;

fs.appendFileSync(file, triggerCode, 'utf8');
console.log('Trigger added to migration file.');
