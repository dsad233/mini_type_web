import { useState } from "react";
import "../../styles/auth/login.css";
import { useNavigate } from "react-router-dom";
import { setWithExpiry } from "@src/utils";

export default function Login() {
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const requestLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!loginId) {
      alert("아이디를 입력해 주세요.");
      return;
    }

    if (!password) {
      alert("패스워드를 입력해 주세요.");
      return;
    }

    await fetch("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify({
        loginId: loginId,
        password: password,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then(async (res) => {
        if (res.status > 200) {
          const { error } = await res.json();
          alert(error);
          return;
        }

        return res;
      })
      .then(async (res) => {
        if (res?.ok) {
          const response = await res.json();
          setWithExpiry("access_token", response.data["access_token"], 3600);
          setWithExpiry(
            "refresh_token",
            response.data["refresh_token"],
            604800,
          );

          alert("로그인 완료!");
          navigate("/");

          window.location.reload();
          return res;
        }
      })
      .catch(() => {
        alert("서버 에러가 발생하였습니다.");
        return;
      });
  };

  return (
    <div className="login-page">
      <section className="login-shell">
        <div className="login-brand">
          <div className="brand-top">
            <div className="brand-logo">C</div>
            <div>
              <h1>Community Hub</h1>
              <p>관심사가 이어지는 커뮤니티 플랫폼</p>
            </div>
          </div>

          <div className="brand-hero">
            <span className="brand-badge">WELCOME BACK</span>
            <h2>좋아하는 주제와 사람들을 다시 만나보세요.</h2>
            <p>
              자유, 스포츠, 게임 카테고리의 최신 이야기와 인기 게시글을 로그인
              후 더 빠르게 확인할 수 있습니다.
            </p>
          </div>

          <div className="brand-points">
            <article>
              <strong>실시간 커뮤니티</strong>
              <p>최신 게시글과 댓글 흐름을 빠르게 확인</p>
            </article>
            <article>
              <strong>카테고리 탐색</strong>
              <p>FREE · SPORTS · GAME별로 관심사 정리</p>
            </article>
            <article>
              <strong>안전한 계정 관리</strong>
              <p>로그인 후 프로필, 공개 여부, 활동 내역 관리</p>
            </article>
          </div>
        </div>

        <div className="login-panel">
          <div className="login-card">
            <div className="login-card-head">
              <span className="mini-badge">SIGN IN</span>
              <h3>로그인</h3>
              <p>아이디와 비밀번호를 입력해 커뮤니티에 접속하세요.</p>
            </div>

            <form className="login-form" onSubmit={requestLogin}>
              <label className="field">
                <span>아이디 또는 이메일</span>
                <input
                  type="text"
                  placeholder="loginId 또는 email 입력"
                  name="loginId"
                  onChange={(e) => setLoginId(e.target.value)}
                />
              </label>

              <label className="field">
                <div className="field-row">
                  <span>비밀번호</span>
                  <a href="/certifiemail">비밀번호 찾기</a>
                </div>
                <input
                  type="password"
                  placeholder="비밀번호 입력"
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              <label className="check-row">
                <input type="checkbox" />
                <span>로그인 상태 유지</span>
              </label>

              <button type="submit" className="login-btn">
                로그인
              </button>

              <button type="button" className="sub-btn">
                게스트로 둘러보기
              </button>
            </form>

            <div className="divider">
              <span>또는</span>
            </div>

            <div className="social-list">
              <button type="button" className="social-btn">
                Google로 계속하기
              </button>
              <button type="button" className="social-btn">
                Kakao로 계속하기
              </button>
            </div>

            <p className="signup-text">
              아직 계정이 없나요? <a href="/signup">회원가입</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
