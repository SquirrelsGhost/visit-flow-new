import { Component, type ErrorInfo, type ReactNode } from "react";
import AuthErrorFallback from "./AuthErrorFallback";

interface AuthErrorBoundaryProps {
  children: ReactNode;
}

interface AuthErrorBoundaryState {
  error: Error | null;
}

/** Fängt Abstürze der Anmeldeseite ab und zeigt die Fehlerseite aus v1 statt einer weißen Seite. */
export default class AuthErrorBoundary extends Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  override state: AuthErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Fehler auf der Anmeldeseite:", error, info.componentStack);
  }

  override render() {
    if (!this.state.error) return this.props.children;
    return <AuthErrorFallback error={this.state.error} onRetry={() => this.setState({ error: null })} />;
  }
}
