import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center">
            <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-6 text-sm">
              An unexpected UI error occurred. Please refresh or try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
