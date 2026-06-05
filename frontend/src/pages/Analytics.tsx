import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Loader } from '../components/Loader';
import { 
  BarChart3, 
  PieChart, 
  Building2, 
  Compass, 
  HelpCircle,
  Award,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface CompanyInsightData {
  companyName: string;
  totalExperiences: number;
  totalQuestions: number;
  difficultyDistribution: { Easy: number; Medium: number; Hard: number };
  frequentlyAskedTopics: { name: string; count: number }[];
  statusCounts: { Selected: number; Rejected: number; Waiting: number };
  questions: { _id: string; title: string; difficulty: string; topic: string }[];
}

interface SystemAnalytics {
  totalExperiences: number;
  totalQuestions: number;
  topCompanies: { name: string; count: number }[];
  topTopics: { name: string; count: number }[];
  trendingCompanies: string[];
}

export const Analytics: React.FC = () => {
  const [sysStats, setSysStats] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Company insights state
  const [selectedCompany, setSelectedCompany] = useState('Google');
  const [companyInsight, setCompanyInsight] = useState<CompanyInsightData | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const fetchSysStats = async () => {
    try {
      const res = await api.get('/analytics');
      setSysStats(res.data);
      if (res.data.topCompanies && res.data.topCompanies.length > 0) {
        // Set default selected company to the top one if available
        setSelectedCompany(res.data.topCompanies[0].name);
      }
    } catch (err) {
      console.error('Error fetching global analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyInsight = async (compName: string) => {
    if (!compName) return;
    setInsightLoading(true);
    try {
      const res = await api.get(`/companies/${compName}/insights`);
      setCompanyInsight(res.data);
    } catch (err) {
      console.error('Error fetching company insights:', err);
    } finally {
      setInsightLoading(false);
    }
  };

  useEffect(() => {
    fetchSysStats();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchCompanyInsight(selectedCompany);
    }
  }, [selectedCompany]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Calculate percentages for custom SVG Donut Chart
  const renderTopicsDonutChart = (topics: { name: string; count: number }[]) => {
    const totalCount = topics.reduce((sum, t) => sum + t.count, 0);
    if (totalCount === 0) return null;

    let accumulatedPercentage = 0;
    const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

    return (
      <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
        {/* SVG Circle representing Donut */}
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1f2937" strokeWidth="8" />
            
            {topics.map((t, idx) => {
              const pct = (t.count / totalCount) * 100;
              const strokeDasharray = `${pct} ${100 - pct}`;
              const strokeDashoffset = 100 - accumulatedPercentage;
              accumulatedPercentage += pct;

              return (
                <circle
                  key={t.name}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={colors[idx % colors.length]}
                  strokeWidth="8.5"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out hover:stroke-[10px] cursor-pointer"
                  pathLength="100"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-slate-500">DSA Core</span>
            <span className="text-xl font-black text-slate-200">{totalCount}</span>
            <span className="text-[9px] text-indigo-400 font-semibold uppercase">Questions</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-1.5 flex-1 w-full max-w-[200px]">
          {topics.map((t, idx) => (
            <div key={t.name} className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
                <span className="text-slate-400 truncate max-w-[120px]">{t.name}</span>
              </div>
              <span className="font-bold text-slate-300">{t.count} ({Math.round((t.count / totalCount) * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Custom Bar Chart using Tailwind flex columns
  const renderCompaniesBarChart = (companies: { name: string; count: number }[]) => {
    const maxVal = Math.max(...companies.map(c => c.count), 1);

    return (
      <div className="space-y-4">
        <div className="flex items-end gap-3 h-48 border-b border-darkBorder pb-2 px-2">
          {companies.map((c) => {
            const heightPercent = (c.count / maxVal) * 100;
            return (
              <div key={c.name} className="flex-1 flex flex-col items-center group cursor-pointer">
                {/* Value tooltip */}
                <span className="text-[10px] font-black text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1.5">
                  {c.count}
                </span>
                
                {/* Bar */}
                <div 
                  style={{ height: `${Math.max(heightPercent, 8)}%` }}
                  className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-indigo-600/50 to-cyan-500/80 group-hover:from-indigo-500 group-hover:to-cyan-400 border border-indigo-500/20 group-hover:shadow-lg group-hover:shadow-indigo-500/10 transition-all duration-300"
                />

                {/* label */}
                <span className="text-[10px] font-bold text-slate-500 rotate-12 sm:rotate-0 mt-3 group-hover:text-slate-200 transition-colors truncate max-w-[64px]">
                  {c.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-indigo-400" />
          Analytics Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Visual metrics aggregating company statistics, DSA hot-topics, and recruitment analytics.
        </p>
      </div>

      {/* Global Charts Grid */}
      {sysStats && sysStats.topCompanies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Most Active hiring companies */}
          <div className="glass-card p-6 rounded-2xl border border-darkBorder">
            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-darkBorder pb-3">
              <Building2 className="w-4.5 h-4.5 text-indigo-400" />
              Most Active Hiring Companies
            </h3>
            {renderCompaniesBarChart(sysStats.topCompanies)}
          </div>

          {/* Most Asked DSA Topics */}
          <div className="glass-card p-6 rounded-2xl border border-darkBorder">
            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-darkBorder pb-3">
              <PieChart className="w-4.5 h-4.5 text-cyan-400" />
              Frequently Asked DSA Topics
            </h3>
            {renderTopicsDonutChart(sysStats.topTopics)}
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
          <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-350">Analytics unavailable</h3>
          <p className="text-slate-500 text-sm mt-1">Please add a few interview experience posts to populate the metrics.</p>
        </div>
      )}

      {/* Company Insights Explorer (Advanced Feature) */}
      {sysStats && sysStats.topCompanies.length > 0 && (
        <section className="glass-card p-6 md:p-8 rounded-2xl border border-darkBorder space-y-6">
          {/* Insights selector header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-darkBorder pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-200 flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                Company Insights Explorer
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Explore question difficulity and selection metrics for specific recruiters.</p>
            </div>

            {/* Dropdown Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Company:</span>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="px-3.5 py-1.5 rounded-xl border border-white/5 bg-slate-900 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {sysStats.topCompanies.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Loader */}
          {insightLoading ? (
            <div className="py-16 flex justify-center">
              <Loader size="md" />
            </div>
          ) : companyInsight ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-[fadeIn_0.3s_ease-out]">
              {/* Stat card dials */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Total Interviews</span>
                    <h4 className="text-xl font-bold text-slate-200 mt-0.5">{companyInsight.totalExperiences}</h4>
                  </div>
                  <Award className="w-6 h-6 text-indigo-400" />
                </div>

                <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Questions Logged</span>
                    <h4 className="text-xl font-bold text-slate-200 mt-0.5">{companyInsight.totalQuestions}</h4>
                  </div>
                  <HelpCircle className="w-6 h-6 text-cyan-400" />
                </div>

                {/* Selection status count */}
                <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-3">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Selection Outcomes</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-1.5 rounded-lg">
                      <span className="block font-bold text-sm">{companyInsight.statusCounts.Selected}</span>
                      <span className="text-[8px] uppercase font-bold text-slate-400">Offer</span>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 py-1.5 rounded-lg">
                      <span className="block font-bold text-sm">{companyInsight.statusCounts.Rejected}</span>
                      <span className="text-[8px] uppercase font-bold text-slate-400">Reject</span>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 py-1.5 rounded-lg">
                      <span className="block font-bold text-sm">{companyInsight.statusCounts.Waiting}</span>
                      <span className="text-[8px] uppercase font-bold text-slate-400">Wait</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Topic frequency / Difficulty distributions */}
              <div className="p-5 rounded-xl bg-slate-900/20 border border-white/5 space-y-5">
                <div>
                  <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    Hot-Topics at {companyInsight.companyName}
                  </h4>
                  {companyInsight.frequentlyAskedTopics.length === 0 ? (
                    <span className="text-xs text-slate-500 block">No topics mapped.</span>
                  ) : (
                    <div className="space-y-2.5">
                      {companyInsight.frequentlyAskedTopics.map((t) => (
                        <div key={t.name} className="flex flex-col gap-1 text-xs">
                          <div className="flex justify-between font-medium">
                            <span className="text-slate-300">{t.name}</span>
                            <span className="text-slate-500 font-bold">{t.count} times</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${(t.count / Math.max(...companyInsight.frequentlyAskedTopics.map(x => x.count))) * 100}%` }}
                              className="h-full bg-indigo-500 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Difficulty breakdown & Question links */}
              <div className="p-5 rounded-xl bg-slate-900/20 border border-white/5 flex flex-col justify-between gap-5">
                <div>
                  <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-cyan-400" />
                    Difficulty Breakdown
                  </h4>
                  
                  {/* Difficulty bars */}
                  <div className="space-y-3.5 text-xs">
                    {/* Easy */}
                    <div className="flex items-center gap-3">
                      <span className="w-12 text-slate-500 font-bold uppercase text-[10px]">Easy</span>
                      <div className="flex-1 bg-slate-800 h-3 rounded-full overflow-hidden relative">
                        <div 
                          style={{ width: `${companyInsight.totalQuestions > 0 ? (companyInsight.difficultyDistribution.Easy / companyInsight.totalQuestions) * 100 : 0}%` }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                      <span className="w-6 text-right font-black text-slate-300">{companyInsight.difficultyDistribution.Easy}</span>
                    </div>

                    {/* Medium */}
                    <div className="flex items-center gap-3">
                      <span className="w-12 text-slate-500 font-bold uppercase text-[10px]">Medium</span>
                      <div className="flex-1 bg-slate-800 h-3 rounded-full overflow-hidden relative">
                        <div 
                          style={{ width: `${companyInsight.totalQuestions > 0 ? (companyInsight.difficultyDistribution.Medium / companyInsight.totalQuestions) * 100 : 0}%` }}
                          className="h-full bg-amber-500 rounded-full"
                        />
                      </div>
                      <span className="w-6 text-right font-black text-slate-300">{companyInsight.difficultyDistribution.Medium}</span>
                    </div>

                    {/* Hard */}
                    <div className="flex items-center gap-3">
                      <span className="w-12 text-slate-500 font-bold uppercase text-[10px]">Hard</span>
                      <div className="flex-1 bg-slate-800 h-3 rounded-full overflow-hidden relative">
                        <div 
                          style={{ width: `${companyInsight.totalQuestions > 0 ? (companyInsight.difficultyDistribution.Hard / companyInsight.totalQuestions) * 100 : 0}%` }}
                          className="h-full bg-rose-500 rounded-full"
                        />
                      </div>
                      <span className="w-6 text-right font-black text-slate-300">{companyInsight.difficultyDistribution.Hard}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/questions?company=${companyInsight.companyName}`}
                  className="w-full py-2.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold text-center text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  View All Questions Asked
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-550">
              No insights found for this company.
            </div>
          )}
        </section>
      )}
    </div>
  );
};
