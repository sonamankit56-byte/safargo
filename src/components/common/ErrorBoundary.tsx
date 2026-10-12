import React, { Component, ErrorInfo, ReactNode } from 'react';
import { SafarGoLogo } from './SafarGoLogo';
import { RotateCw, Home, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SafarGo ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 selection:bg-orange-500 selection:text-white">
          <div className="w-full max-w-lg bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 text-center shadow-2xl backdrop-blur-md space-y-6 animate-fadeIn">
            <div className="flex justify-center">
              <SafarGoLogo size="lg" variant="light" showBadge={true} showTagline={false} />
            </div>

            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                सुरक्षित रिकवरी मोड (Safety Recovery Mode)
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                कुछ अप्रत्याशित समस्या आई है
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                चिंता न करें, आपका डेटा सुरक्षित है। कृपया पेज रिफ्रेश करें या मुख्य होमपेज पर लौटें।
              </p>
            </div>

            {/* Error Message Snippet */}
            {this.state.error && (
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-left text-[11px] font-mono text-slate-400 overflow-x-auto max-h-32">
                <span className="text-rose-400 font-bold block mb-1">त्रुटि विवरण:</span>
                {this.state.error.message || 'Unknown render exception'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {this.state.error && this.state.error.message.includes('quota') ? (
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.removeItem('safargo_wallet_recharges_v1');
                      localStorage.removeItem('safargo_audit_logs_v1');
                    } catch (e) {
                      console.warn(e);
                    }
                    window.location.reload();
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>कैश मेमोरी साफ़ करें व रीलोड करें</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <RotateCw className="w-4 h-4" />
                <span>पेज रिफ्रेश करें (Reload Page)</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-slate-600"
              >
                <Home className="w-4 h-4" />
                <span>होमपेज पर जाएं (Go Home)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
