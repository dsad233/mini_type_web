import { useLocation, useNavigate } from "react-router-dom";
import "../styles/components/header.css";
import { getWithExpiry, removeSession } from "@src/utils";

export const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isSession = getWithExpiry("ack");

  return (
    <>
      <header className="topbar">
        <div className="logo-wrap">
          <div className="logo">C</div>
          <a href="/">
            <div>
              <h1>Community Hub</h1>
              <p>자유롭게 이야기하고, 관심사를 나누는 공간</p>
            </div>
          </a>
        </div>

        <nav className="nav">
          <a href="/">홈</a>
          <a href="/posts">게시글</a>
          <a href="/mypage">마이페이지</a>
        </nav>

        <div className="actions">
          {isSession ? (
            pathname !== "/signin" ? (
              <div className="actions">
                <button
                  className="ghost-btn"
                  onClick={async () => {
                    await fetch("/api/auth/signout", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `${isSession}`,
                      },
                    })
                      .then(async (res) => {
                        if (res.status > 200 && res.status < 500) {
                          const response = await res.json();
                          alert(response.error || response.message);
                        } else if (res.status >= 500) {
                          alert(
                            "서버 에러가 발생하였습니다. 잠시 후 다시 시도해주세요.",
                          );
                          return;
                        } else {
                          return res;
                        }
                      })
                      .then((res) => {
                        if (res?.ok) {
                          removeSession("ack");
                          removeSession("ref");
                          alert("로그아웃 되었습니다.");

                          navigate("/");

                          window.location.reload();
                          return res;
                        }
                      })
                      .catch(() => {
                        alert("서버 에러가 발생하였습니다.");
                        return;
                      });
                  }}
                >
                  로그아웃
                </button>
                <button
                  className="header-create-post-btn"
                  onClick={() => navigate("/posts/create")}
                >
                  글쓰기
                </button>
              </div>
            ) : (
              <div className="actions">
                <button
                  className="header-create-post-btn"
                  onClick={() => navigate("/posts/create")}
                >
                  글쓰기
                </button>
              </div>
            )
          ) : pathname === "/signin" ? (
            <></>
          ) : (
            <div className="actions">
              <button className="ghost-btn" onClick={() => navigate("/signin")}>
                로그인
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  );
};
