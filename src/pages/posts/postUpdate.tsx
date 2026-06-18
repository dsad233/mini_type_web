import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/posts/postUpdate.css";
import { useEffect, useState } from "react";
import { getWithExpiry } from "@src/utils";
import { Loading } from "@src/components";

export default function PostUpdate() {
  const navigate = useNavigate();
  const [isSession] = useState<string | null>(() =>
    getWithExpiry("access_token"),
  );
  const { pathname } = useLocation();
  const postId = pathname.split("/posts/update")[1].slice(1);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("FREE");
  const [isPublic, setIsPublic] = useState<string>("TRUE");
  const [context, setContext] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");

  const handlePostUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await fetch(`/api/posts/${encodeURI(postId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${isSession}`,
      },
      body: JSON.stringify({
        title: title,
        context: context,
        image: imageUrl,
        isPublic: isPublic,
        category: category,
      }),
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
      .then((res) => {
        if (res?.ok) {
          setIsLoading(false);
          alert("게시글이 수정되었습니다.");
          navigate("/posts");
          return res;
        }
      });
  };

  useEffect(() => {
    if (!isSession) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
      return;
    }

    const load = async () => {
      setIsLoading(false);
    };

    load();

    const requestPost = async () => {
      await fetch(`/api/posts/${encodeURI(postId)}`, {
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
            setTitle(response.data.title);
            setCategory(response.data.category);
            setIsPublic(response.data.isPublic);
            setContext(response.data.context ?? "");
            setImageUrl(response.data.imageUrl ?? "");
            return res;
          }
        });
    };

    // requestPost();
  }, [isSession, navigate, postId]);

  console.log("test: ", isSession);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <main className="post-update-page">
          <section className="post-update-shell">
            <aside className="post-update-aside">
              <span className="post-update-badge">EDIT POST</span>
              <h1>게시글 수정</h1>
              <p>
                기존 게시글 내용을 다듬고, 카테고리나 공개 여부를 변경한 뒤
                저장할 수 있습니다.
              </p>

              <div className="post-update-guide">
                <div className="post-update-guide-item">
                  <strong>기존 내용 유지 가능</strong>
                  <span>
                    수정 폼에는 현재 게시글 정보가 미리 채워져 있습니다.
                  </span>
                </div>
                <div className="post-update-guide-item">
                  <strong>핵심 정보 먼저 점검</strong>
                  <span>제목, 카테고리, 공개 여부를 먼저 확인해보세요.</span>
                </div>
                <div className="post-update-guide-item">
                  <strong>저장 전 미리 검토</strong>
                  <span>
                    수정 후 본문 흐름과 오탈자를 한 번 더 확인해주세요.
                  </span>
                </div>
              </div>
            </aside>

            <section
              className="post-update-card"
              aria-labelledby="post-update-title"
            >
              <div className="post-update-head">
                <span className="post-update-badge post-update-badge--soft">
                  UPDATE FORM
                </span>
                <h2 id="post-update-title">게시글 수정 정보</h2>
                <p>수정이 필요한 항목을 변경한 뒤 저장 버튼으로 반영하세요.</p>
              </div>

              <form className="post-update-form" onSubmit={handlePostUpdate}>
                <div className="post-update-field">
                  <label htmlFor="title">제목</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={title}
                    placeholder="게시글 제목을 입력해주세요"
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <small>
                    제목만 보아도 어떤 내용인지 알 수 있도록 작성해주세요.
                  </small>
                </div>

                <div className="post-update-row">
                  <div className="post-update-field">
                    <label htmlFor="category">카테고리</label>
                    <select
                      id="category"
                      name="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="FREE">FREE</option>
                      <option value="SPORTS">SPORTS</option>
                      <option value="GAME">GAME</option>
                    </select>
                  </div>

                  <div className="post-update-field">
                    <span className="post-update-label">공개 여부</span>
                    <div className="post-update-radio-group">
                      <label className="post-update-radio">
                        <input
                          type="radio"
                          name="isPublic"
                          value="TRUE"
                          defaultChecked
                          onChange={(e) => setIsPublic(e.target.value)}
                        />
                        <span>공개</span>
                      </label>

                      <label className="post-update-radio">
                        <input
                          type="radio"
                          name="isPublic"
                          value="FALSE"
                          onChange={(e) => setIsPublic(e.target.value)}
                        />
                        <span>비공개</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="post-update-field">
                  <label htmlFor="context">본문</label>
                  <textarea
                    id="context"
                    name="context"
                    rows={14}
                    value={context}
                    placeholder="게시글 내용을 입력해주세요"
                    onChange={(e) => setContext(e.target.value)}
                  />
                  <small>
                    문단을 나누어 작성하면 더 읽기 좋고, 수정 사항도 확인하기
                    쉽습니다.
                  </small>
                </div>

                <div className="post-update-field">
                  <label htmlFor="image">대표 이미지 URL</label>
                  <input
                    id="image"
                    name="image"
                    type="url"
                    value={imageUrl}
                    placeholder="https://example.com/image.jpg"
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <small>
                    선택 항목입니다. 이미지가 있다면 게시글 전달력이 좋아집니다.
                  </small>
                </div>

                <div className="post-update-preview">
                  <span className="post-update-preview-badge">
                    CHECK BEFORE SAVE
                  </span>
                  <p>
                    수정한 제목, 카테고리, 공개 여부, 본문 내용을 다시 한 번
                    확인한 뒤 저장해주세요.
                  </p>
                </div>

                <div className="post-update-actions">
                  <button type="button" className="post-update-cancel-btn">
                    취소
                  </button>
                  <button type="submit" className="post-update-submit-btn">
                    수정 저장
                  </button>
                </div>
              </form>
            </section>
          </section>
        </main>
      )}
    </>
  );
}
