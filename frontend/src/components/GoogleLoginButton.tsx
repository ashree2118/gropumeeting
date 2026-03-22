import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore, type AuthUser } from "@/store/useAuthStore";

const AUTH_GOOGLE_URL = "http://localhost:5000/api/auth/google";

export function GoogleLoginButton() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        const credential = credentialResponse.credential;
        if (!credential) {
          toast.error("No credential received from Google");
          return;
        }
        try {
          const res = await fetch(AUTH_GOOGLE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential }),
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
      }}
      onError={() => {
        toast.error("Google sign-in was cancelled or failed");
      }}
    />
  );
}
