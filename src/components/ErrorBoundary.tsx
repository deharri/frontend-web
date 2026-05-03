import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught', error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="p-8 max-w-xl mx-auto" role="alert">
          <div className="flex items-start gap-3">
            <AlertTriangle size={28} className="text-red-700 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Something went wrong on this page</h2>
              <p className="text-sm text-mutedForeground mt-1">
                {this.state.error.message || 'An unexpected error occurred.'}
              </p>
              <div className="mt-4 flex gap-2">
                <Button onClick={this.reset}>Try again</Button>
                <Button variant="secondary" onClick={() => (window.location.href = '/')}>
                  Back to overview
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
