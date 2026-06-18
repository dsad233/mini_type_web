import { useNavigate } from "react-router-dom";
import "../../styles/posts/postCreate.css";
import { useEffect, useState } from "react";
import { getWithExpiry } from "@src/utils";
import { Loading } from "@src/components";

export default function PostCreate() {
  const navigate = useNavigate();
  const [isSession] = useState<string | null>(() =>
    getWithExpiry("access_token"),
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("FREE");
  const [isPublic, setIsPublic] = useState<string>("TRUE");
  const [context, setContext] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>();

  const handlePostCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await fetch("/api/posts", {
      method: "POST",
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
        if (res.status > 201) {
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
          alert("게시글이 등록되었습니다.");
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
  }, [isSession, navigate]);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <main className="create-post-page">
          <section className="create-post-shell">
            <aside className="create-post-aside">
              <span className="create-post-badge">WRITE POST</span>
              <h1>새 게시글 작성</h1>
              <p>
                커뮤니티에 공유하고 싶은 이야기, 질문, 정보, 후기를 자유롭게
                작성해보세요.
              </p>

              <div className="create-post-guide">
                <div className="create-post-guide-item">
                  <strong>제목은 구체적으로</strong>
                  <span>무엇에 대한 글인지 한눈에 알 수 있게 적어주세요.</span>
                </div>
                <div className="create-post-guide-item">
                  <strong>본문은 읽기 쉽게</strong>
                  <span>문단을 나눠 작성하면 더 읽기 쉬워집니다.</span>
                </div>
                <div className="create-post-guide-item">
                  <strong>카테고리를 맞게 선택</strong>
                  <span>FREE, SPORTS, GAME 중 맞는 주제를 골라주세요.</span>
                </div>
              </div>
            </aside>

            <section
              className="create-post-card"
              aria-labelledby="create-post-title"
            >
              <div className="create-post-head">
                <span className="create-post-badge create-post-badge--soft">
                  POST FORM
                </span>
                <h2 id="create-post-title">게시글 정보</h2>
                <p>필수 정보를 입력한 뒤 공개 여부를 선택하고 등록하세요.</p>
              </div>

              <form className="create-post-form" onSubmit={handlePostCreate}>
                <div className="create-post-field">
                  <label htmlFor="title">제목</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="예: Prisma 스키마 설계할 때 주의할 점 정리"
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <small>
                    제목만 보고도 글의 주제를 이해할 수 있게 작성해주세요.
                  </small>
                </div>

                <div className="create-post-row">
                  <div className="create-post-field">
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

                  <div className="create-post-field">
                    <span className="create-post-label">공개 여부</span>
                    <div className="create-post-radio-group">
                      <label className="create-post-radio">
                        <input
                          type="radio"
                          name="isPublic"
                          value="TRUE"
                          defaultChecked
                          onChange={(e) => setIsPublic(e.target.value)}
                        />
                        <span>공개</span>
                      </label>

                      <label className="create-post-radio">
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

                <div className="create-post-field">
                  <label htmlFor="context">본문</label>
                  <textarea
                    id="context"
                    name="context"
                    placeholder="내용을 입력해주세요."
                    rows={14}
                    onChange={(e) => setContext(e.target.value)}
                  />
                  <small>
                    질문, 정보, 후기 등 자유롭게 작성할 수 있으며 줄바꿈과 문단
                    구분을 권장합니다.
                  </small>
                </div>

                <div className="create-post-field">
                  <label htmlFor="image">대표 이미지 URL</label>
                  <input
                    id="image"
                    name="image"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <small>
                    선택 항목입니다. 이미지가 있다면 게시글 가독성이 좋아집니다.
                  </small>
                </div>

                <div className="create-post-preview">
                  <span className="create-post-preview-badge">미리 확인</span>
                  <p>
                    게시글 등록 전 제목, 카테고리, 공개 여부를 한 번 더
                    확인해주세요.
                  </p>
                </div>

                <div className="create-post-actions">
                  <button type="button" className="create-post-cancel-btn">
                    취소
                  </button>
                  <button type="submit" className="create-post-submit-btn">
                    게시글 등록
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
