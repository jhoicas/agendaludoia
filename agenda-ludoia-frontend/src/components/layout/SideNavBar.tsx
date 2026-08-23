import { Link, useLocation } from 'react-router-dom';

export function SideNavBar() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Pacientes', path: '/patients', icon: 'group' },
    { name: 'Calendario', path: '/appointments', icon: 'calendar_today' },
    { name: 'Mapa de Dolor', path: '/pain-map', icon: 'accessibility_new' },
    { name: 'Analíticas', path: '/analytics', icon: 'analytics' },
    { name: 'Configuración', path: '/settings', icon: 'settings' },
  ];

  return (
    <nav className="hidden md:flex flex-col h-full p-6 bg-surface-container-lowest border-r border-outline-variant/30 shadow-lg fixed left-0 top-0 bottom-0 w-72 z-20">
      {/* Brand Logo Header */}
      <div className="mb-8 flex items-center gap-3">
        <img src="/logo.png" alt="AgendaLudoia Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
        <div>
          <h1 className="font-extrabold text-xl text-primary tracking-tight">AgendaLudoia</h1>
          <p className="text-xs text-on-surface-variant font-medium">Portal Clínico</p>
        </div>
      </div>

      {/* New Appointment Action Button */}
      <Link
        to="/appointments/new"
        className="mb-6 bg-primary text-on-primary font-semibold text-sm py-3 px-4 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-xl">add</span>
        Nueva Cita
      </Link>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-all font-medium ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bottom Footer Actions */}
      <div className="mt-auto pt-4 border-t border-outline-variant/30 space-y-1">
        <Link
          to="/support"
          className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-all text-sm font-medium"
        >
          <span className="material-symbols-outlined text-xl">support_agent</span>
          Soporte
        </Link>
        <Link
          to="/login"
          className="flex items-center gap-3 p-3 text-error hover:bg-error-container/40 rounded-xl transition-all text-sm font-medium"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Cerrar Sesión
        </Link>
      </div>
    </nav>
  );
}
