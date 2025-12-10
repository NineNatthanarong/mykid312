'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authenticate } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authenticate(email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container animate-fade-in">
        <div className="glass login-card">
          {/* Header: Wizard Icon */}
          <div className="header-section">
            <div className="wizard-icon-wrapper">
              <span>🧙‍♂️</span>
            </div>
            <h1 className="title">
              <span className="gradient-text">Hogword</span>
              <span className="sparkle">✨</span>
            </h1>
            <p className="subtitle">Enter the realm of vocabulary</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-alert">
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="name@hogwords.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-gradient login-btn"
              disabled={loading}
            >
              {loading ? 'Opening Gates...' : 'Login'}
            </button>
          </form>
        </div>

        <div className="footer-links">
          <p>Don't have an account? <span className="link">Join the School</span></p>
        </div>
      </div>

      <style jsx>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                    /* Clean light background is handled by global body style */
                }

                .login-container {
                    width: 100%;
                    max-width: 440px;
                }

                .login-card {
                    padding: 3rem 2.5rem;
                    background: #FFFFFF; /* Pure white card */
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
                }

                .header-section {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .wizard-icon-wrapper {
                    font-size: 3.5rem;
                    margin-bottom: 1rem;
                    display: inline-block;
                }

                .title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    color: var(--text-primary);
                }

                .subtitle {
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-group label {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-left: 4px;
                }

                .input {
                    background: #F8FAFC;
                    border-color: #E2E8F0;
                    color: var(--text-primary);
                }
                
                .input:focus {
                    background: #FFFFFF;
                }

                .error-alert {
                    padding: 12px;
                    background: #FEF2F2;
                    border: 1px solid #FECACA;
                    border-radius: 8px;
                    color: var(--danger);
                    text-align: center;
                    font-size: 0.9rem;
                }

                .login-btn {
                    margin-top: 1rem;
                    height: 50px;
                    font-size: 1.1rem;
                }

                .footer-links {
                    margin-top: 2rem;
                    text-align: center;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }

                .link {
                    color: var(--accent-purple);
                    font-weight: 600;
                    cursor: pointer;
                }

                @media (max-width: 480px) {
                    .login-card { padding: 2rem; }
                    .title { font-size: 2rem; }
                }
            `}</style>
    </div>
  );
}
