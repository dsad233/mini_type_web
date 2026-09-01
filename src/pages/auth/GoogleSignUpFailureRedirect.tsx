import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/auth/googleSignUpSuccessRedirect.css"; // 필요시 failure 전용 css로 변경

const REDIRECT_DELAY = 5000;

export default function GoogleSignUpFailureRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /*
    실패 예시:
    /auth/google/signup/fail?message=탈퇴한%20계정입니다.
    
    서버(Passport)에서 전달한 message 파라미터를 읽어옵니다.
    없을 경우 기본 에러 메시지를 출력합니다.
  */
  const errorMessage =
    searchParams.get("message")?.trim() ||
    "알 수 없는 오류로 구글 회원가입에 실패했습니다. 다시 시도해 주세요.";

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => {
      // 실패 시 로그인 화면 또는 회원가입 화면으로 이동
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
          className="google-signup-complete-icon google-signup-complete-icon--error"
          aria-hidden="true"
        >
          !
        </div>

        {/* 에러 상태를 강조하는 뱃지 (CSS에서 스타일링 필요) */}
        <span className="google-signup-complete-badge google-signup-badge--error">
          SIGN UP FAILED
        </span>

        <h1>Google 계정 연동에 실패했습니다</h1>

        <p className="google-signup-complete-description">
          <strong style={{ color: "#d93025" }}>{errorMessage}</strong>
          <br />
          <br />
          잠시 후 로그인 페이지로 이동합니다.
        </p>
      </section>
    </main>
  );
}
