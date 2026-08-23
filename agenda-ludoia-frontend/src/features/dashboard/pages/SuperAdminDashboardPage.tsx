import { SideNavBar } from '../../../components/layout/SideNavBar';
import { TopNavBar } from '../../../components/layout/TopNavBar';

export function SuperAdminDashboardPage() {
  return (
    <div className="min-h-screen flex bg-background font-sans text-on-background overflow-hidden">
      <SideNavBar />

      <main className="flex-1 ml-0 md:ml-72 flex flex-col h-screen overflow-hidden">
        <TopNavBar />

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto pt-[96px] pb-10 px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-primary tracking-tight mb-1">Super Admin Overview</h2>
            <p className="text-sm text-on-surface-variant">System health, financial metrics, and tenant management.</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Metric Card 1: Total MRR */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 clinical-shadow border border-outline-variant/20">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary-container/20 text-primary rounded-xl">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <span className="bg-secondary-container text-on-secondary-container text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">arrow_upward</span> 12.5%
                </span>
              </div>
              <p className="text-xs font-semibold text-on-surface-variant mb-1">Total MRR</p>
              <h3 className="text-3xl font-extrabold text-on-surface">$142,500</h3>
            </div>

            {/* Metric Card 2: Active Tenants */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 clinical-shadow border border-outline-variant/20">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-tertiary-container/10 text-tertiary-container rounded-xl">
                  <span className="material-symbols-outlined">domain</span>
                </div>
                <span className="bg-secondary-container text-on-secondary-container text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">arrow_upward</span> 4.2%
                </span>
              </div>
              <p className="text-xs font-semibold text-on-surface-variant mb-1">Active Tenants</p>
              <h3 className="text-3xl font-extrabold text-on-surface">348</h3>
            </div>

            {/* Metric Card 3: Total Patients */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 clinical-shadow border border-outline-variant/20">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-secondary-container/20 text-secondary rounded-xl">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <span className="bg-surface-variant text-on-surface-variant text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">horizontal_rule</span> 0%
                </span>
              </div>
              <p className="text-xs font-semibold text-on-surface-variant mb-1">Total Patients</p>
              <h3 className="text-3xl font-extrabold text-on-surface">45.2k</h3>
            </div>

            {/* Metric Card 4: System Uptime */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 clinical-shadow border border-outline-variant/20">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-error-container/20 text-error rounded-xl">
                  <span className="material-symbols-outlined">dns</span>
                </div>
                <span className="bg-error-container text-on-error-container text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">warning</span> 1 Alert
                </span>
              </div>
              <p className="text-xs font-semibold text-on-surface-variant mb-1">System Uptime</p>
              <h3 className="text-3xl font-extrabold text-on-surface">99.98%</h3>
            </div>
          </div>

          {/* Tables and System Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Tenants Table */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl clinical-shadow border border-outline-variant/20 flex flex-col h-[460px]">
              <div className="p-5 border-b border-outline-variant/20 flex justify-between items-center bg-surface-bright rounded-t-2xl">
                <h3 className="text-lg font-bold text-on-surface">Recent Tenants</h3>
                <button className="text-primary text-xs font-semibold hover:underline cursor-pointer">View All</button>
              </div>
              <div className="flex-1 overflow-auto p-5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-xs font-semibold text-on-surface-variant">
                      <th className="pb-3">Clinic Name</th>
                      <th className="pb-3">Plan</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">MRR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/15 text-sm">
                    <tr className="hover:bg-surface-container-low transition-colors cursor-pointer">
                      <td className="py-3 font-medium text-on-surface flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">M</div>
                        Metro Health Clinic
                      </td>
                      <td className="py-3 text-on-surface-variant text-xs font-medium">Enterprise</td>
                      <td className="py-3">
                        <span className="bg-secondary-container text-on-secondary-container text-[11px] font-bold px-2.5 py-0.5 rounded-full">Active</span>
                      </td>
                      <td className="py-3 text-right font-bold text-on-surface">$1,200</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors cursor-pointer">
                      <td className="py-3 font-medium text-on-surface flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-tertiary-container/10 text-tertiary-container font-bold flex items-center justify-center text-xs">V</div>
                        Valley Physio Center
                      </td>
                      <td className="py-3 text-on-surface-variant text-xs font-medium">Professional</td>
                      <td className="py-3">
                        <span className="bg-secondary-container text-on-secondary-container text-[11px] font-bold px-2.5 py-0.5 rounded-full">Active</span>
                      </td>
                      <td className="py-3 text-right font-bold text-on-surface">$450</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors cursor-pointer">
                      <td className="py-3 font-medium text-on-surface flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-error/10 text-error font-bold flex items-center justify-center text-xs">C</div>
                        Coastal Care Sports
                      </td>
                      <td className="py-3 text-on-surface-variant text-xs font-medium">Basic</td>
                      <td className="py-3">
                        <span className="bg-error-container text-on-error-container text-[11px] font-bold px-2.5 py-0.5 rounded-full">Past Due</span>
                      </td>
                      <td className="py-3 text-right font-bold text-on-surface">$150</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Server Health Status */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 clinical-shadow border border-outline-variant/20 h-[460px] flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-on-surface mb-5">Server & DB Health</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="text-on-surface-variant font-medium">CPU Usage (US-East)</span>
                      <span className="text-on-surface font-bold">45%</span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="text-on-surface-variant font-medium">Memory (DB Cluster)</span>
                      <span className="text-pain-mid font-bold">78%</span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-2">
                      <div className="bg-pain-mid h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="text-on-surface-variant font-medium">Storage Allocation</span>
                      <span className="text-on-surface font-bold">32%</span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: '32%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs py-2.5 rounded-xl transition-colors border border-outline-variant/30 flex items-center justify-center gap-2 cursor-pointer">
                <span className="material-symbols-outlined text-sm">terminal</span>
                Abrir Consola de Logs Supabase
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
