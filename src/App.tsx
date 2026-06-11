import "./App.css";

export default function App() {
  const categories = [
    { name: "자유", key: "FREE", count: 128 },
    { name: "스포츠", key: "SPORT", count: 64 },
    { name: "게임", key: "GAME", count: 212 },
  ];

  const posts = [
    {
      id: 1,
      category: "GAME",
      title: "요즘 할만한 협동 게임 추천 좀 해주세요",
      content:
        "친구들이랑 같이 할 게임 찾는 중인데, 너무 어렵지 않고 가볍게 즐길 수 있는 걸 원해요.",
      author: "pixel_fox",
      role: "USER",
      comments: 12,
      likes: 31,
      createdAt: "10분 전",
    },
    {
      id: 2,
      category: "FREE",
      title: "Prisma + MySQL 조합에서 인덱스 설계 팁 공유",
      content:
        "유저, 게시글, 댓글 구조에서 조회 성능 챙기려면 어떤 인덱스를 우선으로 두는 게 좋을까요?",
      author: "dev_moon",
      role: "ADMIN",
      comments: 8,
      likes: 19,
      createdAt: "32분 전",
    },
    {
      id: 3,
      category: "SPORT",
      title: "러닝 입문할 때 신발은 어느 정도 투자해야 할까요?",
      content:
        "주 3회 정도 가볍게 뛰어보려고 하는데, 입문용으로 적당한 가격대가 궁금합니다.",
      author: "runstar",
      role: "USER",
      comments: 5,
      likes: 14,
      createdAt: "1시간 전",
    },
    {
      id: 4,
      category: "GAME",
      title: "마인크래프트 서버 공지 UI 어떻게 구성하세요?",
      content:
        "플러그인 메시지나 웹 대시보드 공지를 같이 관리하려고 하는데 좋은 방식이 있으면 알려주세요.",
      author: "craft_lab",
      role: "ADMIN",
      comments: 17,
      likes: 42,
      createdAt: "2시간 전",
    },
  ];

  const topUsers = [
    { nickname: "craft_lab", role: "ADMIN", posts: 42 },
    { nickname: "pixel_fox", role: "USER", posts: 27 },
    { nickname: "dev_moon", role: "ADMIN", posts: 19 },
  ];

  return (
    <div className="app">
      <main className="main-layout">
        <section className="hero">
          <div className="hero-content">
            <span className="badge">PUBLIC COMMUNITY</span>
            <h2>오늘의 이야기와 인기 주제를 한눈에 확인하세요.</h2>
            <p>
              최신 게시글, 카테고리별 인기 주제, 활발한 사용자 정보를 메인에서
              빠르게 볼 수 있도록 구성한 커뮤니티 홈입니다.
            </p>

            <div className="search-box">
              <input type="text" placeholder="게시글, 닉네임, 카테고리 검색" />
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
                <a href="/">더 보기</a>
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
                    <p>{post.content}</p>

                    <div className="post-bottom">
                      <div className="author-info">
                        <div className="avatar">
                          {post.author[0].toUpperCase()}
                        </div>
                        <div>
                          <strong>{post.author}</strong>
                          <span>{post.role}</span>
                        </div>
                      </div>

                      <div className="post-meta">
                        <span>댓글 {post.comments}</span>
                        <span>좋아요 {post.likes}</span>
                      </div>
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
                닉네임 기반 커뮤니티 구조라 가볍게 참여하기 좋고, 카테고리별로
                빠르게 소통할 수 있습니다.
              </p>
              <button className="primary-btn full">게시글 작성하기</button>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}
