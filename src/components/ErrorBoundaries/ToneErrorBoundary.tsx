
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Palette } from 'lucide-react';

interface Props {
  children: ReactNode;
  strainName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ToneErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('ToneErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ToneErrorBoundary error details:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50/50 to-red-50/50">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="h-12 w-12 text-orange-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tone System Error</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              There was an error loading the tone controls{this.props.strainName ? ` for ${this.props.strainName}` : ''}. 
              The strain information is still available, but tone switching is temporarily unavailable.
            </p>
            <div className="flex gap-2">
              <Button onClick={this.handleRetry} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-xs text-left max-w-full">
                <summary className="cursor-pointer text-muted-foreground">
                  Debug Info (Development Only)
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                  {this.state.error?.message}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ToneErrorBoundary;
