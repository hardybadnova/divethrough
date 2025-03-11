
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GameErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error("Game component error:", error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    // Force refresh the component tree
    window.location.reload();
  };

  handleReturn = (): void => {
    this.setState({ hasError: false, error: null });
    // Navigate back to dashboard
    window.location.href = "/dashboard";
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[60vh]">
          <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Something went wrong</h2>
          <p className="mb-6 text-muted-foreground">
            We encountered an error while loading the game. Please try again or return to the dashboard.
          </p>
          <div className="flex space-x-4">
            <Button onClick={this.handleRetry} variant="default">
              Try Again
            </Button>
            <Button onClick={this.handleReturn} variant="outline">
              Return to Dashboard
            </Button>
          </div>
          {this.state.error && (
            <div className="mt-6 rounded bg-gray-900 p-4 text-left text-xs text-gray-300">
              <p className="font-mono">{this.state.error.toString()}</p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
