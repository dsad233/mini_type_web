import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/auth/googleLinkRedirect.css";
import { getWithExpiry, Regex } from "@src/utils";

type TLinkStatus = "linking" | "success" | "error";

const GOOGLE_LINK_TIMEOUT = 8000;

export default function GoogleLinkRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email")?.trim() || "";
  const isValidEmail = Regex.email.test(email);

  const [status, setStatus] = useState<TLinkStatus>(
    isValidEmail ? "linking" : "error",
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(
    isValidEmail
      ? null
      : "Google 계정 연동에 실패했습니다. 잠시 후 다시 시도해주세요.",
  );

  useEffect(() => {
    let isCancelled = false;
    let redirectTimer: number | undefined;

    const redirectToMyPage = () => {
      if (redirectTimer !== undefined) {
        window.clearTimeout(redirectTimer);
      }

      redirectTimer = window.setTimeout(() => {
        if (!isCancelled) {
          navigate("/mypage", { replace: true });
        }
      }, GOOGLE_LINK_TIMEOUT - 3000);
    };

    const requestLinkGoogle = async () => {
      if (!isValidEmail) {
        redirectToMyPage();
        return;
      }

      const controller = new AbortController();

      const timeoutTimer = window.setTimeout(() => {
        controller.abort();
      }, GOOGLE_LINK_TIMEOUT);

      try {
        const accessToken = getWithExpiry("ack");

        if (!accessToken) {
          throw new Error("로그인 정보가 없습니다. 다시 로그인해주세요.");
        }

        const res = await fetch("/api/auth/register/oauth2/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${accessToken}`,
          },
          body: JSON.stringify({
            email,
          }),
          signal: controller.signal,
        });

        const response = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            response.error ||
              response.message ||
              "Google 계정 연동에 실패했습니다.",
          );
        }

        if (isCancelled) return;

        setStatus("success");
        setErrorMessage(null);
        redirectToMyPage();
      } catch (error) {
        if (isCancelled) return;

        const isTimeout =
          error instanceof DOMException && error.name === "AbortError";

        setStatus("error");

        setErrorMessage(
          isTimeout
            ? "Google 계정 연동 시간이 초과되었습니다."
            : error instanceof Error
              ? error.message
              : "Google 계정 연동에 실패했습니다.",
        );

        redirectToMyPage();
      } finally {
        window.clearTimeout(timeoutTimer);
      }
    };

    requestLinkGoogle();

    return () => {
      isCancelled = true;

      if (redirectTimer !== undefined) {
        window.clearTimeout(redirectTimer);
      }
    };
  }, [email, isValidEmail, navigate]);

  const isLinking = status === "linking";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <main className="google-link-redirect-page">
      <section
        className="google-link-redirect-card"
        aria-live="polite"
        aria-busy={isLinking}
      >
        {isLinking && (
          <div className="google-link-redirect-spinner" aria-hidden="true" />
        )}

        <span className="google-link-redirect-badge">GOOGLE ACCOUNT</span>

        <h1>
          {isLinking && "Google 계정 연동 처리 중"}
          {isSuccess && "Google 계정 연동이 완료되었습니다"}
          {isError && "Google 계정 연동에 실패했습니다"}
        </h1>

        <p className="google-link-redirect-description">
          {isLinking &&
            "Google 계정과 안전하게 연결하고 있습니다. 잠시만 기다려주세요."}

          {isSuccess &&
            `${email} 계정이 연동되었습니다. 잠시 후 마이페이지로 이동합니다.`}

          {isError && "잠시 후 마이페이지로 이동합니다."}
        </p>

        {isError && errorMessage && (
          <p className="google-link-redirect-error" role="alert">
            {errorMessage}
          </p>
        )}
      </section>
    </main>
  );
}
