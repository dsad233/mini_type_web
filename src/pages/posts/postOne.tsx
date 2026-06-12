import { useEffect, useState } from "react";
import "../../styles/posts/postOne.css";
import { useLocation } from "react-router-dom";
import { Loading } from "@src/components";

type TPost = {
  id: string;
  title: string;
  context: string | null;
  category: string;
  isPublic: string;
  createdAt: string;
  users: { nickname: string; image: string | null };
};

export function PostOne() {
  const [post, setPost] = useState<TPost>();
  const { pathname } = useLocation();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const requestPost = async () => {
      await fetch(`/api/posts/${pathname.split("/post")[1].slice(1)}`, {
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
            setPost(response.data);
            return res;
          }
        });
    };

    requestPost();
  }, [pathname]);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <main className="post-one-page">
          <section className="post-one-shell">
            <article className="post-one-main">
              <header className="post-one-hero">
                <div className="post-one-meta-top">
                  <span
                    className={`post-one-category ${post?.category.toLowerCase()}`}
                  >
                    {post?.category}
                  </span>
                  <span className="post-one-visibility">
                    {post?.isPublic ? "공개 글" : "비공개 글"}
                  </span>
                </div>

                <h1>{post?.title}</h1>

                <div className="post-one-meta-bottom">
                  <div className="post-one-author">
                    <div className="post-one-author-avatar">
                      {post?.users.nickname.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{post?.users.nickname}</strong>
                      <span>{post?.createdAt}</span>
                    </div>
                  </div>

                  <div className="post-one-actions">
                    <button type="button">수정</button>
                    <button type="button">삭제</button>
                  </div>
                </div>
              </header>

              <section className="post-one-content">
                {post?.context?.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </section>

              <section className="post-one-engagement">
                <button type="button" className="post-one-like-btn">
                  좋아요 24
                </button>
                <button type="button" className="post-one-list-btn">
                  목록으로
                </button>
              </section>

              <section className="post-one-comments">
                <div className="post-one-comments-head">
                  {/* <h2>댓글 {post.comments.length}</h2> */}
                  <h2>댓글</h2>
                  <p>이 게시글에 대한 생각을 자유롭게 남겨보세요.</p>
                </div>

                <form
                  className="post-one-comment-form"
                  aria-labelledby="comment-form-title"
                >
                  <h3 id="comment-form-title" className="sr-only">
                    댓글 작성
                  </h3>

                  <label htmlFor="comment" className="post-one-comment-label">
                    댓글 내용
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    rows={5}
                    placeholder="댓글을 입력해주세요."
                  />

                  <div className="post-one-comment-actions">
                    <button type="submit" className="post-one-comment-submit">
                      댓글 등록
                    </button>
                  </div>
                </form>

                <div className="post-one-comment-list">
                  {/* {post.comments.map((comment) => (
                    <article className="post-one-comment-item" key={comment.id}>
                      <div className="post-one-comment-avatar">
                        {comment.author.charAt(0).toUpperCase()}
                      </div>

                      <div className="post-one-comment-body">
                        <div className="post-one-comment-meta">
                          <strong>{comment.author}</strong>
                          <span>{comment.createdAt}</span>
                        </div>
                        <p>{comment.content}</p>
                      </div>
                    </article>
                  ))} */}
                </div>
              </section>
            </article>

            <aside className="post-one-side">
              <section className="post-one-side-card">
                <span className="post-one-side-badge">AUTHOR</span>
                <div className="post-one-side-author">
                  <div className="post-one-side-avatar">
                    {post?.users.nickname.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong>{post?.users.nickname}</strong>
                    {/* <p>{post?.users.intro}</p> */}
                  </div>
                </div>
              </section>

              <section className="post-one-side-card">
                <span className="post-one-side-badge">POST INFO</span>
                <ul className="post-one-info-list">
                  <li>
                    <strong>카테고리</strong>
                    <span>{post?.category}</span>
                  </li>
                  <li>
                    <strong>작성일</strong>
                    <span>{post?.createdAt}</span>
                  </li>
                  <li>
                    <strong>공개 여부</strong>
                    <span>{post?.isPublic ? "공개" : "비공개"}</span>
                  </li>
                </ul>
              </section>

              <section className="post-one-side-card">
                <span className="post-one-side-badge">GUIDE</span>
                <p className="post-one-guide-text">
                  댓글은 예의를 지켜 작성하고, 주제와 관계없는 내용은
                  피해주세요.
                </p>
              </section>
            </aside>
          </section>
        </main>
      )}
    </>
  );
}
