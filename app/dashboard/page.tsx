'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getSummary,
  isAuthenticated,
  SummaryResponse,
} from '@/lib/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const summaryData = await getSummary();
      setSummary(summaryData);
    } catch (err) {
      if (err instanceof Error && err.message === 'Session expired') {
        router.push('/login');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 7) return 'var(--success)';
    if (score >= 4) return 'var(--warning)';
    return 'var(--danger)';
  }

  // --- Chart Configurations ---

  const lineChartData: ChartData<'line'> = {
    labels: summary?.score_per_day.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })) || [],
    datasets: [
      {
        label: 'Average Score',
        data: summary?.score_per_day.map(d => d.score) || [],
        borderColor: '#8B5CF6',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.5)');
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#8B5CF6',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#0F172A',
        bodyColor: '#334155',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        displayColors: false,
        callbacks: {
          label: (context) => `Score: ${context.parsed.y !== null ? context.parsed.y.toFixed(1) : 0}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        grid: { color: '#F1F5F9' },
        ticks: { font: { size: 11 }, color: '#64748B' },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#64748B' },
        border: { display: false },
      },
    },
  };

  const barChartData: ChartData<'bar'> = {
    labels: summary?.avg_score_level.map(l => l.level.charAt(0).toUpperCase() + l.level.slice(1)) || [],
    datasets: [
      {
        label: 'Avg Score',
        data: summary?.avg_score_level.map(l => l.score) || [],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // easy - green
          'rgba(249, 115, 22, 0.8)', // intermediate - orange
          'rgba(239, 68, 68, 0.8)',  // advance - red
        ],
        borderRadius: 8,
        barThickness: 40,
      },
    ],
  };

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#0F172A',
        bodyColor: '#334155',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => `Avg: ${context.parsed.y !== null ? context.parsed.y.toFixed(1) : 0}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        grid: { color: '#F1F5F9' },
        ticks: { font: { size: 11 }, color: '#64748B' },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#64748B' },
        border: { display: false },
      },
    },
  };

  // Grouping score counts by difficulty for a simpler doughnut chart
  const difficultyCounts = summary?.score_count_data.reduce((acc, curr) => {
    acc[curr.difficulty] = (acc[curr.difficulty] || 0) + curr.count;
    return acc;
  }, {} as Record<string, number>);

  const doughnutData: ChartData<'doughnut'> = {
    labels: ['Easy', 'Intermediate', 'Advance'],
    datasets: [
      {
        data: [
          difficultyCounts?.['easy'] || 0,
          difficultyCounts?.['intermediate'] || 0,
          difficultyCounts?.['advance'] || 0,
        ],
        backgroundColor: [
          '#22c55e', // green
          '#f97316', // orange
          '#ef4444', // red
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, padding: 20, font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        bodyColor: '#334155',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => ` ${context.label}: ${context.parsed} plays`,
        }
      },
    },
  };

  return (
    <div className="dashboard-page">
      <nav className="glass navbar">
        <Link href="/" className="nav-brand">
          <span className="gradient-text">Hogword</span>
          <span className="sparkle">✨</span>
        </Link>
        <div className="nav-items">
          <Link href="/" className="nav-link">Practice</Link>
          <button
            onClick={() => {
              localStorage.removeItem('hogword_token');
              router.push('/login');
            }}
            className="nav-link logout"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Gathering your magical statistics...</p>
          </div>
        ) : error ? (
          <div className="error-container glass">
            <p className="error-text">{error}</p>
            <button onClick={loadData} className="btn-gradient">Retry</button>
          </div>
        ) : summary && (
          <div className="animate-fade-in fade-wrapper">
            <header className="page-header">
              <div>
                <h1 className="gradient-text">Dashboard</h1>
                <p>Your learning journey at a glance</p>
              </div>
              <div className="header-date">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </header>

            {/* Key Metrics */}
            <div className="stats-grid">
              <div className="glass stat-card">
                <div className="stat-icon-wrapper p-purple-light">
                  <span className="stat-icon p-purple">📊</span>
                </div>
                <div className="stat-info">
                  <div className="stat-label">Today's Avg</div>
                  <div className="stat-value" style={{ color: getScoreColor(summary.avg_score_today || 0) }}>
                    {summary.avg_score_today?.toFixed(1) || '—'}
                  </div>
                </div>
              </div>
              <div className="glass stat-card">
                <div className="stat-icon-wrapper p-pink-light">
                  <span className="stat-icon p-pink">🎯</span>
                </div>
                <div className="stat-info">
                  <div className="stat-label">Overall Avg</div>
                  <div className="stat-value" style={{ color: getScoreColor(summary.avg_score_all || 0) }}>
                    {summary.avg_score_all?.toFixed(1) || '—'}
                  </div>
                </div>
              </div>
              <div className="glass stat-card">
                <div className="stat-icon-wrapper p-blue-light">
                  <span className="stat-icon p-blue">⏭️</span>
                </div>
                <div className="stat-info">
                  <div className="stat-label">Skipped Today</div>
                  <div className="stat-value text-dark">
                    {summary.today_skip || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Area */}
            <div className="charts-layout">
              {/* Main Trend Chart - Full Width */}
              <div className="glass chart-card full-width">
                <div className="card-header">
                  <h3>Performance Trend</h3>
                  <span className="card-subtitle">Last 7 Days</span>
                </div>
                <div className="chart-container-large">
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              </div>

              {/* Secondary Charts - Split */}
              <div className="glass chart-card">
                <div className="card-header">
                  <h3>Difficulty Mastery</h3>
                  <span className="card-subtitle">Avg Score by Level</span>
                </div>
                <div className="chart-container">
                  <Bar data={barChartData} options={barChartOptions} />
                </div>
              </div>

              <div className="glass chart-card">
                <div className="card-header">
                  <h3>Play Distribution</h3>
                  <span className="card-subtitle">Plays by Difficulty</span>
                </div>
                <div className="chart-container doughnut-container">
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                  <div className="doughnut-center-text">
                    <span className="total-plays-val">
                      {summary.score_count_data.reduce((acc, curr) => acc + curr.count, 0)}
                    </span>
                    <span className="total-plays-lbl">Plays</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Words Cloud/List */}
            {summary.word_per_day && summary.word_per_day.length > 0 && (
              <div className="glass section-card">
                <div className="card-header">
                  <h3>Recent Vocabulary</h3>
                  <span className="card-subtitle">Words encountered recently</span>
                </div>
                <div className="words-cloud">
                  {summary.word_per_day.slice(-3).reverse().flatMap(day => // Last 3 days inverted
                    Object.entries(day.words).map(([word, count], idx) => (
                      <div key={`${day.date}-${word}-${idx}`} className="word-tag glass-sm">
                        <span className="tag-word">{word}</span>
                        {count > 1 && <span className="tag-count" title={`${count} times`}>{count}</span>}
                      </div>
                    ))
                  )}
                  {summary.word_per_day.every(d => Object.keys(d.words).length === 0) && (
                    <p className="empty-msg">No words collected recently.</p>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      <style jsx>{`
        .dashboard-page {
            min-height: 100vh;
            padding-top: 80px;
            padding-bottom: 40px;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 20%),
                radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.05) 0%, transparent 20%);
        }

        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          z-index: 50;
          background: rgba(255, 255, 255, 0.85);
          border-bottom: 1px solid rgba(226, 232, 240, 0.6);
        }

        .nav-brand {
          font-weight: 800; font-size: 1.5rem;
          text-decoration: none; display: flex; align-items: center; gap: 0.5rem;
        }

        .nav-items { display: flex; gap: 2rem; align-items: center; }

        .nav-link {
          color: var(--text-secondary); text-decoration: none;
          font-weight: 600; cursor: pointer; font-size: 0.95rem;
          background: none; border: none; transition: color 0.2s;
        }
        .nav-link:hover { color: var(--text-primary); }
        .nav-link.logout:hover { color: var(--danger); }

        .dashboard-content { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }

        .page-header {
            margin-bottom: 2.5rem;
            display: flex; justify-content: space-between; align-items: flex-end;
        }

        .page-header h1 {
            font-size: 2.5rem; font-weight: 800;
            margin-bottom: 0.25rem;
            letter-spacing: -0.02em;
        }

        .page-header p { color: var(--text-secondary); font-size: 1.1rem; }

        .header-date {
            color: var(--text-muted); font-weight: 500; font-size: 0.95rem;
            background: rgba(255,255,255,0.5); padding: 0.5rem 1rem;
            border-radius: 99px; border: 1px solid rgba(0,0,0,0.05);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem; margin-bottom: 2.5rem;
        }

        .stat-card {
            padding: 1.75rem; display: flex; align-items: center; gap: 1.5rem;
            background: #FFFFFF; border-radius: 20px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1); }

        .stat-icon-wrapper {
            width: 56px; height: 56px; border-radius: 16px;
            display: flex; align-items: center; justify-content: center;
        }
        .p-purple-light { background: #F3E8FF; }
        .p-pink-light { background: #FCE7F3; }
        .p-blue-light { background: #E0F2FE; }

        .stat-icon { font-size: 1.75rem; }

        .stat-info { display: flex; flex-direction: column; }
        .stat-label { font-size: 0.875rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;}
        .stat-value { font-size: 2.25rem; font-weight: 800; line-height: 1; }
        .text-dark { color: var(--text-primary); }

        .charts-layout {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem; margin-bottom: 2.5rem;
        }

        .chart-card {
            background: #FFFFFF; padding: 1.75rem;
            border-radius: 24px; display: flex; flex-direction: column;
            min-height: 400px;
        }

        .full-width { grid-column: 1 / -1; height: 450px; }

        .card-header { margin-bottom: 1.5rem; }
        .chart-card h3, .section-card h3 {
            font-size: 1.25rem; font-weight: 700; color: var(--text-primary);
            margin-bottom: 0.25rem;
        }
        .card-subtitle { color: var(--text-muted); font-size: 0.875rem; }

        .chart-container { flex: 1; position: relative; width: 100%; min-height: 0; }
        .chart-container-large { flex: 1; position: relative; width: 100%; min-height: 0; }
        
        .doughnut-container { display: flex; align-items: center; justify-content: center; position: relative; }
        .doughnut-center-text {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); /* Center perfectly */
            display: flex; flex-direction: column; align-items: center;
            pointer-events: none;
            padding-bottom: 15%; /* Push up slightly to account for legend if needed, or adjust */
        }
        
        /* Adjust center text pos if legend is at bottom */
        .chart-container.doughnut-container canvas { z-index: 1; }
        .doughnut-center-text { z-index: 0; transform: translate(-50%, -65%); } /* Adjusted for legend bottom */

        .total-plays-val { font-size: 2rem; font-weight: 800; color: var(--text-primary); line-height: 1; }
        .total-plays-lbl { font-size: 0.875rem; color: var(--text-muted); font-weight: 600; }

        .section-card {
            background: #FFFFFF; padding: 2rem; border-radius: 24px;
        }
        
        .words-cloud {
            display: flex; flex-wrap: wrap; gap: 0.75rem;
        }

        .word-tag {
            padding: 8px 16px; background: rgba(248, 250, 252, 0.8);
            border: 1px solid #E2E8F0; border-radius: 12px;
            display: flex; align-items: center; gap: 6px;
            transition: all 0.2s;
        }
        .word-tag:hover {
            transform: translateY(-2px);
            border-color: var(--accent-purple);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
        }

        .tag-word { font-weight: 600; color: var(--text-primary); }
        .tag-count {
            background: var(--accent-purple); color: white;
            font-size: 0.7rem; font-weight: 700;
            padding: 2px 6px; border-radius: 99px;
            min-width: 18px; text-align: center;
        }

        .loading-state { padding: 4rem; text-align: center; color: var(--text-muted); }
        .spinner {
            width: 40px; height: 40px; border: 3px solid #E2E8F0;
            border-top-color: var(--accent-purple); border-radius: 50%;
            margin: 0 auto 1.5rem; animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
            .charts-layout { grid-template-columns: 1fr; }
            .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
            .header-date { font-size: 0.85rem; padding: 0.4rem 0.8rem; }
        }
      `}</style>
    </div>
  );
}
