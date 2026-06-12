import { useEffect, useState } from "react";
import "../../styles/posts/posts.css";
import { useNavigate } from "react-router-dom";
import { getWithExpiry } from "@src/utils";
import { Loading } from "@src/components";

type Posts = {
  id: string;
  title: string;
  context: string | null;
  category: string;
  createdAt: string;
  users: { nickname: string; image: string | null };
}[];

// type TCategory = {
//   ALL: string;
//   FREE: string;
//   SPORT: string;
//   GAME: string;
// };

export type OrderBy = {
  NEW: string;
  POPULAR: string;
  COMMENTS: string;
  VIEWS: string;
};

export default function Posts() {
  const navigate = useNavigate();
  const [isSession] = useState<string | null>(() =>
    getWithExpiry("access_token"),
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // const [user, setUser] = useState<>();

  const [posts, setPosts] = useState<Posts>([]);
  const [count, setCount] = useState<number>(0);
  const [categories, setCategories] = useState<Array<string>>([]);
  const [selectCategory, setSelectCategory] = useState<string>("ALL");
  const [selectIsPublic, setSelectIsPublic] = useState<string>("PUBLIC");
  const [selectOrder, setSelectOrder] = useState<string>("NEW");
  const [inputSearch, setInputSearch] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(10);

  const totalPages = Math.ceil(count / pages);

  useEffect(() => {
    const post = async () => {
      await fetch(
        `/api/posts?page=${page}&pages=${pages}&search=${inputSearch}&category=${selectCategory}&isPublic=${selectIsPublic}&orderby=${selectOrder}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
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
            setPosts(response.data?.posts);
            setPage(response.data?.paginations.page);
            setPages(response.data?.paginations.pages);
            return res;
          }
        });
    };
    const postCount = async () => {
      await fetch("/api/posts/count", {
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
            setCount(response.count);
            return res;
          }
        });
    };

    const category = async () => {
      await fetch("/api/posts/categories", {
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

    post();
    postCount();
    category();
  }, [page, pages, inputSearch, selectCategory, selectIsPublic, selectOrder]);

  console.log("posts: ", posts);
  console.log("count: ", count);
  console.log("categories: ", categories);
  console.log("selectCategory: ", selectCategory);
  console.log("selectIsPublic: ", selectIsPublic);

  const getVisiblePages = () => {
    const maxVisible = 5;
    let start = Math.max(page - 2, 1);
    let end = Math.min(start + maxVisible - 1, totalPages);

    if (end - start < maxVisible - 1) {
      start = Math.max(end - maxVisible + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };
  const visiblePages = getVisiblePages();

  const handleMovePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // const posts = [
  //   {
  //     id: 1,
  //     category: "GAME",
  //     title: "마인크래프트 서버 공지 UI 구성 팁 정리",
  //     content:
  //       "서버 공지, 점검 안내, 이벤트 배너를 웹 대시보드와 자연스럽게 연결하는 방법을 정리했습니다.",
  //     author: "craft_lab",
  //     createdAt: "2026.06.02",
  //     comments: 14,
  //     likes: 38,
  //     views: 402,
  //   },
  //   {
  //     id: 2,
  //     category: "FREE",
  //     title: "Prisma 스키마 설계할 때 자주 하는 실수들",
  //     content:
  //       "unique 제약, soft delete, relation 이름 지정에서 많이 놓치는 포인트를 예시와 함께 정리했어요.",
  //     author: "dev_moon",
  //     createdAt: "2026.06.01",
  //     comments: 9,
  //     likes: 21,
  //     views: 287,
  //   },
  //   {
  //     id: 3,
  //     category: "SPORT",
  //     title: "러닝 시작 2주차 후기",
  //     content:
  //       "입문 러닝화를 신고 주 3회 달려본 후기와 초반 통증 줄이는 팁을 정리했습니다.",
  //     author: "runstar",
  //     createdAt: "2026.05.30",
  //     comments: 4,
  //     likes: 11,
  //     views: 159,
  //   },
  //   {
  //     id: 4,
  //     category: "GAME",
  //     title: "친구들이랑 할만한 협동 게임 추천",
  //     content:
  //       "너무 어렵지 않으면서도 같이 웃으면서 할 수 있는 협동 게임 위주로 추천 부탁드립니다.",
  //     author: "pixel_fox",
  //     createdAt: "2026.05.29",
  //     comments: 23,
  //     likes: 42,
  //     views: 611,
  //   },
  //   {
  //     id: 5,
  //     category: "FREE",
  //     title: "요즘 집중 잘 되는 작업 루틴 있으신가요?",
  //     content:
  //       "개발할 때 집중이 자꾸 끊기는데, 실제로 효과 본 루틴이나 앱이 있으면 공유해주세요.",
  //     author: "quiet_code",
  //     createdAt: "2026.05.27",
  //     comments: 12,
  //     likes: 18,
  //     views: 233,
  //   },
  // ];

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <main className="posts-page">
          <section className="posts-shell">
            <header className="posts-hero">
              <div className="posts-hero-copy">
                <span className="posts-badge">COMMUNITY POSTS</span>
                <h1>관심 있는 이야기를 빠르게 찾아보세요</h1>
                <p>
                  자유, 스포츠, 게임 카테고리의 최신 글과 인기 글을 한곳에서
                  확인할 수 있는 게시글 페이지입니다.
                </p>
              </div>

              <button
                type="button"
                className="posts-create-btn"
                onClick={() => navigate("/posts/create")}
              >
                게시글 작성
              </button>
            </header>

            <section className="posts-toolbar">
              <div className="posts-search-wrap">
                <input
                  type="text"
                  className="posts-search-input"
                  placeholder="제목, 내용, 작성자 검색"
                  onChange={(e) => setInputSearch(e.target.value)}
                />
              </div>

              <div className="posts-toolbar-actions">
                <select
                  className="posts-select"
                  value={selectOrder}
                  onChange={(e) => setSelectOrder(e.target.value)}
                >
                  <option value="NEW">최신순</option>
                  <option value="POPULAR">인기순</option>
                  <option value="COMMENTS">댓글순</option>
                  <option value="VIEWS">조회순</option>
                </select>

                <select
                  className="posts-select"
                  value={selectIsPublic}
                  onChange={(e) => setSelectIsPublic(e.target.value)}
                >
                  <option value="PUBLIC">공개 글</option>
                  <option value="ALL">전체 글</option>
                </select>
              </div>
            </section>

            <section
              className="posts-category-bar"
              aria-label="게시글 카테고리"
            >
              {categories?.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`posts-category-chip ${category === selectCategory ? "is-active" : ""}`}
                  onClick={() => setSelectCategory(category)}
                >
                  {category}
                </button>
              ))}
            </section>

            <section className="posts-summary-row">
              <div className="posts-summary-card">
                <strong>{count}</strong>
                <span>전체 게시글</span>
              </div>
              <div className="posts-summary-card">
                <strong>124</strong>
                <span>오늘 등록된 글</span>
              </div>
              <div className="posts-summary-card">
                <strong>GAME</strong>
                <span>가장 활발한 카테고리</span>
              </div>
            </section>

            <section className="posts-list-section">
              <div className="posts-list-head">
                <h2>전체 게시글</h2>
                <p>검색과 필터를 사용해서 원하는 글을 빠르게 찾을 수 있어요.</p>
              </div>

              <div className="posts-list">
                {posts.map((post) => (
                  <article
                    className="posts-item"
                    key={post.id}
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    <div className="posts-item-top">
                      <span
                        className={`posts-item-category ${post.category.toLowerCase()}`}
                      >
                        {post.category}
                      </span>
                      <span className="posts-item-date">{post.createdAt}</span>
                    </div>

                    <h3>{post.title}</h3>
                    <p>{post.context}</p>

                    <div className="posts-item-bottom">
                      <div className="posts-item-author">
                        <div className="posts-item-avatar">
                          {post.users.nickname.charAt(0).toUpperCase()}
                        </div>
                        <strong>{post.users.nickname}</strong>
                      </div>

                      {/* <div className="posts-item-meta">
                    <span>댓글 {post.comments}</span>
                    <span>좋아요 {post.likes}</span>
                    <span>조회 {post.views}</span>
                  </div> */}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <nav className="posts-pagination" aria-label="게시글 페이지 이동">
              <button
                type="button"
                className="posts-page-btn"
                onClick={() => handleMovePage(page - 1)}
                disabled={page === 1}
              >
                이전
              </button>

              {visiblePages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={`posts-page-btn ${page === pageNumber ? "is-current" : ""}`}
                  onClick={() => handleMovePage(pageNumber)}
                  aria-current={page === pageNumber ? "page" : undefined}
                  aria-label={`페이지 ${pageNumber}`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                className="posts-page-btn"
                onClick={() => handleMovePage(page + 1)}
                disabled={page === totalPages}
              >
                다음
              </button>
            </nav>
          </section>
        </main>
      )}
    </>
  );
}
