import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/auth/findId.css";

type TFindIdStep = "email" | "verify" | "result";

export default function FindId() {
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [loginId, setLoginId] = useState<string>("");

  const [step, setStep] = useState<TFindIdStep>("email");
  const [loading, setLoading] = useState<boolean>(false);
  const [verifyLoading, setVerifyLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("이메일을 입력해주세요.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/auth/certification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
        }),
      });

      const response = await res.json();

      if (!res.ok) {
        setError(
          response.error || response.message || "인증번호 전송에 실패했습니다.",
        );
        return;
      }

      setStep("verify");
      setCode("");
    } catch (error) {
      setError("서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedCode = code.trim();

    if (!trimmedCode) {
      setError("인증번호를 입력해주세요.");
      return;
    }

    if (trimmedCode.length !== 6) {
      setError("6자리 인증번호를 입력해주세요.");
      return;
    }

    try {
      setVerifyLoading(true);
      setError("");

      const res = await fetch("/api/auth/authentication", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          type: "PASSWORD",
          code: trimmedCode,
        }),
      });

      const response = await res.json();

      if (!res.ok) {
        setError(
          response.error || response.message || "인증번호가 올바르지 않습니다.",
        );
        return;
      }

      const verifiedLoginId =
        response.data?.loginId ||
        response.data?.login_id ||
        response.loginId ||
        response.login_id;

      if (!verifiedLoginId) {
        setError(
          "인증은 완료되었지만 아이디 정보를 받지 못했습니다. 서버 응답을 확인해주세요.",
        );
        return;
      }

      setLoginId(verifiedLoginId);
      setStep("result");
    } catch (error) {
      setError("서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email.trim()) {
      setError("이메일을 먼저 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setCode("");

      const res = await fetch("/api/auth/certification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const response = await res.json();

      if (!res.ok) {
        setError(
          response.error ||
            response.message ||
            "인증번호 재전송에 실패했습니다.",
        );
        return;
      }

      alert("인증번호를 다시 전송했습니다. 이메일을 확인해주세요.");
    } catch (error) {
      setError("서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setStep("email");
    setCode("");
    setError("");
  };

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-brand">
          <div className="brand-logo">C</div>

          <span className="brand-badge">ACCOUNT RECOVERY</span>

          <h1>이메일 인증으로 아이디를 찾아보세요.</h1>

          <p>
            가입할 때 사용한 이메일 주소로 인증번호를 전송합니다. 인증이
            완료되면 해당 이메일로 가입된 아이디를 확인할 수 있습니다.
          </p>
        </div>

        <div className="auth-panel">
          <div className="auth-card">
            {step === "email" && (
              <>
                <span className="mini-badge">STEP 1</span>

                <h2>이메일 입력</h2>

                <p>가입할 때 사용한 이메일 주소를 입력해주세요.</p>

                <form className="auth-form" onSubmit={handleSendCode}>
                  <label className="field">
                    <span>이메일</span>

                    <input
                      type="email"
                      name="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      autoComplete="email"
                    />
                  </label>

                  {error && (
                    <p className="auth-error" role="alert">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="email-send-btn"
                    disabled={loading}
                  >
                    {loading ? "전송 중..." : "인증번호 보내기"}
                  </button>
                </form>
              </>
            )}

            {step === "verify" && (
              <>
                <span className="mini-badge">STEP 2</span>

                <h2>인증번호 확인</h2>

                <p>이메일로 받은 6자리 인증번호를 입력해주세요.</p>

                <div className="success-box">
                  <strong>{email}</strong>
                  <br />위 이메일로 인증번호를 전송했습니다.
                </div>

                <form
                  className="auth-form verify-form"
                  onSubmit={handleVerifyCode}
                >
                  <label className="field">
                    <span>인증번호</span>

                    <input
                      type="text"
                      name="code"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="6자리 인증번호 입력"
                      value={code}
                      onChange={(e) => {
                        const onlyNumber = e.target.value.replace(
                          /[^0-9]/g,
                          "",
                        );

                        setCode(onlyNumber);
                        setError("");
                      }}
                      autoComplete="one-time-code"
                    />
                  </label>

                  {error && (
                    <p className="auth-error" role="alert">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="email-send-btn"
                    disabled={verifyLoading}
                  >
                    {verifyLoading ? "확인 중..." : "인증번호 확인"}
                  </button>

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={handleResendCode}
                    disabled={loading}
                  >
                    {loading ? "재전송 중..." : "인증번호 다시 보내기"}
                  </button>

                  <button
                    type="button"
                    className="change-email-btn"
                    onClick={handleChangeEmail}
                  >
                    이메일 다시 입력하기
                  </button>
                </form>
              </>
            )}

            {step === "result" && (
              <div className="find-id-result">
                <span className="mini-badge">COMPLETE</span>

                <div className="result-icon">✓</div>

                <h2>아이디를 찾았습니다.</h2>

                <p>
                  인증이 완료되었습니다.
                  <br />
                  가입된 아이디는 아래와 같습니다.
                </p>

                <div className="login-id-box">
                  <span>아이디</span>
                  <strong>{loginId}</strong>
                </div>

                <Link to="/signin" className="email-send-btn result-login-btn">
                  로그인하러 가기
                </Link>

                <Link
                  to="/auth/password/forgot"
                  className="result-password-link"
                >
                  비밀번호도 잊으셨나요?
                </Link>
              </div>
            )}

            <div className="bottom-link">
              <Link to="/signin">로그인으로 돌아가기</Link>
              <span aria-hidden="true">|</span>
              <Link to="/auth/password/forgot">비밀번호 찾기</Link>
            </div>

            <p className="signup-text">
              아직 계정이 없나요? <Link to="/signup">회원가입</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
