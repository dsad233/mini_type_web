import { useNavigate } from "react-router-dom";
import "../styles/component/header.css";
import { useEffect, useState } from "react";

export const Header = () => {
  const navigate = useNavigate();

  const [isSession, _] = useState(() =>
    window.sessionStorage.getItem("access_token"),
  );

  console.log("isSession: ", isSession);

  return (
    <>
      <header className="topbar">
        <div className="logo-wrap">
          <div className="logo">C</div>
          <div>
            <h1>Community Hub</h1>
            <p>자유롭게 이야기하고, 관심사를 나누는 공간</p>
          </div>
        </div>

        <nav className="nav">
          <a href="/">홈</a>
          <a href="/posts">게시글</a>
          <a href="/users">사용자</a>
          <a href="/mypage">마이페이지</a>
        </nav>

        <div className="actions">
          {isSession ? (
            <></>
          ) : (
            <button className="ghost-btn" onClick={() => navigate("/login")}>
              로그인
            </button>
          )}
          <button className="primary-btn">글쓰기</button>
        </div>
      </header>
    </>
  );
};
