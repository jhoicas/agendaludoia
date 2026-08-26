-- Corrección del trigger de auth para crear el usuario en public.users
-- Maneja casos de Magic Link donde raw_user_meta_data viene vacío
-- Define SECURITY DEFINER y SET search_path = public para evitar problemas con RLS

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  default_tenant_id UUID;
BEGIN
  -- Obtenemos un tenant por defecto en caso de que los metadatos vengan vacíos (Magic Link)
  SELECT id INTO default_tenant_id FROM public.tenants LIMIT 1;

  INSERT INTO public.users (id, tenant_id, role, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'tenant_id')::uuid, default_tenant_id),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email; -- Permitimos actualizar si el usuario ya existe por algún motivo

  RETURN NEW;
END;
$$;

-- Aseguramos que el trigger esté asignado a auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
