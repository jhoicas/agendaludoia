import { useAuth } from '../../app/providers/AuthProvider';

// Mapeo de roles a descripciones legibles
const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Administrador Global',
  clinic_admin: 'Administrador de Clínica',
  physio: 'Fisioterapeuta',
  nutritionist: 'Nutricionista',
  general_doctor: 'Médico General',
  patient: 'Paciente',
};

export function TopNavBar() {
  const { fullName, role } = useAuth();
  
  // Extraer las iniciales del nombre
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(fullName);
  const displayName = fullName || 'Usuario Clínico';
  const displayRole = ROLE_LABELS[role] || 'Personal Clínico';

  return (
    <header className="fixed top-0 right-0 left-0 md:left-72 h-[72px] flex justify-between items-center px-6 w-auto backdrop-blur-md bg-glass-surface border-b border-outline-variant/20 shadow-sm z-10 transition-all duration-300">
      {/* Search Input */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant text-xl">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-full text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface placeholder:text-on-surface-variant/60"
            placeholder="Buscar pacientes, métricas, citas..."
            type="text"
          />
        </div>
      </div>

      {/* User Session Actions */}
      <div className="flex items-center gap-4 ml-auto">
        <button className="p-2 text-on-surface-variant hover:bg-primary/10 rounded-full transition-colors cursor-pointer active:scale-95 relative">
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <button className="p-2 text-on-surface-variant hover:bg-primary/10 rounded-full transition-colors cursor-pointer active:scale-95">
          <span className="material-symbols-outlined text-xl">help</span>
        </button>

        <div className="h-6 w-px bg-outline-variant/30 mx-1"></div>

        {/* Doctor / Practitioner Badge */}
        <div className="flex items-center gap-3 hover:bg-primary/5 p-1.5 rounded-full transition-colors cursor-pointer pr-3">
          <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center border border-outline-variant/30 text-sm">
            {initials}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-on-surface leading-tight truncate max-w-[150px]">{displayName}</p>
            <p className="text-[11px] text-on-surface-variant font-medium truncate max-w-[150px]">{displayRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
