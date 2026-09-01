import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Dropcursor } from "@tiptap/extension-dropcursor";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import "../../styles/posts/postUpdate.css";
import { getWithExpiry } from "@src/utils";
import { Loading } from "@src/components";

type TExistingImage = {
  id: string;
  previewUrl: string;
  base64: string;
};

type TExistingPost = {
  title?: string;
  category?: string;
  isPublic?: string;
  context?: string;
  images?: string[] | null;
};

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      imageId: {
        default: null,

        parseHTML: (element) => {
          return element.getAttribute("data-image-id");
        },

        renderHTML: (attributes) => {
          if (!attributes.imageId) {
            return {};
          }

          return {
            "data-image-id": attributes.imageId,
          };
        },
      },

      width: {
        default: null,

        parseHTML: (element) => {
          return (
            element.getAttribute("data-width") ||
            element.getAttribute("width") ||
            element.style.width ||
            null
          );
        },

        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }

          return {
            "data-width": attributes.width,
          };
        },
      },
    };
  },
});

const getImageMimeType = (base64: string) => {
  if (base64.startsWith("iVBORw0KGgo")) {
    return "image/png";
  }

  if (base64.startsWith("UklGR")) {
    return "image/webp";
  }

  if (base64.startsWith("R0lGOD")) {
    return "image/gif";
  }

  return "image/jpeg";
};

const base64ToBlob = (imageData: string) => {
  const dataUrlMatch = imageData.match(
    /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/,
  );

  const base64 = dataUrlMatch ? dataUrlMatch[2] : imageData;
  const mimeType = dataUrlMatch ? dataUrlMatch[1] : getImageMimeType(base64);

  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], {
    type: mimeType,
  });
};

const replaceImageReferencesForEditor = (
  context: string,
  existingImages: TExistingImage[],
) => {
  const documentNode = new DOMParser().parseFromString(
    context || "<p></p>",
    "text/html",
  );

  const imageElements = documentNode.querySelectorAll<HTMLImageElement>("img");

  imageElements.forEach((imageElement) => {
    const source = imageElement.getAttribute("src") || "";
    const imageReference = source.match(/^image:\/\/(\d+)$/);

    if (!imageReference) {
      return;
    }

    const imageIndex = Number(imageReference[1]);
    const existingImage = existingImages[imageIndex];

    if (!existingImage) {
      imageElement.remove();
      return;
    }

    imageElement.src = existingImage.previewUrl;
    imageElement.setAttribute("data-image-id", existingImage.id);
  });

  return documentNode.body.innerHTML;
};

export default function PostUpdate() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isSession = getWithExpiry("ack");

  const postId = pathname.split("/posts/update")[1]?.slice(1);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const didSetEditorContentRef = useRef<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isPostLoaded, setIsPostLoaded] = useState<boolean>(false);

  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("FREE");
  const [isPublic, setIsPublic] = useState<string>("TRUE");
  const [existingContext, setExistingContext] = useState<string>("");
  const [editorImages, setEditorImages] = useState<TExistingImage[]>([]);

  const editor = useEditor({
    extensions: [
      StarterKit,

      Dropcursor.configure({
        color: "#6366f1",
        width: 3,
      }),

      CustomImage.configure({
        inline: false,
        allowBase64: false,

        resize: {
          enabled: true,
          directions: ["top-left", "top-right", "bottom-left", "bottom-right"],
          minWidth: 120,
          minHeight: 80,
          alwaysPreserveAspectRatio: true,
        },
      }),
    ],

    content: "<p></p>",
  });

  const clearImageSelection = () => {
    if (!editor) {
      return;
    }

    const { state, view } = editor;

    if (!(state.selection instanceof NodeSelection)) {
      return;
    }

    const selectionPosition = Math.min(
      state.selection.from,
      state.doc.content.size,
    );

    view.dispatch(
      state.tr.setSelection(
        TextSelection.near(state.doc.resolve(selectionPosition)),
      ),
    );
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        const base64 = dataUrl.split(",")[1];

        if (!base64) {
          reject(new Error("이미지 Base64 변환에 실패했습니다."));
          return;
        }

        resolve(base64);
      };

      reader.onerror = () => {
        reject(new Error("이미지 파일을 읽지 못했습니다."));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleChooseImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 선택할 수 있습니다.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("이미지는 5MB 이하만 업로드할 수 있습니다.");
      e.target.value = "";
      return;
    }

    if (!editor) {
      alert("에디터를 불러오는 중입니다.");
      e.target.value = "";
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      const id = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(file);

      setEditorImages((previous) => [
        ...previous,
        {
          id,
          previewUrl,
          base64,
        },
      ]);

      editor
        .chain()
        .focus()
        .insertContent({
          type: "image",
          attrs: {
            src: previewUrl,
            alt: file.name,
            imageId: id,
          },
        })
        .run();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "이미지 처리 중 오류가 발생했습니다.";

      alert(message);
    } finally {
      e.target.value = "";
    }
  };

  const convertEditorHtmlToRequestData = (html: string) => {
    const documentNode = new DOMParser().parseFromString(html, "text/html");

    const paragraphElements =
      documentNode.querySelectorAll<HTMLParagraphElement>("p");

    paragraphElements.forEach((paragraphElement) => {
      const text = paragraphElement.textContent?.trim() ?? "";
      const hasChildElement = paragraphElement.children.length > 0;

      if (!text && !hasChildElement) {
        paragraphElement.innerHTML = "&nbsp;";
      }
    });

    const imageElements =
      documentNode.querySelectorAll<HTMLImageElement>("img");

    const images: string[] = [];

    imageElements.forEach((imageElement) => {
      const imageId = imageElement.getAttribute("data-image-id");

      if (!imageId) {
        imageElement.remove();
        return;
      }

      const editorImage = editorImages.find((image) => image.id === imageId);

      if (!editorImage) {
        imageElement.remove();
        return;
      }

      const imageIndex = images.length;

      images.push(editorImage.base64);

      imageElement.setAttribute("src", `image://${imageIndex}`);

      const savedWidth =
        imageElement.getAttribute("data-width") ||
        imageElement.getAttribute("width") ||
        imageElement.style.width;

      if (savedWidth) {
        const width = savedWidth.endsWith("%")
          ? savedWidth
          : savedWidth.endsWith("px")
            ? savedWidth
            : `${savedWidth}px`;

        imageElement.setAttribute("data-width", width);
        imageElement.style.width = width;
      }

      const savedHeight =
        imageElement.getAttribute("data-height") ||
        imageElement.getAttribute("height") ||
        imageElement.style.height;

      if (savedHeight) {
        const height = savedHeight.endsWith("%")
          ? savedHeight
          : savedHeight.endsWith("px")
            ? savedHeight
            : `${savedHeight}px`;

        imageElement.setAttribute("data-height", height);
        imageElement.style.height = height;
      }

      imageElement.removeAttribute("data-image-id");
    });

    return {
      context: documentNode.body.innerHTML,
      images,
    };
  };

  const revokePreviewUrls = (images: TExistingImage[]) => {
    images.forEach((image) => {
      if (image.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(image.previewUrl);
      }
    });
  };

  const handlePostUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isSession) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/signin");
      return;
    }

    if (!postId) {
      alert("게시글 ID가 올바르지 않습니다.");
      navigate("/posts");
      return;
    }

    if (!editor) {
      alert("에디터를 불러오는 중입니다.");
      return;
    }

    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (editor.isEmpty) {
      alert("본문을 입력해주세요.");
      return;
    }

    const shouldUpdate = window.confirm("게시글 수정을 완료하시겠습니까?");

    if (!shouldUpdate) {
      return;
    }

    try {
      setIsSubmitting(true);

      const htmlWithPreviewUrls = editor.getHTML();

      const { context, images } =
        convertEditorHtmlToRequestData(htmlWithPreviewUrls);

      const res = await fetch(
        `/api/posts/${encodeURIComponent(postId)}/update`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${isSession}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            context,
            category,
            isPublic,
            images: images.length > 0 ? images : "REMOVE",
          }),
        },
      );

      const response = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          response.error || response.message || "게시글 수정에 실패했습니다.",
        );
      }

      revokePreviewUrls(editorImages);

      alert("게시글 수정이 완료되었습니다.");
      navigate(`/posts/${encodeURIComponent(postId)}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "게시글 수정 중 오류가 발생했습니다.";

      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isSession) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/signin", { replace: true });
      return;
    }

    if (!postId) {
      alert("게시글 ID가 올바르지 않습니다.");
      navigate("/posts", { replace: true });
      return;
    }

    let isCancelled = false;

    fetch(`/api/posts/${encodeURIComponent(postId)}/existing/info`, {
      method: "GET",
      headers: {
        Authorization: `${isSession}`,
      },
    })
      .then(async (res) => {
        const response = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            response.error ||
              response.message ||
              "게시글 정보를 불러오지 못했습니다.",
          );
        }

        return response.data as TExistingPost;
      })
      .then((post) => {
        if (isCancelled) {
          return;
        }

        const existingImages = (post?.images ?? []).map((base64, index) => {
          const blob = base64ToBlob(base64);

          return {
            id: `existing-image-${index}`,
            previewUrl: URL.createObjectURL(blob),
            base64,
          };
        });

        const editorHtml = replaceImageReferencesForEditor(
          post?.context ?? "<p></p>",
          existingImages,
        );

        setTitle(post?.title ?? "");
        setCategory(post?.category ?? "FREE");
        setIsPublic(post?.isPublic ?? "TRUE");
        setEditorImages(existingImages);
        setExistingContext(editorHtml);
        setIsPostLoaded(true);
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "게시글 정보를 불러오는 중 오류가 발생했습니다.";

        alert(message);
        navigate("/posts", { replace: true });
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isSession, navigate, postId]);

  useEffect(() => {
    if (!editor || !isPostLoaded || didSetEditorContentRef.current) {
      return;
    }

    editor.commands.setContent(existingContext || "<p></p>", {
      emitUpdate: false,
      parseOptions: {
        preserveWhitespace: "full",
      },
    });

    didSetEditorContentRef.current = true;
  }, [editor, existingContext, isPostLoaded]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (!editor.view.dom.contains(target)) {
        clearImageSelection();
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
    };
  }, [editor]);

  useEffect(() => {
    return () => {
      revokePreviewUrls(editorImages);
    };
  }, [editorImages]);

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
                기존 게시글 내용을 다듬고, 이미지와 카테고리, 공개 여부를 변경한
                뒤 저장할 수 있습니다.
              </p>

              <div className="post-update-guide">
                <div className="post-update-guide-item">
                  <strong>기존 내용 유지 가능</strong>

                  <span>
                    수정 폼에는 현재 게시글 정보가 미리 채워져 있습니다.
                  </span>
                </div>

                <div className="post-update-guide-item">
                  <strong>이미지 크기와 위치 조절</strong>

                  <span>
                    이미지를 클릭한 뒤 모서리를 드래그해 크기를 조절하고, 본문
                    안에서 위치를 이동할 수 있습니다.
                  </span>
                </div>

                <div className="post-update-guide-item">
                  <strong>공백과 문단 유지</strong>

                  <span>
                    기존의 빈 줄과 문단 간격도 그대로 유지한 채 수정됩니다.
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

                <p>
                  본문 이미지, 문단, 빈 줄을 원하는 형태로 수정한 뒤 저장하세요.
                </p>
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
                    disabled={isSubmitting}
                  />
                </div>

                <div className="post-update-row">
                  <div className="post-update-field">
                    <label htmlFor="category">카테고리</label>

                    <select
                      id="category"
                      name="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="FREE">자유</option>
                      <option value="SPORTS">스포츠</option>
                      <option value="GAME">게임</option>
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
                          checked={isPublic === "TRUE"}
                          onChange={(e) => setIsPublic(e.target.value)}
                          disabled={isSubmitting}
                        />

                        <span>공개</span>
                      </label>

                      <label className="post-update-radio">
                        <input
                          type="radio"
                          name="isPublic"
                          value="FALSE"
                          checked={isPublic === "FALSE"}
                          onChange={(e) => setIsPublic(e.target.value)}
                          disabled={isSubmitting}
                        />

                        <span>비공개</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="post-update-field">
                  <div className="post-update-editor-head">
                    <label>본문</label>

                    <button
                      type="button"
                      className="post-update-image-upload-btn"
                      onClick={handleChooseImage}
                      disabled={isSubmitting}
                    >
                      이미지 추가
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageSelect}
                      disabled={isSubmitting}
                      hidden
                    />
                  </div>

                  <div
                    className="post-update-rich-editor"
                    onMouseDown={(event) => {
                      if (event.target === event.currentTarget) {
                        clearImageSelection();
                      }
                    }}
                  >
                    <EditorContent editor={editor} />
                  </div>

                  <small>
                    이미지를 클릭하면 테두리와 네 개의 크기 조절 점이
                    나타납니다. 빈 줄과 문단 간격도 저장됩니다.
                  </small>
                </div>

                <div className="post-update-preview">
                  <span className="post-update-preview-badge">
                    CHECK BEFORE SAVE
                  </span>

                  <p>
                    수정한 제목, 카테고리, 공개 여부, 본문, 이미지와 공백을 다시
                    한 번 확인한 뒤 저장해주세요.
                  </p>
                </div>

                <div className="post-update-actions">
                  <button
                    type="button"
                    className="post-update-cancel-btn"
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                  >
                    취소
                  </button>

                  <button
                    type="submit"
                    className="post-update-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "저장 중..." : "저장"}
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
