import { Component, Fragment, type ReactNode, type ErrorInfo } from "react";
import { Button } from "../ui/button";
import { secondaryTextClass } from "../../utils/cssConstants";

interface ErrorBoundaryProps {
  fallback?: ReactNode;
  errorTitle?: string;
  retryLabel?: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  // Bumped on each retry to force a fresh subtree mount. Without this, retry only clears
  // `hasError` while keeping the child components alive with their existing state — so an
  // error thrown during render from stale state re-throws immediately on the same pass,
  // producing an infinite crash loop. Remounting via key resets child state cleanly.
  resetKey: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static displayName = "ErrorBoundary";
  state: ErrorBoundaryState = { hasError: false, error: null, resetKey: 0 };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState((s) => ({ hasError: false, error: null, resetKey: s.resetKey + 1 }));
  };

  render() {
    if (this.state.hasError) {
      const title = this.props.errorTitle ?? "Error";
      const retry = this.props.retryLabel ?? "Retry";
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center min-h-[200px] gap-2 p-4">
            <p className="text-sm font-bold text-destructive">{title}</p>
            <p className={secondaryTextClass}>{this.state.error?.message}</p>
            <Button variant="link" size="sm" onClick={this.handleRetry}>
              {retry}
            </Button>
          </div>
        )
      );
    }
    // Keyed wrapper ensures retry (and any external key change) rebuilds the child tree.
    // Fragment avoids inserting an extra DOM node vs a div wrapper.
    return <Fragment key={this.state.resetKey}>{this.props.children}</Fragment>;
  }
}
