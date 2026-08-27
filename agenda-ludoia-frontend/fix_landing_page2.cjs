const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/services/supabaseClient.ts');

const pricingPlans = `
export const PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Starter Plan',
    tagline: 'Ideal para profesionales independientes o consultorios individuales.',
    price_cop: 119000,
    price_clp: 24990,
    price_usd: 29,
    max_users: 1,
    trial_days: 7,
    popular: false,
    features: [
      '1 Usuario profesional con acceso total',
      'Agenda mAcdica interactiva con recordatorios',
      'Ficha clA-nica y Mapa de Dolor 2D',
      'Portal del Paciente para auto-agendamiento',
      'Pasarela de pagos Wompi integrada (COP)',
      'Soporte por email 24/7',
    ],
  },
  {
    id: 'growth',
    name: 'Growth Plan',
    tagline: 'Ideal para clA-nicas y consultorios con mAAs de 2 profesionales.',
    price_cop: 249000,
    price_clp: 49990,
    price_usd: 59,
    max_users: 5,
    trial_days: 7,
    popular: true,
    features: [
      'Hasta 5 Usuarios profesionales',
      'Todas las funciones del plan Starter',
      'MAdulos avanzados (NutriciA3n, Fisioterapia)',
      'PersonalizaciA3n de marca (White-label)',
      'Reportes y analA-ticas clA-nicas',
      'Soporte prioritario',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Ideal para clA-nicas de gran volumen.',
    price_cop: 449000,
    price_clp: 89990,
    price_usd: 99,
    max_users: 20,
    trial_days: 7,
    popular: false,
    features: [
      'Usuarios ilimitados',
      'Integraciones API y Webhooks',
      'MigraciA3n asistida de base de datos',
      'Gerente de cuenta dedicado',
      'SLA garantizado del 99.9%',
    ],
  }
];
`;

fs.appendFileSync(file, pricingPlans, 'utf8');
console.log('Appended PRICING_PLANS.');
