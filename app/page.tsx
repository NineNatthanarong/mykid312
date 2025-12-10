'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getWord, validateSentence, isAuthenticated, getTodayLog, WordResponse, ValidationResponse, TodayLogItem } from '@/lib/api';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [word, setWord] = useState<WordResponse | null>(null);
  const [sentence, setSentence] = useState('');
  const [result, setResult] = useState<ValidationResponse | null>(null);
  const [todayLog, setTodayLog] = useState<TodayLogItem[]>([]);
  const [selectedLog, setSelectedLog] = useState<TodayLogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
      await Promise.all([
        loadWord('fetch'),
        refreshLog()
      ]);
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

  async function loadWord(state: 'fetch' | 'gen' = 'fetch') {
    try {
      const data = await getWord(state);
      setWord(data);
      setSentence('');
      setResult(null);
    } catch (err) {
      throw err;
    }
  }

  async function refreshLog() {
    const logData = await getTodayLog();
    setTodayLog(logData);
  }

  async function handleSubmit(e: React.FormEvent) {
    if (e) e.preventDefault();
    if (!word || !sentence.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      const validation = await validateSentence(word.word, sentence);
      setResult(validation);
      setWord({ ...word, play: 1 });
      await refreshLog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setSubmitting(false);
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 7) return 'var(--success)';
    if (score >= 4) return 'var(--warning)';
    return 'var(--danger)';
  }

  function formatTime(datetime: string): string {
    return new Date(datetime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const getSuggestion = (log: TodayLogItem) => log.suggestion || "—";

  return (
    <div className="main-page">
      {/* 1. Navbar: Floating Capsule */}
      <nav className="glass navbar">
        <Link href="/" className="nav-brand">
          <span className="gradient-text">Hogword</span>
          <span className="sparkle">✨</span>
        </Link>
        <div className="nav-items">
          <Link href="/" className="nav-link-bold active">CHALLENGE</Link>
          <Link href="/dashboard" className="nav-link-bold">SUMMARY</Link>

          <div className="user-avatar" title="Logout" onClick={() => {
            localStorage.removeItem('hogword_token');
            router.push('/login');
          }}>
            <span>👤</span>
          </div>
        </div>
      </nav>

      {/* Full Page Loader Overlay */}
      {submitting && (
        <div className="loader-overlay animate-fade-in">
          <div className="spinner-large"></div>
          <p className="loader-text">Validating...</p>
        </div>
      )}

      {/* Result Alert Modal */}
      {result && (
        <div className="alert-overlay animate-fade-in">
          <div className="glass result-alert-card">
            <div className="result-header-center">
              <div className="score-ring" style={{ borderColor: getScoreColor(result.score) }}>
                <span className="score-number" style={{ color: getScoreColor(result.score) }}>
                  {result.score.toFixed(1)}
                </span>
              </div>
              <h2 className="result-title">Result</h2>
            </div>

            <div className="result-body">
              <div className="result-item">
                <span className="label">Feedback</span>
                <p className="value">{result.suggestion}</p>
              </div>
              <div className="result-item">
                <span className="label">Correction</span>
                <p className="value highlight">"{result.corrected_sentence}"</p>
              </div>
            </div>

            <div className="result-actions-full">
              <button onClick={() => setResult(null)} className="btn-text">Close</button>
              <button onClick={async () => {
                setResult(null); // Close modal
                await loadWord('gen');
                await refreshLog();
              }} className="btn-gradient full-width">Next Word</button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Log Modal */}
      {selectedLog && (
        <div className="alert-overlay animate-fade-in">
          <div className="glass result-alert-card">
            <div className="result-header-center">
              <div className="score-ring" style={{ borderColor: getScoreColor(selectedLog.score) }}>
                <span className="score-number" style={{ color: getScoreColor(selectedLog.score) }}>
                  {selectedLog.score.toFixed(1)}
                </span>
              </div>
              <h2 className="result-title">Log Details</h2>
            </div>

            <div className="result-body">
              <div className="result-item">
                <span className="label">Word</span>
                <p className="value highlight">{selectedLog.word}</p>
              </div>
              <div className="result-item">
                <span className="label">Your Sentence</span>
                <p className="value">"{selectedLog.user_sentence}"</p>
              </div>
              <div className="result-item">
                <span className="label">Feedback</span>
                <p className="value">{getSuggestion(selectedLog)}</p>
              </div>
              <div className="result-item">
                <span className="label">Time</span>
                <p className="value">{new Date(selectedLog.datetime).toLocaleString()}</p>
              </div>
            </div>

            <div className="result-actions-full">
              <button onClick={() => setSelectedLog(null)} className="btn-gradient full-width">Close</button>
            </div>
          </div>
        </div>
      )}

      <main className="content-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Summoning word...</p>
          </div>
        ) : error ? (
          <div className="glass error-card">
            <p>{error}</p>
            <button onClick={() => loadData()} className="btn-gradient">Retry</button>
          </div>
        ) : word && (
          <div className="practice-area animate-fade-in">
            {/* 3. The Main "Word" Display (Flex Layout) */}
            <div className="word-section-row">
              {/* Left: Badge (Pill) */}
              <div className="badge-pill">
                {word.difficulty.toUpperCase()}
              </div>

              {/* Center: Word Card (Soft Rectangle) */}
              <div className="glass word-card-rect">
                {/* Word in Purple */}
                <h1 className="word-text">"{word.word.toUpperCase()}"</h1>
              </div>

              {/* Right: Skip/Continue Button (Pill) */}
              <button
                onClick={() => loadWord('gen')}
                className="skip-btn"
                disabled={submitting}
              >
                {word.play === 1 ? 'CONTINUE' : 'SKIP'}
              </button>
            </div>

            {/* 4. The Input Area (Boxy Floating Bar) */}
            <form onSubmit={handleSubmit} className="input-bar-wrapper">
              <div className="glass input-bar">
                <input
                  type="text"
                  className="bg-transparent text-input"
                  placeholder="Type your sentence..."
                  value={sentence}
                  onChange={(e) => setSentence(e.target.value)}
                  disabled={submitting}
                  autoFocus
                />
                <button
                  type="submit"
                  className="send-btn"
                  disabled={submitting || !sentence.trim()}
                >
                  {/* Simple Arrow Head (Purple) */}
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </form>

            {/* 5. The Data Table (Clean, No Header) */}
            <div className="glass activity-card animate-fade-in">
              {/* Removed Title */}
              <div className="table-container">
                {todayLog.length === 0 ? (
                  <p className="empty-msg">No activity recorded today.</p>
                ) : (
                  <table className="activity-table">
                    <thead>
                      <tr>
                        <th>DATETIME</th>
                        <th>WORDS</th>
                        <th>SENTENCES</th>
                        <th>SCORE</th>
                        <th>SUGGESTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayLog.slice(0, 10).map((log, i) => ( // Show last 10
                        <tr
                          key={i}
                          onClick={() => setSelectedLog(log)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td className="col-time">{formatTime(log.datetime)}</td>
                          <td className="col-word">{log.word}</td>
                          <td className="col-sentence">"{log.user_sentence}"</td>
                          <td className="col-score" style={{ color: getScoreColor(log.score) }}>
                            {log.score.toFixed(1)}
                          </td>
                          <td className="col-suggestion">{getSuggestion(log)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .main-page {
            min-height: 100vh;
            padding-top: 120px; /* Space for floating nav */
            padding-bottom: 40px;
        }

        /* Loader Overlay */
        .loader-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(255, 255, 255, 0.85); /* Opacity Full Web */
            backdrop-filter: blur(5px);
            z-index: 100;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 1.5rem;
        }
        .spinner-large {
            width: 60px;
            height: 60px;
            border: 6px solid #E2E8F0;
            border-top-color: var(--accent-purple);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        .loader-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-purple);
            letter-spacing: 0.05em;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Alert Overlay */
        .alert-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 23, 42, 0.4); /* Dim background */
            backdrop-filter: blur(4px);
            z-index: 90;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        /* Result Alert Card */
        .result-alert-card {
            background: #FFFFFF;
            width: 100%;
            max-width: 500px;
            padding: 2.5rem;
            border-radius: 24px;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes popIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }

        .result-header-center {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        }
        .score-ring {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            border: 8px solid;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 20px rgba(0,0,0,0.05);
        }
        .score-number {
            font-size: 2.5rem;
            font-weight: 800;
        }
        .result-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        .result-body {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            background: #F8FAFC;
            padding: 1.5rem;
            border-radius: 16px;
        }
        .result-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        .label {
            font-size: 0.8rem;
            text-transform: uppercase;
            font-weight: 700;
            color: var(--text-muted);
            letter-spacing: 0.05em;
        }
        .value {
            font-size: 1rem;
            color: var(--text-primary);
            line-height: 1.5;
        }
        .value.highlight {
            color: var(--accent-purple);
            font-weight: 500;
        }

        .result-actions-full {
             display: flex;
             gap: 1rem;
             margin-top: 0.5rem;
        }
        .full-width { flex: 1; justify-content: center; display: flex; }
        

        /* 1. Floating Navbar */
        .navbar {
          position: fixed;
          top: 24px;
          left: 24px;
          right: 24px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 3rem;
          z-index: 50;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 20px; /* Rounded Capsule */
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05); /* Soft shadow */
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }

        .gradient-text {
            font-size: 1.8rem;
            font-weight: 800;
        }

        .nav-items { display: flex; gap: 3rem; align-items: center; }

        .nav-link-bold {
            color: var(--text-muted);
            text-decoration: none;
            font-weight: 800;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transition: color 0.2s;
        }

        .nav-link-bold.active, .nav-link-bold:hover {
            color: var(--accent-purple);
        }

        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #F1F5F9;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 1.2rem;
            transition: transform 0.2s;
            border: 2px solid transparent;
        }
        .user-avatar:hover {
            background: white;
            border-color: var(--accent-purple);
            transform: scale(1.05);
        }

        .content-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 2rem;
            display: flex;
            justify-content: center;
        }

        .practice-area { width: 100%; display: flex; flex-direction: column; gap: 2rem; }

        .word-section-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 1rem;
        }

        /* Badge Pill */
        .badge-pill {
            background: #FFFFFF;
            padding: 12px 24px;
            border-radius: 9999px; /* Pill */
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            font-weight: 700;
            font-size: 0.9rem;
            color: var(--accent-purple);
            letter-spacing: 0.05em;
            white-space: nowrap;
        }

        /* Word Card: Soft Rectangle */
        .word-card-rect {
            flex: 1;
            max-width: 600px;
            background: #FFFFFF;
            padding: 2.5rem;
            border-radius: 24px; /* Soft Rect: rounded-3xl */
            text-align: center;
            box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 180px;
        }

        .word-text {
            font-size: 4rem;
            font-weight: 800;
            line-height: 1;
            color: var(--accent-purple); /* Purple Text */
            letter-spacing: -0.02em;
        }

        /* Skip Button Pill */
        .skip-btn {
            background: var(--accent-purple);
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 9999px; /* Pill */
            font-weight: 700;
            font-size: 1rem;
            letter-spacing: 0.05em;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
            transition: transform 0.2s;
        }
        .skip-btn:hover { transform: translateY(-2px); }

        /* Input Bar: Boxy Floating */
        .input-bar-wrapper {
            max-width: 800px;
            margin: 0 auto;
            width: 100%;
        }

        .input-bar {
            background: #FFFFFF;
            border-radius: 16px; /* Boxy: rounded-xl */
            padding: 12px;
            display: flex;
            align-items: center;
            box-shadow: 0 8px 20px rgba(0,0,0,0.08);
            border: 1px solid rgba(0,0,0,0.05);
        }

        .text-input {
            flex: 1;
            border: none;
            background: transparent;
            font-size: 1.25rem;
            padding: 8px 16px;
            color: var(--text-primary);
            outline: none;
        }
        .text-input::placeholder { color: #CBD5E1; }

        /* Send Button: Icon Only */
        .send-btn {
            width: 48px;
            height: 48px;
            background: transparent; /* No background */
            color: var(--accent-purple); /* Purple Icon */
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: 0.2s;
        }
        .send-btn:hover { color: var(--accent-pink); transform: translateX(2px); }
        .send-btn:disabled { color: #E2E8F0; cursor: not-allowed; }

        .btn-text { background: none; border: none; font-weight: 600; color: var(--text-secondary); cursor: pointer; }
        .btn-solid-sm { background: var(--text-primary); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; }

        /* Table: Clean */
        .activity-card {
            background: #FFFFFF;
            padding: 2rem;
            border-radius: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.02);
            margin-top: 3rem;
        }

        .table-container { overflow-x: auto; }

        .activity-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }

        .activity-table th {
            padding: 1rem;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            border-bottom: 2px solid #F1F5F9;
            font-weight: 700; /* Bold Headers */
        }

        .activity-table td {
            padding: 1.25rem 1rem;
            border-bottom: 1px solid #F8FAFC;
            color: var(--text-primary);
            font-size: 0.95rem;
            vertical-align: middle;
        }

        .activity-table tbody tr:hover {
            background: #F8FAFC;
            transition: background 0.2s;
        }

        .col-time { white-space: nowrap; color: var(--text-secondary); font-variant-numeric: tabular-nums; }
        .col-word { font-weight: 700; color: var(--text-primary); }
        .col-sentence { color: #94A3B8; font-size: 0.9rem; font-style: normal; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .col-score { font-weight: 700; }
        .col-suggestion { color: var(--text-secondary); font-size: 0.9rem; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        @media (max-width: 768px) {
            .navbar { top: 0; left: 0; right: 0; border-radius: 0; border: none; }
            .main-page { padding-top: 100px; }
            .word-section-row { flex-direction: column; gap: 1rem; }
            .word-card-rect { width: 100%; }
        }
      `}</style>
    </div>
  );
}
