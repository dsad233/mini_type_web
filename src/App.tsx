import { useEffect, useState } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";
import { getWithExpiry } from "./utils";
import { Loading } from "./components";

type TCategoriesRes = {
  key: string;
  name: string;
  count: number;
};

type Posts = {
  id: string;
  title: string;
  context: string | null;
  category: string;
  createdAt: string;
  users: { nickname: string; image: string | null };
}[];

export default function App() {
  const navigate = useNavigate();
  const [isSession] = useState<string | null>(() =>
    getWithExpiry("access_token"),
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [categories, setCategories] = useState<Array<TCategoriesRes>>([]);
  const [posts, setPosts] = useState<Posts>([]);

  useEffect(() => {
    const requestCounts = async () => {
      await fetch("/api/posts/count/category", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
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
            setCategories(response.data);
            return res;
          }
        });
    };

    const requestPosts = async () => {
      await fetch("/api/posts?page=1&pages=4&isPublic=ALL&orderby=NEW", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(async (res) => {
          if (res.status > 200) {
            const response = await res.json();
            console.log("response: ", response);
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
            setPosts(response.data.posts);
            return res;
          }
        });
    };

    requestCounts();
    requestPosts();
  }, []);

  const topUsers = [
    { nickname: "craft_lab", role: "ADMIN", posts: 42 },
    { nickname: "pixel_fox", role: "USER", posts: 27 },
    { nickname: "dev_moon", role: "ADMIN", posts: 19 },
  ];

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="app">
          <main className="main-layout">
            <section className="hero">
              <div className="hero-content">
                <span className="badge">PUBLIC COMMUNITY</span>
                <h2>오늘의 이야기와 인기 주제를 한눈에 확인하세요.</h2>
                <p>
                  최신 게시글, 카테고리별 인기 주제, 활발한 사용자 정보를
                  메인에서 빠르게 볼 수 있도록 구성한 커뮤니티 홈입니다.
                </p>

                <div className="search-box">
                  <input
                    type="text"
                    placeholder="게시글, 닉네임, 카테고리 검색"
                  />
                  <button>검색</button>
                </div>
              </div>

              <div className="hero-stats">
                <div className="stat-card">
                  <strong>1,024</strong>
                  <span>전체 사용자</span>
                </div>
                <div className="stat-card">
                  <strong>404</strong>
                  <span>오늘 게시글</span>
                </div>
                <div className="stat-card">
                  <strong>1,892</strong>
                  <span>전체 댓글</span>
                </div>
              </div>
            </section>

            <section className="content-grid">
              <div className="left-column">
                <section className="panel">
                  <div className="section-header">
                    <h3>카테고리</h3>
                    <a href="/">전체 보기</a>
                  </div>

                  <div className="category-grid">
                    {categories.map((category) => (
                      <article key={category.key} className="category-card">
                        <span className="category-key">{category.key}</span>
                        <strong>{category.name}</strong>
                        <p>{category.count}개의 게시글</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <div className="section-header">
                    <h3>최신 게시글</h3>
                    <a href="/posts">더 보기</a>
                  </div>

                  <div className="post-list">
                    {posts.map((post) => (
                      <article key={post.id} className="post-card">
                        <div className="post-top">
                          <span
                            className={`post-category ${post.category.toLowerCase()}`}
                          >
                            {post.category}
                          </span>
                          <span className="post-time">{post.createdAt}</span>
                        </div>

                        <h4>{post.title}</h4>
                        <p>{post.context}</p>

                        <div className="post-bottom">
                          <div className="author-info">
                            <div className="avatar">
                              {post.users.nickname.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong>{post.users.nickname}</strong>
                            </div>
                          </div>

                          {/* <div className="post-meta">
                            <span>댓글 {post.comments}</span>
                            <span>좋아요 {post.likes}</span>
                          </div> */}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="right-column">
                <section className="panel side-panel">
                  <div className="section-header">
                    <h3>인기 작성자</h3>
                  </div>

                  <div className="user-rank-list">
                    {topUsers.map((user, index) => (
                      <div key={user.nickname} className="user-rank-item">
                        <span className="rank">#{index + 1}</span>
                        <div>
                          <strong>{user.nickname}</strong>
                          <p>
                            {user.role} · 게시글 {user.posts}개
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="panel side-panel">
                  <div className="section-header">
                    <h3>오늘의 활동</h3>
                  </div>

                  <div className="mini-stats">
                    <div>
                      <strong>76</strong>
                      <span>새 댓글</span>
                    </div>
                    <div>
                      <strong>29</strong>
                      <span>새 회원</span>
                    </div>
                    <div>
                      <strong>143</strong>
                      <span>좋아요</span>
                    </div>
                  </div>
                </section>

                <section className="panel side-panel highlight-panel">
                  <span className="badge">START NOW</span>
                  <h3>첫 게시글을 작성해보세요</h3>
                  <p>
                    닉네임 기반 커뮤니티 구조라 가볍게 참여하기 좋고,
                    카테고리별로 빠르게 소통할 수 있습니다.
                  </p>
                  <button className="primary-btn full">게시글 작성하기</button>
                </section>
              </aside>
            </section>
          </main>
        </div>
      )}
    </>
  );
}
