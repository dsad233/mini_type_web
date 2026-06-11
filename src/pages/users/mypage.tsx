import { useEffect, useState } from "react";
import "../../styles/users/mypage.css";
import { useNavigate } from "react-router-dom";
import { Loading } from "@components/index.ts";
import { getWithExpiry } from "@src/utils";

type UserObject = {
  id: string;
  email: string;
  nickname: string;
  verify: boolean;
  isPublic: boolean;
  createdAt: string;
  roles: Array<{ authority: string }>;
  posts: Array<{
    id: string;
    title: string;
    category: string;
    createdAt: string;
  }>;
  count: {
    posts: number;
    comments: number;
  };
};

export default function MyPage() {
  const navigate = useNavigate();
  const [isSession] = useState<string | null>(() =>
    getWithExpiry("access_token"),
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserObject>();

  useEffect(() => {
    if (!isSession) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
      return;
    }

    const getUser = async () => {
      await fetch("/api/users/info", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${isSession}`,
        },
      })
        .then(async (res) => {
          if (res.status > 200) {
            const response = await res.json();
            alert(response.message);
            setIsLoading(false);
          } else {
            return res;
          }
        })
        .then(async (res) => {
          if (res?.ok) {
            setIsLoading(false);
            const response = await res.json();
            setUser(response.data);
            return res;
          }
        });
    };

    getUser();
  }, [isSession, navigate]);

  console.log("test: ", user);

  const myPosts = [
    {
      id: 1,
      category: "GAME",
      title: "마인크래프트 서버 공지 UI 구성 팁 정리",
      createdAt: "2026.05.18",
      comments: 14,
      likes: 38,
    },
    {
      id: 2,
      category: "FREE",
      title: "Prisma 스키마 설계할 때 자주 하는 실수들",
      createdAt: "2026.05.15",
      comments: 9,
      likes: 21,
    },
    {
      id: 3,
      category: "SPORT",
      title: "러닝 시작 2주차 후기",
      createdAt: "2026.05.11",
      comments: 4,
      likes: 11,
    },
  ];

  const recentComments = [
    {
      id: 1,
      postTitle: "요즘 할만한 협동 게임 추천",
      content: "개인적으로 난이도 낮은 협동 게임이면 이쪽도 괜찮았어요.",
      createdAt: "1시간 전",
    },
    {
      id: 2,
      postTitle: "게시판 카테고리 구조 고민",
      content: "처음에는 카테고리를 너무 많이 나누지 않는 게 좋아 보여요.",
      createdAt: "어제",
    },
  ];

  return (
    <div className="mypage">
      {isLoading ? (
        <Loading />
      ) : (
        <section className="mypage-shell">
          <div className="mypage-header">
            <div className="profile-card">
              <div className="profile-main">
                <div className="profile-avatar">C</div>

                <div className="profile-copy">
                  <span className="profile-badge">MY PROFILE</span>
                  <h1>{user?.nickname}</h1>
                  <p>
                    커뮤니티에서 개발, 게임, 일상 이야기를 공유하는
                    사용자입니다.
                  </p>

                  <div className="profile-meta">
                    <span>USER ID · {user?.id}</span>
                    <span>{user?.roles[0].authority}</span>
                    <span>
                      {user?.isPublic ? "공개 프로필" : "비공개 프로필"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button className="mypage-primary-btn">프로필 수정</button>
              </div>
            </div>

            <div className="summary-grid">
              <article className="summary-card">
                <strong>{user?.count.posts}</strong>
                <span>작성한 게시글</span>
              </article>
              <article className="summary-card">
                <strong>{user?.count.comments}</strong>
                <span>작성한 댓글</span>
              </article>
              <article className="summary-card">
                <strong>389</strong>
                <span>받은 좋아요</span>
              </article>
              <article className="summary-card">
                <strong>{user?.createdAt}</strong>
                <span>가입일</span>
              </article>
            </div>
          </div>

          <div className="mypage-grid">
            <div className="mypage-main">
              <section className="panel">
                <div className="section-head">
                  <h2>내 게시글</h2>
                  <a href="/posts">전체 보기</a>
                </div>

                <div className="post-list">
                  {user?.posts.map((post) => (
                    <article className="post-item" key={post.id}>
                      <div className="post-item-top">
                        <span
                          className={`category ${post.category.toLowerCase()}`}
                        >
                          {post.category}
                        </span>
                        <span className="date">{post.createdAt}</span>
                      </div>

                      <h3>{post.title}</h3>

                      <div className="post-item-meta">
                        {/* <span>댓글 {post.comments}</span>
                        <span>좋아요 {post.likes}</span> */}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel">
                <div className="section-head">
                  <h2>최근 댓글</h2>
                  <a href="/">전체 보기</a>
                </div>

                <div className="comment-list">
                  {recentComments.map((comment) => (
                    <article className="comment-item" key={comment.id}>
                      <strong>{comment.postTitle}</strong>
                      <p>{comment.content}</p>
                      <span>{comment.createdAt}</span>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className="mypage-side">
              <section className="panel side-panel">
                <div className="section-head">
                  <h2>계정 상태</h2>
                </div>

                <div className="status-list">
                  <div>
                    <span>이메일 인증</span>
                    <strong>{user?.verify ? "완료" : "미완료"}</strong>
                  </div>
                  <div>
                    <span>프로필 공개</span>
                    <strong>{user?.isPublic ? "공개" : "비공개"}</strong>
                  </div>
                  <div>
                    <span>권한</span>
                    <strong>{user?.roles[0].authority}</strong>
                  </div>
                </div>
              </section>

              <section className="panel side-panel">
                <div className="section-head">
                  <h2>빠른 메뉴</h2>
                </div>

                <div className="quick-menu">
                  <button>내 정보 수정</button>
                  <button>비밀번호 변경</button>
                  <button>작성 글 관리</button>
                  <button>회원 탈퇴</button>
                </div>
              </section>

              <section className="panel highlight-panel">
                <span className="profile-badge">ACTIVITY</span>
                <h2>이번 주 활동이 활발해요</h2>
                <p>
                  최근 작성한 게시글과 댓글 반응이 좋습니다. 인기 게시글 영역에
                  노출될 가능성이 높아요.
                </p>
              </section>
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}
