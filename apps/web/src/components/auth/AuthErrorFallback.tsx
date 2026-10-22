import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useState } from "react";
import { authErrorTexts } from "../../texts/loginTexts";
import Button from "../ui/Button";
import Card from "../ui/Card";
import CardContent from "../ui/CardContent";
import CardHeader from "../ui/CardHeader";
import CardTitle from "../ui/CardTitle";

interface AuthErrorFallbackProps {
  error: Error;
  onRetry: () => void;
}

const BIG_BUTTON = "w-full h-14 text-lg font-semibold rounded-xl transition-all duration-200";

/** Fehlerseite der Anmeldung, Aussehen und Texte aus v1 (AuthErrorBoundary). */
export default function AuthErrorFallback({ error, onRetry }: AuthErrorFallbackProps) {
  const [errorId] = useState(() => Date.now().toString(36));
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto border-0 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-white/95">
        <CardHeader className="text-center pb-6 pt-10 bg-gradient-to-b from-red-50 to-white">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <AlertTriangle className="h-12 w-12 text-red-600" />
              <div className="absolute inset-0 h-12 w-12 text-red-400 animate-ping opacity-30">
                <AlertTriangle className="h-12 w-12" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">{authErrorTexts.title}</CardTitle>
          <p className="text-gray-600 mt-2">{authErrorTexts.subtitle}</p>
        </CardHeader>
        <CardContent className="px-8 pt-6 pb-10 space-y-6">
          {process.env.NODE_ENV !== "production" && (
            <p className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700 font-mono break-all">
              {error.message}
            </p>
          )}
          <div className="text-center space-y-4">
            <p className="text-gray-700">{authErrorTexts.body}</p>
            <div className="space-y-3">
              <Button
                onClick={onRetry}
                className={`${BIG_BUTTON} bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:scale-105 shadow-lg hover:shadow-xl`}
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                {authErrorTexts.retry}
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className={`${BIG_BUTTON} border-2 border-gray-300 hover:border-red-500 hover:text-red-600`}
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                {authErrorTexts.reload}
              </Button>
              <Button
                onClick={() => window.location.assign("/login")}
                variant="ghost"
                className={`${BIG_BUTTON} text-gray-600 hover:text-red-600`}
              >
                <Home className="mr-2 h-5 w-5" />
                {authErrorTexts.toLogin}
              </Button>
            </div>
          </div>
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">{authErrorTexts.support}</p>
            <p className="text-xs text-gray-400 mt-1">{authErrorTexts.errorId(errorId)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
