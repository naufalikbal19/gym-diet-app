import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('[GymTrack] App crashed:', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', background: '#0a0a0a', color: '#e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{ maxWidth: '480px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ color: '#f87171', marginBottom: '8px' }}>Aplikasi gagal dimuat</h2>
            <p style={{ color: '#9ca3af', marginBottom: '16px', fontSize: '14px' }}>
              {this.state.error?.message || 'Terjadi kesalahan tidak terduga'}
            </p>
            <pre style={{
              background: '#1f2937', padding: '12px', borderRadius: '8px',
              fontSize: '11px', color: '#6b7280', textAlign: 'left',
              overflowX: 'auto', marginBottom: '16px'
            }}>
              {this.state.error?.stack?.slice(0, 300)}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#10b981', color: 'white', border: 'none',
                padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
              }}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
