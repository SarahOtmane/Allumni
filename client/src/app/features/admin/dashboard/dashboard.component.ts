import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, DashboardStats } from '../services/admin.service';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';
import { DashboardLoadingComponent } from './dashboard.loading';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, StatsCardComponent, DashboardLoadingComponent, RouterLink],
  template: `
    <div class="p-8 bg-[#F8FAFC] min-h-screen font-sans selection:bg-indigo-100">
      
      <!-- TOP NAV / WELCOME SECTION -->
      <header class="mb-12 relative overflow-hidden rounded-[2rem] bg-slate-900 p-10 text-white shadow-2xl shadow-slate-200">
        <!-- Abstract Background Glows -->
        <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full"></div>
        <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-violet-600/20 blur-[100px] rounded-full"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div class="text-center md:text-left">
            <h1 class="text-4xl font-black tracking-tight mb-3 italic">
              Tableau de <span class="text-indigo-400 not-italic">Pilotage</span>
            </h1>
            <p class="text-slate-400 font-medium text-lg max-w-md leading-relaxed">
              {{ stats()?.alumni?.total || 0 }} Alumni connectés. La communauté s'agrandit de 
              <span class="text-emerald-400 font-bold">+12%</span> cette semaine.
            </p>
          </div>
          
          <div class="flex flex-wrap justify-center gap-3">
             <button routerLink="/admin/promos" class="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-sm font-black transition-all border border-white/10 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                Importer CSV
             </button>
             <button routerLink="/admin/events/new" class="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-2xl text-sm font-black transition-all shadow-xl shadow-indigo-500/20 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Événement
             </button>
          </div>
        </div>
      </header>

      @if (isLoading()) {
        <app-dashboard-loading />
      } @else if (stats()) {
        <!-- BENTO GRID SYSTEM -->
        <div class="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-[180px]">
          
          <!-- LARGE METRIC: TOTAL ALUMNI (Col-6, Row-2) -->
          <div class="md:col-span-6 lg:col-span-4 row-span-2 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-indigo-200 transition-all duration-500">
             <div>
               <div class="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                  <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
               </div>
               <h3 class="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Alumni</h3>
               <div class="text-7xl font-black text-slate-900 tracking-tighter">{{ stats()!.alumni.total }}</div>
             </div>
             <div class="flex items-center text-emerald-500 font-bold text-sm">
                <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                +24 nouveaux ce mois
             </div>
          </div>

          <!-- MEDIUM METRIC: ACTIVATION RATE (Col-4, Row-2) -->
          <div class="md:col-span-6 lg:col-span-4 row-span-2 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center group hover:border-violet-200 transition-all duration-500">
             <div class="relative w-40 h-40 mb-6">
                <!-- SVG Progress Circle -->
                <svg class="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" stroke-width="12" fill="transparent" class="text-slate-50" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" stroke-width="12" fill="transparent" 
                          [attr.stroke-dasharray]="440" 
                          [attr.stroke-dashoffset]="440 - (440 * activityRate / 100)"
                          class="text-violet-500 transition-all duration-1000 ease-out" stroke-linecap="round" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                   <span class="text-3xl font-black text-slate-900">{{ activityRate }}%</span>
                   <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actifs</span>
                </div>
             </div>
             <h3 class="text-sm font-black text-slate-900 italic tracking-tight">Taux d'engagement</h3>
             <p class="text-xs text-slate-400 font-medium mt-1">Calculé sur les profils enrichis</p>
          </div>

          <!-- MINI CARDS (Col-4, Row-1) -->
          <div class="md:col-span-3 lg:col-span-2 row-span-1 bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100/50 flex flex-col justify-between group hover:scale-[1.02] transition-all">
             <span class="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Jobs Ouverts</span>
             <div class="flex justify-between items-end">
                <span class="text-4xl font-black text-emerald-700 tracking-tighter">{{ stats()!.jobsCount }}</span>
                <svg class="w-6 h-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
             </div>
          </div>

          <div class="md:col-span-3 lg:col-span-2 row-span-1 bg-amber-50 rounded-[2rem] p-6 border border-amber-100/50 flex flex-col justify-between group hover:scale-[1.02] transition-all">
             <span class="text-[10px] font-black text-amber-600 uppercase tracking-widest">Promotions</span>
             <div class="flex justify-between items-end">
                <span class="text-4xl font-black text-amber-700 tracking-tighter">{{ stats()!.promotionsCount }}</span>
                <svg class="w-6 h-6 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" /></svg>
             </div>
          </div>

          <!-- ACTIVITY FEED (Col-4, Row-1) - Simulated -->
          <div class="md:col-span-6 lg:col-span-4 row-span-1 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 overflow-hidden relative group">
             <div class="flex items-center justify-between mb-4">
                <h3 class="text-xs font-black text-slate-900 uppercase tracking-widest italic">Activité Récente</h3>
                <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
             </div>
             <div class="space-y-3">
                <div class="flex items-center text-[11px] font-bold text-slate-500">
                   <div class="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center mr-3 font-black">S</div>
                   <span>Sarah O. a rejoint la Promo 2024</span>
                </div>
                <div class="flex items-center text-[11px] font-bold text-slate-500">
                   <div class="w-6 h-6 rounded-lg bg-violet-50 text-violet-500 flex items-center justify-center mr-3 font-black">L</div>
                   <span>Nouveau job publié par Lucas R.</span>
                </div>
             </div>
             <!-- Gradient Overlay for "Fade out" effect -->
             <div class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
          </div>

          <!-- LARGE CTA / STAT (Col-4, Row-1) -->
          <div class="md:col-span-6 lg:col-span-4 row-span-1 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[2.5rem] p-8 text-white flex items-center justify-between group cursor-pointer hover:shadow-2xl hover:shadow-indigo-200 transition-all duration-500">
             <div>
                <p class="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Événements</p>
                <h3 class="text-2xl font-black italic tracking-tight">Prochaine Soirée</h3>
                <p class="text-xs font-medium text-indigo-200">Gala annuel • 24 Mars</p>
             </div>
             <div class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
             </div>
          </div>

        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  stats = signal<DashboardStats | null>(null);
  isLoading = signal(true);

  get activityRate(): number {
    if (!this.stats()?.alumni.total) return 0;
    return Math.round((this.stats()!.alumni.active / this.stats()!.alumni.total) * 100);
  }

  ngOnInit() {
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
