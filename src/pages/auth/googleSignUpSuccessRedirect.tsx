import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/auth/googleSignUpSuccessRedirect.css";
import { Regex } from "@src/utils";

const REDIRECT_DELAY = 5000;

export default function GoogleSignUpSuccessRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /*
    성공 예시:
    /auth/google/signup/success?email=user%40gmail.com

    email이 없거나 이메일 형식이 맞지 않으면 실패 화면을 표시합니다.
  */
  const email = searchParams.get("email")?.trim() || "";
  const isValidEmail = Regex.email.test(email);

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => {
      navigate("/signin", { replace: true });
    }, REDIRECT_DELAY);

    return () => {
      window.clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <main className="google-signup-complete-page">
      <section className="google-signup-complete-card" aria-live="polite">
        <div
          className={
            isValidEmail
              ? "google-signup-complete-icon google-signup-complete-icon--success"
              : "google-signup-complete-icon google-signup-complete-icon--error"
          }
          aria-hidden="true"
        >
          {isValidEmail ? "✓" : "!"}
        </div>

        <span className="google-signup-complete-badge">GOOGLE SIGN UP</span>

        <h1>
          {isValidEmail
            ? "Google 계정 회원가입이 완료되었습니다"
            : "Google 계정 회원가입에 실패했습니다"}
        </h1>

        <p className="google-signup-complete-description">
          {isValidEmail ? (
            <>
              <strong>{email}</strong> 계정으로 회원가입이 완료되었습니다.
              <br />
              잠시 후 로그인 페이지로 이동합니다.
            </>
          ) : (
            <>
              가입 정보를 확인하지 못했습니다.
              <br />
              잠시 후 로그인 페이지로 이동합니다.
            </>
          )}
        </p>
      </section>
    </main>
  );
}
