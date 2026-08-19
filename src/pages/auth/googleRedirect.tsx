import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setWithExpiry } from "@src/utils";
import "../../styles/auth/googleRedirect.css";

export default function GoogleRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const accessToken = searchParams.get("res_ack");
  const refreshToken = searchParams.get("res_ref");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processGoogleCallback = async () => {
      if (!accessToken || !refreshToken) {
        setError("Google 로그인 중 오류가 발생했습니다. 다시 시도해 주세요.");
        setTimeout(() => navigate("/signin"), 1500);
        return;
      }

      setWithExpiry("ack", accessToken, 60 * 60 * 1000);
      setWithExpiry("ref", refreshToken, 60 * 60 * 1000 * 24 * 7);

      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1500);
    };

    processGoogleCallback();
  }, [searchParams, navigate, accessToken, refreshToken]);

  return (
    <div className="google-redirect-page">
      <div className="google-redirect-card">
        <div className="google-redirect-spinner" />
        <h1>Google 로그인 처리 중</h1>
        <p>잠시만 기다려주세요…</p>

        {error && <p className="google-redirect-error">{error}</p>}
      </div>
    </div>
  );
}
