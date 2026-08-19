import { useEffect, useMemo, useState } from "react";
import "../../styles/users/editProfilePage.css";
import { getWithExpiry, imageDecodeToUrl } from "@src/utils";
import { useNavigate } from "react-router-dom";
import { Loading } from "@src/components";
import { Buffer } from "buffer";

type TProfileUser = {
  id: string;
  email: string;
  loginId: string | null;
  nickname: string;
  image: string | null;
  isPublic: string;
};

export default function EditProfilePage() {
  const navigate = useNavigate();
  const isSession = getWithExpiry("ack");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<TProfileUser | null>(null);

  const [nickname, setNickname] = useState("");
  const [isPublic, setIsPublic] = useState<"TRUE" | "FALSE">("TRUE");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBuffer, setImageBuffer] = useState<string | null>();
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isSession) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/signin");
      return;
    }

    const requestProfile = async () => {
      await fetch("/api/users/existing/profile/info", {
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
            const response = await res.json();

            setUser(response?.data);
            setNickname(response?.data.nickname || "");
            setIsPublic(response?.data.isPublic || "TRUE");
            setImagePreview(imageDecodeToUrl(response?.data.image));

            setIsLoading(false);
            return res;
          }
        });
    };

    requestProfile();
  }, [navigate, isSession]);

  const validation = useMemo(() => {
    return {
      nicknameLength:
        nickname.trim().length >= 2 && nickname.trim().length <= 32,
    };
  }, [nickname]);

  const isChanged =
    nickname !== (user?.nickname || "") ||
    isPublic !== (user?.isPublic || "TRUE") ||
    imagePreview !== (user?.image || null) ||
    imageFile !== null;

  const isFormValid = validation.nicknameLength;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("이미지 파일은 10MB 이내로 등록 가능합니다.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageBuffer(Buffer.from(await file.arrayBuffer()).toString("base64"));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageBuffer("REMOVE");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isSession) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/signin");
      return;
    }

    if (!isChanged) {
      alert("변경된 프로필 정보가 없습니다.");
      return;
    }

    if (!isFormValid) {
      alert("입력값을 다시 확인해주세요.");
      return;
    }

    const message = confirm("저장하시겠습니까?");

    if (!message) return;

    setIsSaving(true);

    await fetch("/api/users/profile/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${isSession}`,
      },
      body: JSON.stringify({
        nickname: nickname,
        isPublic: isPublic,
        image: imageBuffer,
      }),
    })
      .then(async (res) => {
        if (res.status > 200 && res.status < 500) {
          const response = await res.json();
          alert(response.error || response.message);
          setIsLoading(false);
        } else if (res.status >= 500) {
          const response = await res.json();
          console.log("response: ", response);
          alert("서버 에러가 발생하였습니다. 잠시 후 다시 시도해주세요.");
          return;
        } else {
          return res;
        }
      })
      .then((res) => {
        if (res?.ok) {
          setIsLoading(false);
          alert("프로필 수정이 완료되었습니다.");
          navigate("/mypage");
          return res;
        }
      });
  };

  if (isLoading) return <Loading />;

  return (
    <main className="profile-edit-page">
      <section className="profile-edit-page__shell">
        <header className="profile-edit-page__hero">
          <div className="profile-edit-page__hero-main">
            <span className="profile-edit-page__badge">PROFILE</span>
            <h1 className="profile-edit-page__title">프로필 수정</h1>
            <p className="profile-edit-page__hero-text">
              프로필 이미지, 대표 닉네임, 공개 여부를 수정할 수 있어요.
            </p>
          </div>

          <div className="profile-edit-page__preview-card">
            <div className="profile-edit-page__avatar">
              {imagePreview ? (
                <img src={imagePreview} />
              ) : (
                <span>{nickname?.[0] || user?.nickname?.[0] || "U"}</span>
              )}
            </div>

            <div className="profile-edit-page__preview-summary">
              <strong>{nickname || "닉네임 없음"}</strong>
              <span>
                {isPublic === "TRUE" ? "공개 프로필" : "비공개 프로필"}
              </span>
            </div>
          </div>
        </header>

        <form className="profile-edit-page__form-card" onSubmit={handleSubmit}>
          <section className="profile-edit-page__section">
            <h2 className="profile-edit-page__section-title">프로필 정보</h2>
            <p className="profile-edit-page__section-text">
              공개 프로필에 노출될 기본 정보를 수정할 수 있습니다.
            </p>
            <p className="profile-edit-page__required-guide">
              <span
                className="profile-edit-page__required-mark"
                aria-hidden="true"
              >
                *
              </span>{" "}
              표시된 항목은 필수 입력입니다.
            </p>

            <div className="profile-edit-page__form-grid">
              <div className="profile-edit-page__form-group profile-edit-page__form-group--full">
                <label className="profile-edit-page__label">
                  프로필 이미지
                  <span className="profile-edit-page__optional-text">
                    (선택)
                  </span>
                </label>

                <div className="profile-edit-page__image-box">
                  <div className="profile-edit-page__image-preview">
                    {imagePreview ? (
                      <img src={imagePreview} />
                    ) : (
                      <span>{nickname?.[0] || user?.nickname?.[0] || "U"}</span>
                    )}
                  </div>

                  <div className="profile-edit-page__image-actions">
                    <label
                      htmlFor="profileImage"
                      className="profile-edit-page__upload-button"
                    >
                      이미지 선택
                    </label>
                    <input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="profile-edit-page__file-input"
                    />
                    <button
                      type="button"
                      className="profile-edit-page__remove-button"
                      onClick={handleRemoveImage}
                    >
                      이미지 제거
                    </button>
                    <small className="profile-edit-page__message profile-edit-page__message--valid">
                      JPG, PNG 형식의 이미지를 권장합니다.
                    </small>
                  </div>
                </div>
              </div>

              <div className="profile-edit-page__form-group">
                <label htmlFor="nickname" className="profile-edit-page__label">
                  닉네임
                  <span
                    className="profile-edit-page__required-mark"
                    aria-hidden="true"
                  >
                    *
                  </span>
                </label>
                <input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="대표 닉네임 입력"
                  maxLength={32}
                  required
                  aria-required="true"
                  className="profile-edit-page__input"
                />
                <small
                  className={
                    validation.nicknameLength
                      ? "profile-edit-page__message profile-edit-page__message--valid"
                      : "profile-edit-page__message profile-edit-page__message--error"
                  }
                >
                  2자 이상 32자 이하로 입력해주세요.
                </small>
              </div>

              <div className="profile-edit-page__form-group">
                <label htmlFor="isPublic" className="profile-edit-page__label">
                  프로필 공개 여부
                  <span className="profile-edit-page__optional-text">
                    (선택)
                  </span>
                </label>
                <select
                  id="isPublic"
                  value={isPublic}
                  onChange={(e) =>
                    setIsPublic(e.target.value as "TRUE" | "FALSE")
                  }
                  className="profile-edit-page__input"
                >
                  <option value="TRUE">공개</option>
                  <option value="FALSE">비공개</option>
                </select>
              </div>
            </div>
          </section>

          <section className="profile-edit-page__section">
            <h2 className="profile-edit-page__section-title">계정 정보</h2>
            <div className="profile-edit-page__account-box">
              <div className="profile-edit-page__account-row">
                <span>회원 ID</span>
                <strong>{user?.id}</strong>
              </div>
              <div className="profile-edit-page__account-row">
                <span>이메일</span>
                <strong>{user?.email}</strong>
              </div>
              <div className="profile-edit-page__account-row">
                <span>로그인 ID</span>
                <strong>{user?.loginId}</strong>
              </div>
            </div>
          </section>

          <div className="profile-edit-page__actions">
            <button
              type="button"
              className="profile-edit-page__button profile-edit-page__button--secondary"
              onClick={() => navigate("/mypage")}
            >
              취소
            </button>

            <button
              type="submit"
              className="profile-edit-page__button profile-edit-page__button--primary"
              disabled={!isChanged || !isFormValid || isSaving}
            >
              {isSaving ? "저장 중..." : "저장하기"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
