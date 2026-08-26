-- Expansión de roles de usuario
-- Se elimina la restricción anterior y se añade la nueva para admitir nuevos perfiles médicos

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (
    role IN (
        'super_admin',
        'clinic_admin',
        'physio',
        'nutritionist',
        'general_doctor',
        'patient'
    )
);
