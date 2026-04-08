import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";
import { useAuthStore, type AuthUser } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

const AUTH_GOOGLE_URL = `${API_URL}/auth/google`;

export function GoogleLoginButton() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    scope: "https://www.googleapis.com/auth/calendar.events",
    prompt: "consent",
    access_type: "offline",
    include_granted_scopes: true,
    onSuccess: async (codeResponse) => {
      try {
        const res = await fetch(AUTH_GOOGLE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: codeResponse.code }),
        });
        if (!res.ok) {
          const msg = await res
            .json()
            .then((d: { error?: string }) => d.error)
            .catch(() => "");
          throw new Error(msg || "Authentication failed");
        }
        const data = (await res.json()) as {
          token: string;
          user: Record<string, unknown>;
        };
        login(data.token, data.user as AuthUser);
        navigate("/dashboard");
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Authentication failed"
        );
      }
    },
    onError: () => {
      toast.error("Google sign-in was cancelled or failed");
    },
  });

  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full gap-2 rounded-full font-semibold border-2"
      onClick={() => googleLogin()}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09a7.17 7.17 0 0 1 0-4.17V7.07H2.18A11.97 11.97 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l3.56-2.77v-.53z"
          fill="#FBBC05"
        />
        <path
          d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 6.07l3.66 2.84c.87-2.6 3.3-4.16 6.16-4.16z"
          fill="#EA4335"
        />
      </svg>
      Sign in with Google
    </Button>
  );
}
