import AuthErrorBoundary from "../components/auth/AuthErrorBoundary";
import LoginScreen from "../components/auth/LoginScreen";

/** Anmeldeseite (/login, /onboarding). */
export default function LoginPage() {
  return (
    <AuthErrorBoundary>
      <LoginScreen />
    </AuthErrorBoundary>
  );
}
