import { useLocation, useNavigate } from "react-router-dom";
import "../styles/components/header.css";
import { useState } from "react";
import { getWithExpiry, removeSession } from "@src/utils";

export const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [isSession] = useState(getWithExpiry("access_token"));

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
          <a href="/users">사용자</a>
          <a href="/mypage">마이페이지</a>
        </nav>

        <div className="actions">
          {isSession ? (
            pathname !== "/login" ? (
              <div className="actions">
                <button
                  className="ghost-btn"
                  onClick={async () => {
                    await fetch("/api/auth/signout", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${isSession}`,
                      },
                    })
                      .then(async (res) => {
                        if (res.status > 200) {
                          const response = await res.json();

                          alert(response.message);
                        } else {
                          return res;
                        }
                        return res;
                      })
                      .then((res) => {
                        if (res.status === 200) {
                          removeSession("access_token");
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
                <button className="primary-btn">글쓰기</button>
              </div>
            ) : (
              <div className="actions">
                <button className="primary-btn">글쓰기</button>
              </div>
            )
          ) : pathname === "/login" ? (
            <></>
          ) : (
            <div className="actions">
              <button className="ghost-btn" onClick={() => navigate("/login")}>
                로그인
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  );
};
