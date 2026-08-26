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

type TNicknameCheckStatus = "idle" | "checking" | "available" | "unavailable";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const isSession = getWithExpiry("ack");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [user, setUser] = useState<TProfileUser | null>(null);

  /*
    nickname: form input에 입력 중인 값
    savedNickname: 서버에 마지막으로 저장된 값
  */
  const [nickname, setNickname] = useState<string>("");
  const [savedNickname, setSavedNickname] = useState<string>("");

  const [isPublic, setIsPublic] = useState<"TRUE" | "FALSE">("TRUE");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBuffer, setImageBuffer] = useState<string | null>();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [nicknameCheckStatus, setNicknameCheckStatus] =
    useState<TNicknameCheckStatus>("idle");

  useEffect(() => {
    if (!isSession) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/signin");
      return;
    }

    const requestProfile = async () => {
      try {
        const res = await fetch("/api/users/existing/profile/info", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${isSession}`,
          },
        });

        const response = await res.json().catch(() => ({}));

        if (!res.ok) {
          alert(
            response.error ||
              response.message ||
              "프로필 정보를 불러오지 못했습니다.",
          );
          return;
        }

        const profile = response?.data as TProfileUser;

        setUser(profile);
        setNickname(profile?.nickname || "");
        setSavedNickname(profile?.nickname || "");
        setIsPublic(profile?.isPublic === "FALSE" ? "FALSE" : "TRUE");
        setImagePreview(imageDecodeToUrl(profile?.image));
      } catch (error) {
        console.error("프로필 조회 오류:", error);
        alert("서버 에러가 발생하였습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsLoading(false);
      }
    };

    requestProfile();
  }, [navigate, isSession]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const validation = useMemo(() => {
    const trimmedNickname = nickname.trim();

    return {
      nicknameLength:
        trimmedNickname.length >= 2 && trimmedNickname.length <= 32,
    };
  }, [nickname]);

  const originalImageUrl = imageDecodeToUrl(user?.image as string);

  const isNicknameChanged = nickname.trim() !== (user?.nickname || "").trim();

  const isNicknameVerified =
    !isNicknameChanged || nicknameCheckStatus === "available";

  const isChanged =
    isNicknameChanged ||
    isPublic !== (user?.isPublic === "FALSE" ? "FALSE" : "TRUE") ||
    imagePreview !== originalImageUrl ||
    imageFile !== null ||
    imageBuffer === "REMOVE";

  const isFormValid = validation.nicknameLength && isNicknameVerified;

  const handleNicknameCheck = async () => {
    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    if (!validation.nicknameLength) {
      alert("닉네임은 2자 이상 32자 이하로 입력해주세요.");
      return;
    }

    if (trimmedNickname === (user?.nickname || "").trim()) {
      setNicknameCheckStatus("available");
      return;
    }

    try {
      setNicknameCheckStatus("checking");

      const res = await fetch(
        `/api/auth/check/nickname?nickname=${encodeURIComponent(
          trimmedNickname,
        )}`,
        {
          method: "GET",
        },
      );

      const response = await res.json().catch(() => ({}));

      if (res.ok && response.verify) {
        setNicknameCheckStatus("available");
        return;
      }

      setNicknameCheckStatus("unavailable");
    } catch (error) {
      console.error("닉네임 중복 확인 오류:", error);
      setNicknameCheckStatus("idle");
      alert("닉네임 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("이미지 파일은 10MB 이내로 등록 가능합니다.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 등록할 수 있습니다.");
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

    if (!validation.nicknameLength) {
      alert("닉네임은 2자 이상 32자 이하로 입력해주세요.");
      return;
    }

    if (isNicknameChanged && nicknameCheckStatus !== "available") {
      alert("변경한 닉네임의 중복 확인을 완료해주세요.");
      return;
    }

    if (!confirm("저장하시겠습니까?")) return;

    try {
      setIsSaving(true);

      const res = await fetch("/api/users/profile/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${isSession}`,
        },
        body: JSON.stringify({
          nickname: nickname.trim(),
          isPublic,
          image: imageBuffer,
        }),
      });

      const response = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          response.error || response.message || "프로필 수정에 실패했습니다.",
        );
      }

      const updatedNickname = nickname.trim();

      /*
        저장이 성공했을 때만 오른쪽 카드의 닉네임을 변경합니다.
      */
      setSavedNickname(updatedNickname);

      setUser((previousUser) =>
        previousUser
          ? {
              ...previousUser,
              nickname: updatedNickname,
              isPublic,
            }
          : previousUser,
      );

      setNicknameCheckStatus("idle");

      alert("프로필 수정이 완료되었습니다.");
      navigate("/mypage");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "프로필 수정 중 오류가 발생했습니다.";

      alert(message);
    } finally {
      setIsSaving(false);
    }
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
                <img src={imagePreview} alt="프로필 미리보기" />
              ) : (
                <span>{savedNickname?.[0] || user?.nickname?.[0] || "U"}</span>
              )}
            </div>

            <div className="profile-edit-page__preview-summary">
              <strong>{savedNickname || "닉네임 없음"}</strong>

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
                      <img src={imagePreview} alt="프로필 이미지 미리보기" />
                    ) : (
                      <span>
                        {savedNickname?.[0] || user?.nickname?.[0] || "U"}
                      </span>
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

                <div className="profile-edit-page__nickname-check-field">
                  <input
                    id="nickname"
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      setNicknameCheckStatus("idle");
                    }}
                    placeholder="대표 닉네임 입력"
                    maxLength={32}
                    required
                    aria-required="true"
                    className="profile-edit-page__input"
                  />

                  <button
                    type="button"
                    className="profile-edit-page__nickname-check-button"
                    disabled={
                      nicknameCheckStatus === "checking" ||
                      !validation.nicknameLength
                    }
                    onClick={handleNicknameCheck}
                  >
                    {nicknameCheckStatus === "checking"
                      ? "확인 중"
                      : "중복 확인"}
                  </button>
                </div>

                <div
                  className="profile-edit-page__validation-slot"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {!validation.nicknameLength && (
                    <small className="profile-edit-page__message profile-edit-page__message--error">
                      닉네임은 2자 이상 32자 이하로 입력해주세요.
                    </small>
                  )}

                  {validation.nicknameLength && !isNicknameChanged && (
                    <small className="profile-edit-page__message profile-edit-page__message--valid">
                      현재 사용 중인 닉네임입니다.
                    </small>
                  )}

                  {isNicknameChanged && nicknameCheckStatus === "available" && (
                    <small className="profile-edit-page__message profile-edit-page__message--success">
                      사용 가능한 닉네임입니다.
                    </small>
                  )}

                  {isNicknameChanged &&
                    nicknameCheckStatus === "unavailable" && (
                      <small className="profile-edit-page__message profile-edit-page__message--error">
                        이미 사용 중이거나 사용할 수 없는 닉네임입니다.
                      </small>
                    )}

                  {isNicknameChanged &&
                    validation.nicknameLength &&
                    nicknameCheckStatus === "idle" && (
                      <small className="profile-edit-page__message profile-edit-page__message--valid">
                        닉네임을 변경했다면 중복 확인을 진행해주세요.
                      </small>
                    )}
                </div>
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
