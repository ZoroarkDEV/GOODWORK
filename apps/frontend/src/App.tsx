import { useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  DoorOpen, 
  Package, 
  Bell, 
  User, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  Menu,
  X
} from 'lucide-react';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mock data for beautiful presentation
  const kpis = [
    {
      title: 'Taxa de Ocupação',
      value: '78.4%',
      change: '+4.2% esta semana',
      trendUp: true,
      icon: TrendingUp,
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 14.850,00',
      change: '+12.5% vs mês anterior',
      trendUp: true,
      icon: DollarSign,
      color: 'text-teal-400 bg-teal-500/10',
    },
    {
      title: 'Suprimentos Críticos',
      value: '2 itens',
      change: 'Necessita atenção urgente',
      trendUp: false,
      icon: AlertTriangle,
      color: 'text-amber-400 bg-amber-500/10',
    },
    {
      title: 'Reservas Ativas',
      value: '42',
      change: '12 para hoje',
      trendUp: true,
      icon: CheckCircle,
      color: 'text-blue-400 bg-blue-500/10',
    },
  ];

  const recentBookings = [
    { id: 1, room: 'Sala Executive Ocean', user: 'Ana Paula (CEO TechCorp)', time: '14:00 - 16:30', status: 'Confirmado' },
    { id: 2, room: 'Sala Focus Studio', user: 'Bruno Ramos (UX Designer)', time: '15:30 - 17:00', status: 'Pendente' },
    { id: 3, room: 'Sala Executive Ocean', user: 'Carlos G. (Consultor Sênior)', time: '17:00 - 18:30', status: 'Confirmado' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center font-bold text-slate-900">
              GW
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              GOODWORK
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-100 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-slate-900"></span>
          </button>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="flex items-center gap-2 pl-1 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700 group-hover:border-teal-500 transition-colors">
              <User size={16} />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-300 group-hover:text-slate-100 transition-colors">José Valentim</p>
              <p className="text-[10px] text-slate-500">Administrador</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`w-64 bg-slate-900 border-r border-slate-800/80 p-4 space-y-6 flex-shrink-0 transition-all duration-300 ${
            sidebarOpen ? 'translate-x-0 block' : '-translate-x-full hidden'
          }`}
        >
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Menu Principal</p>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-teal-500/10 to-transparent border-l-2 border-teal-500 text-teal-400 rounded-r-md font-medium text-sm transition-all">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-md font-medium text-sm transition-all border-l-2 border-transparent">
              <Calendar size={18} />
              <span>Reservas</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-md font-medium text-sm transition-all border-l-2 border-transparent">
              <DoorOpen size={18} />
              <span>Salas</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-md font-medium text-sm transition-all border-l-2 border-transparent">
              <Package size={18} />
              <span>Suprimentos</span>
            </a>
          </div>
        </aside>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-950">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Olá, José Valentim</h1>
            <p className="text-slate-400 text-sm mt-0.5">Aqui está a visão geral operacional do seu coworking hoje.</p>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/80 transition-all hover:translate-y-[-2px] duration-300 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-slate-400">{kpi.title}</span>
                  <div className={`p-2 rounded-lg ${kpi.color}`}>
                    <kpi.icon size={20} />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-bold text-white tracking-tight">{kpi.value}</h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    {kpi.change}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Bookings Card */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white tracking-tight">Reservas Recentes</h2>
                <a href="#" className="text-xs text-teal-400 hover:text-teal-300 font-medium">Ver todas</a>
              </div>
              <div className="space-y-4">
                {recentBookings.map((b) => (
                  <div key={b.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800/60 hover:border-slate-700/60 transition-colors">
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm">{b.room}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{b.user} • {b.time}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        b.status === 'Confirmado' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Setup Card */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight mb-2">Fundação Concluída</h2>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  O monorepo está estruturado e o Docker está rodando o banco relacional localmente.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Docker Compose Rodando</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Banco Postgres schema inicial</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Frontend Vite + React 18 + TS</span>
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <button className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 text-sm font-bold py-2.5 px-4 rounded-lg shadow-lg hover:shadow-teal-500/10 transition-all duration-300">
                  Pronto para Sprint 2
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
