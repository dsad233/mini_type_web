import { useEffect, useState } from "react";
import "../../styles/users/mypage.css";
import { useNavigate } from "react-router-dom";
import { Loading } from "@components/index.ts";
import { getWithExpiry, imageDecodeToUrl, removeSession } from "@src/utils";

type TUserObject = {
  id: string;
  email: string;
  nickname: string;
  image: string | null;
  verify: boolean;
  isPublic: boolean;
  createdAt: string;
  roles: { authority: string } | null;
  posts: Array<{
    id: string;
    title: string;
    category: {
      key: string;
      name: string;
    };
    createdAt: string;
    count: {
      comments: number;
      likes: number;
    };
  }>;
  comments: Array<{
    id: string;
    context: string;
    createdAt: string;
    posts: {
      id: string;
      title: string;
    };
  }>;
  count: {
    posts: number;
    comments: number;
  };
};

export default function MyPage() {
  const navigate = useNavigate();
  const isSession = getWithExpiry("ack");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<TUserObject>();
  const [userImage, setUserImage] = useState<string | null>(null);
  const [receiveLikes, setReceiveLikes] = useState<number>(0);

  const handlerDisableAccount = async () => {
    if (!isSession) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/signin");
      return;
    }

    const message = confirm("회원 탈퇴를 진행하시겠습니까?");

    if (!message) return;

    await fetch("/api/users/remove", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${isSession}`,
      },
    })
      .then(async (res) => {
        if (res.status > 200 && res.status < 500) {
          const response = await res.json();
          alert(response.error || response.message);
          setIsLoading(false);
        } else if (res.status >= 500) {
          alert("서버 에러가 발생하였습니다. 잠시 후 다시 시도해주세요.");
          return;
        } else {
          return res;
        }
      })
      .then(async (res) => {
        if (res?.ok) {
          setIsLoading(false);
          removeSession("ack");
          removeSession("ref");
          alert("회원 탈퇴가 완료되었습니다.");

          navigate("/");

          window.location.reload();
          return res;
        }
      });
  };

  useEffect(() => {
    if (!isSession) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/signin");
      return;
    }

    const requestGetUser = async () => {
      await fetch("/api/users/info", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${isSession}`,
        },
      })
        .then(async (res) => {
          if (res.status > 200 && res.status < 500) {
            const response = await res.json();
            alert(response.error || response.message);
            setIsLoading(false);
          } else if (res.status >= 500) {
            alert("서버 에러가 발생하였습니다. 잠시 후 다시 시도해주세요.");
            return;
          } else {
            return res;
          }
        })
        .then(async (res) => {
          if (res?.ok) {
            setIsLoading(false);
            const response = await res.json();
            setUser(response.data);
            setUserImage(imageDecodeToUrl(response.data.image));
            return res;
          }
        });
    };

    const requestReceiveLikes = async () => {
      await fetch("/api/users/received/likes", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${isSession}`,
        },
      })
        .then(async (res) => {
          if (res.status > 200 && res.status < 500) {
            const response = await res.json();
            alert(response.error || response.message);
            setIsLoading(false);
          } else if (res.status >= 500) {
            alert("서버 에러가 발생하였습니다. 잠시 후 다시 시도해주세요.");
            return;
          } else {
            return res;
          }
        })
        .then(async (res) => {
          if (res?.ok) {
            setIsLoading(false);
            const response = await res.json();
            setReceiveLikes(response.count);
            return res;
          }
        });
    };

    requestGetUser();
    requestReceiveLikes();
  }, [isSession, navigate]);

  return (
    <div className="mypage">
      {isLoading ? (
        <Loading />
      ) : (
        <section className="mypage-shell">
          <div className="mypage-header">
            <div className="profile-card">
              <div className="profile-main">
                <div className="profile-avatar">
                  {userImage ? (
                    <img src={userImage} />
                  ) : (
                    <span className="profile-avatar-text">
                      {user?.nickname?.charAt(0).toUpperCase() || "C"}
                    </span>
                  )}
                </div>

                <div className="profile-copy">
                  <span className="profile-badge">MY PROFILE</span>
                  <h1>{user?.nickname}</h1>
                  <p>
                    커뮤니티에서 개발, 게임, 일상 이야기를 공유하는
                    사용자입니다.
                  </p>

                  <div className="profile-meta">
                    <span>USER ID · {user?.id}</span>
                    <span>{user?.roles?.authority}</span>
                    <span>
                      {user?.isPublic ? "공개 프로필" : "비공개 프로필"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button
                  className="mypage-primary-btn"
                  onClick={() => navigate("/users/profile/edit")}
                >
                  프로필 수정
                </button>
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
                <strong>{receiveLikes}</strong>
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
                  <a href="/users/posts">전체 보기</a>
                </div>

                <div className="post-list">
                  {user?.posts.map((post) => (
                    <article
                      className="post-item"
                      key={post.id}
                      onClick={() =>
                        navigate(`/posts/${encodeURIComponent(post.id)}`)
                      }
                    >
                      <div className="post-item-top">
                        <span
                          className={`category ${post.category.key.toLowerCase()}`}
                        >
                          {post.category.name}
                        </span>
                        <span className="date">{post.createdAt}</span>
                      </div>

                      <h3>{post.title}</h3>

                      <div className="post-item-meta">
                        <span>댓글 {post.count.comments}</span>
                        <span>좋아요 {post.count.likes}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel">
                <div className="section-head">
                  <h2>최근 댓글</h2>
                  <a href="/users/comments">전체 보기</a>
                </div>

                <div className="comment-list">
                  {user?.comments.map((comment) => (
                    <article
                      className="comment-item"
                      key={comment.id}
                      onClick={() =>
                        navigate(
                          `/posts/${encodeURIComponent(comment.posts.id)}`,
                        )
                      }
                    >
                      <strong>{comment.posts.title}</strong>
                      <p>{comment.context}</p>
                      <span>{comment.createdAt}</span>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className="mypage-side">
              <section className="mypage-panel side-panel">
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
                    <strong>{user?.roles?.authority}</strong>
                  </div>
                </div>
              </section>

              <section className="mypage-panel side-panel">
                <div className="section-head">
                  <h2>빠른 메뉴</h2>
                </div>

                <div className="quick-menu">
                  <button onClick={() => navigate("/users/edit")}>
                    내 정보 수정
                  </button>
                  <button onClick={() => navigate("/auth/password/forgot")}>
                    비밀번호 변경
                  </button>
                  <button onClick={() => navigate("/users/posts")}>
                    작성 글 관리
                  </button>
                  <button onClick={handlerDisableAccount}>회원 탈퇴</button>
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
