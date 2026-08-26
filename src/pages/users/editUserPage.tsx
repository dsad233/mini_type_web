import { useEffect, useMemo, useState } from "react";
import "../../styles/users/editUserPage.css";
import { getWithExpiry } from "@src/utils";
import { useNavigate } from "react-router-dom";
import { Loading } from "@src/components";

type TUserProfile = {
  id: string;
  email: string;
  loginId: string | null;
  name: string | null;
  nickname: string;
  image: string | null;
  gender: string | null;
  birthDay: Date | null;
  phoneNumber: string | null;
  address: string | null;
  isPublic: string;
};

type TNicknameCheckStatus = "idle" | "checking" | "available" | "unavailable";

export default function EditUserPage() {
  const navigate = useNavigate();
  const isSession = getWithExpiry("ack");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<TUserProfile | null>(null);

  const [name, setName] = useState("");
  const [isNameTouched, setIsNameTouched] = useState(false);

  /*
    nickname: input에서 현재 수정 중인 값
    savedNickname: 서버에 마지막으로 저장된 값
  */
  const [nickname, setNickname] = useState("");
  const [savedNickname, setSavedNickname] = useState("");

  const [gender, setGender] = useState<"MALE" | "FEMALE" | "">("");
  const [birthDay, setBirthDay] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+82");
  const [phoneLocalNumber, setPhoneLocalNumber] = useState("");
  const [address, setAddress] = useState("");
  const [isPublic, setIsPublic] = useState<"TRUE" | "FALSE">("TRUE");

  const [nicknameCheckStatus, setNicknameCheckStatus] =
    useState<TNicknameCheckStatus>("idle");

  const splitPhoneNumber = (value: string | null) => {
    if (!value) {
      return { countryCode: "+82", localNumber: "" };
    }

    if (value.startsWith("+82")) {
      return {
        countryCode: "+82",
        localNumber: value.replace("+82", ""),
      };
    }

    if (value.startsWith("+81")) {
      return {
        countryCode: "+81",
        localNumber: value.replace("+81", ""),
      };
    }

    if (value.startsWith("+1")) {
      return {
        countryCode: "+1",
        localNumber: value.replace("+1", ""),
      };
    }

    if (value.startsWith("+84")) {
      return {
        countryCode: "+84",
        localNumber: value.replace("+84", ""),
      };
    }

    if (value.startsWith("+886")) {
      return {
        countryCode: "+886",
        localNumber: value.replace("+886", ""),
      };
    }

    return {
      countryCode: "+82",
      localNumber: value.replace(/^\+\d+/, ""),
    };
  };

  const normalizedPhoneLocalNumber = phoneLocalNumber.replace(/[^0-9]/g, "");

  const normalizedPhoneNumber = normalizedPhoneLocalNumber
    ? `${phoneCountryCode}${normalizedPhoneLocalNumber}`
    : null;

  useEffect(() => {
    if (!isSession) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/signin");
      return;
    }

    const requestUserProfile = async () => {
      try {
        const res = await fetch("/api/users/existing/info", {
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
              "회원 정보를 불러오지 못했습니다.",
          );
          return;
        }

        const userData = response.data as TUserProfile;

        setUser(userData);
        setName(userData?.name || "");
        setNickname(userData?.nickname || "");
        setSavedNickname(userData?.nickname || "");
        setGender(userData?.gender as "MALE" | "FEMALE" | "");

        setBirthDay(
          userData?.birthDay ? String(userData.birthDay).slice(0, 10) : "",
        );

        const phoneInfo = splitPhoneNumber(userData?.phoneNumber || null);

        setPhoneCountryCode(phoneInfo.countryCode);
        setPhoneLocalNumber(phoneInfo.localNumber);
        setAddress(userData?.address || "");
        setIsPublic(userData?.isPublic === "FALSE" ? "FALSE" : "TRUE");
      } catch (error) {
        console.error("회원 정보 조회 오류:", error);
        alert("서버 에러가 발생하였습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsLoading(false);
      }
    };

    requestUserProfile();
  }, [navigate, isSession]);

  const validation = useMemo(() => {
    const trimmedName = name.trim();

    return {
      nameLength:
        trimmedName.length === 0 ||
        (trimmedName.length >= 2 && trimmedName.length <= 50),

      nicknameLength:
        nickname.trim().length >= 2 && nickname.trim().length <= 32,

      phonePattern:
        normalizedPhoneLocalNumber.length === 0 ||
        /^[0-9]{7,12}$/.test(normalizedPhoneLocalNumber),

      addressLength: address.trim().length <= 100,
    };
  }, [name, nickname, normalizedPhoneLocalNumber, address]);

  const isNicknameChanged = nickname.trim() !== (user?.nickname || "").trim();

  const isNicknameVerified =
    !isNicknameChanged || nicknameCheckStatus === "available";

  const isChanged =
    name !== (user?.name || "") ||
    isNicknameChanged ||
    gender !== (user?.gender || "") ||
    birthDay !== (user?.birthDay ? String(user.birthDay).slice(0, 10) : "") ||
    normalizedPhoneNumber !== (user?.phoneNumber || null) ||
    address !== (user?.address || "") ||
    isPublic !== (user?.isPublic || "TRUE");

  const isFormValid =
    validation.nameLength &&
    validation.nicknameLength &&
    validation.phonePattern &&
    validation.addressLength &&
    isNicknameVerified;

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isSession) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/signin");
      return;
    }

    if (!isChanged) {
      alert("변경된 정보가 없습니다.");
      return;
    }

    if (!validation.nameLength) {
      alert("이름은 입력 시 2자 이상 50자 이하로 입력해주세요.");
      return;
    }

    if (!validation.nicknameLength) {
      alert("닉네임은 2자 이상 32자 이하로 입력해주세요.");
      return;
    }

    if (!validation.phonePattern) {
      alert("전화번호 형식을 확인해주세요.");
      return;
    }

    if (!validation.addressLength) {
      alert("주소는 100자 이하로 입력해주세요.");
      return;
    }

    if (isNicknameChanged && nicknameCheckStatus !== "available") {
      alert("변경한 닉네임의 중복 확인을 완료해주세요.");
      return;
    }

    if (!confirm("저장하시겠습니까?")) return;

    try {
      setIsSaving(true);

      const res = await fetch("/api/users/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${isSession}`,
        },
        body: JSON.stringify({
          name: name?.trim() || null,
          nickname: nickname.trim(),
          gender: gender === "" ? null : gender,
          birthDay: birthDay || null,
          phoneNumber: normalizedPhoneNumber,
          address: address?.trim() || null,
          isPublic,
        }),
      });

      const response = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          response.error ||
            response.message ||
            "회원 정보 수정에 실패했습니다.",
        );
      }

      const updatedNickname = nickname.trim();

      /*
        저장 성공 이후에만 프로필 카드용 닉네임을 갱신합니다.
      */
      setSavedNickname(updatedNickname);

      setUser((previousUser) =>
        previousUser
          ? {
              ...previousUser,
              name: name.trim() || null,
              nickname: updatedNickname,
              gender: gender || null,
              birthDay: birthDay ? new Date(birthDay) : null,
              phoneNumber: normalizedPhoneNumber,
              address: address.trim() || null,
              isPublic,
            }
          : previousUser,
      );

      setNicknameCheckStatus("idle");

      alert("회원 정보 수정이 완료되었습니다.");
      navigate("/mypage");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "회원 정보 수정 중 오류가 발생했습니다.";

      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <main className="user-edit-page">
      <section className="user-edit-page__shell">
        <header className="user-edit-page__hero">
          <div className="user-edit-page__hero-main">
            <span className="user-edit-page__badge">ACCOUNT</span>

            <h1 className="user-edit-page__title">유저 정보 수정</h1>

            <p className="user-edit-page__hero-text">
              기본 회원 정보와 공개 설정을 이곳에서 변경할 수 있어요.
            </p>
          </div>

          <div className="user-edit-page__profile-card">
            <div className="user-edit-page__avatar">
              {user?.image ? (
                <img src={user.image} alt="프로필 이미지" />
              ) : (
                <span>{savedNickname?.[0] || user?.nickname?.[0] || "U"}</span>
              )}
            </div>

            <div className="user-edit-page__profile-summary">
              <strong>{savedNickname || "닉네임 없음"}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
        </header>

        <form className="user-edit-page__form-card" onSubmit={handleSubmit}>
          <section className="user-edit-page__section">
            <h2 className="user-edit-page__section-title">기본 정보</h2>

            <p className="user-edit-page__required-guide">
              <span
                className="user-edit-page__required-mark"
                aria-hidden="true"
              >
                *
              </span>{" "}
              표시된 항목은 필수 입력입니다.
            </p>

            <div className="user-edit-page__form-grid">
              <div className="user-edit-page__form-group">
                <label htmlFor="loginId" className="user-edit-page__label">
                  아이디
                  <span className="user-edit-page__optional-text">
                    (수정 불가)
                  </span>
                </label>

                <input
                  id="loginId"
                  type="text"
                  value={user?.loginId || ""}
                  disabled
                  className="user-edit-page__input user-edit-page__input--disabled"
                />
              </div>

              <div className="user-edit-page__form-group">
                <label htmlFor="email" className="user-edit-page__label">
                  이메일
                  <span className="user-edit-page__optional-text">
                    (수정 불가)
                  </span>
                </label>

                <input
                  id="email"
                  type="text"
                  value={user?.email || ""}
                  disabled
                  className="user-edit-page__input user-edit-page__input--disabled"
                />
              </div>

              <div className="user-edit-page__form-group">
                <label htmlFor="name" className="user-edit-page__label">
                  이름
                  <span className="user-edit-page__optional-text">(선택)</span>
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setIsNameTouched(true);
                  }}
                  onBlur={() => setIsNameTouched(true)}
                  placeholder="이름 입력"
                  maxLength={50}
                  className="user-edit-page__input"
                />

                <div className="user-edit-page__validation-slot">
                  {isNameTouched && name.trim().length > 0 && (
                    <small
                      className={
                        validation.nameLength
                          ? "user-edit-page__message user-edit-page__message--valid"
                          : "user-edit-page__message user-edit-page__message--error"
                      }
                    >
                      2자 이상 50자 이하로 입력해주세요.
                    </small>
                  )}
                </div>
              </div>

              <div className="user-edit-page__form-group">
                <label htmlFor="nickname" className="user-edit-page__label">
                  닉네임
                  <span
                    className="user-edit-page__required-mark"
                    aria-hidden="true"
                  >
                    *
                  </span>
                </label>

                <div className="user-edit-page__nickname-check-field">
                  <input
                    id="nickname"
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      setNicknameCheckStatus("idle");
                    }}
                    placeholder="닉네임 입력"
                    maxLength={32}
                    required
                    aria-required="true"
                    className="user-edit-page__input"
                  />

                  <button
                    type="button"
                    className="user-edit-page__nickname-check-button"
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
                  className="user-edit-page__validation-slot"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {!validation.nicknameLength && (
                    <small className="user-edit-page__message user-edit-page__message--error">
                      닉네임은 2자 이상 32자 이하로 입력해주세요.
                    </small>
                  )}

                  {validation.nicknameLength && !isNicknameChanged && (
                    <small className="user-edit-page__message user-edit-page__message--valid">
                      현재 사용 중인 닉네임입니다.
                    </small>
                  )}

                  {isNicknameChanged && nicknameCheckStatus === "available" && (
                    <small className="user-edit-page__message user-edit-page__message--success">
                      사용 가능한 닉네임입니다.
                    </small>
                  )}

                  {isNicknameChanged &&
                    nicknameCheckStatus === "unavailable" && (
                      <small className="user-edit-page__message user-edit-page__message--error">
                        이미 사용 중이거나 사용할 수 없는 닉네임입니다.
                      </small>
                    )}

                  {isNicknameChanged &&
                    validation.nicknameLength &&
                    nicknameCheckStatus === "idle" && (
                      <small className="user-edit-page__message user-edit-page__message--valid">
                        닉네임을 변경했다면 중복 확인을 진행해주세요.
                      </small>
                    )}
                </div>
              </div>

              <div className="user-edit-page__form-group">
                <label htmlFor="gender" className="user-edit-page__label">
                  성별
                  <span className="user-edit-page__optional-text">(선택)</span>
                </label>

                <select
                  id="gender"
                  value={gender}
                  onChange={(e) =>
                    setGender(e.target.value as "MALE" | "FEMALE" | "")
                  }
                  className="user-edit-page__input"
                >
                  <option value="">선택 안 함</option>
                  <option value="MALE">남성</option>
                  <option value="FEMALE">여성</option>
                </select>
              </div>

              <div className="user-edit-page__form-group">
                <label htmlFor="birthDay" className="user-edit-page__label">
                  생년월일
                  <span className="user-edit-page__optional-text">(선택)</span>
                </label>

                <input
                  id="birthDay"
                  type="date"
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  className="user-edit-page__input"
                />
              </div>

              <div className="user-edit-page__form-group">
                <label
                  htmlFor="phoneLocalNumber"
                  className="user-edit-page__label"
                >
                  전화번호
                  <span className="user-edit-page__optional-text">(선택)</span>
                </label>

                <div className="user-edit-page__phone-field">
                  <select
                    id="phoneCountryCode"
                    value={phoneCountryCode}
                    onChange={(e) => setPhoneCountryCode(e.target.value)}
                    className="user-edit-page__phone-code"
                  >
                    <option value="+82">+82</option>
                    <option value="+81">+81</option>
                    <option value="+1">+1</option>
                    <option value="+84">+84</option>
                    <option value="+886">+886</option>
                  </select>

                  <input
                    id="phoneLocalNumber"
                    type="text"
                    value={phoneLocalNumber}
                    onChange={(e) =>
                      setPhoneLocalNumber(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    placeholder="01012345678"
                    maxLength={15}
                    className="user-edit-page__phone-input"
                  />
                </div>

                <small
                  className={
                    validation.phonePattern
                      ? "user-edit-page__message user-edit-page__message--valid"
                      : "user-edit-page__message user-edit-page__message--error"
                  }
                >
                  국가번호를 선택하고 전화번호를 입력해주세요.
                </small>
              </div>

              <div className="user-edit-page__form-group user-edit-page__form-group--full">
                <label htmlFor="address" className="user-edit-page__label">
                  주소
                  <span className="user-edit-page__optional-text">(선택)</span>
                </label>

                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="주소 입력"
                  maxLength={100}
                  className="user-edit-page__input"
                />

                <small
                  className={
                    validation.addressLength
                      ? "user-edit-page__message user-edit-page__message--valid"
                      : "user-edit-page__message user-edit-page__message--error"
                  }
                >
                  100자 이하로 입력해주세요.
                </small>
              </div>

              <div className="user-edit-page__form-group user-edit-page__form-group--full">
                <label htmlFor="isPublic" className="user-edit-page__label">
                  프로필 공개 여부
                  <span className="user-edit-page__optional-text">(선택)</span>
                </label>

                <select
                  id="isPublic"
                  value={isPublic}
                  onChange={(e) =>
                    setIsPublic(e.target.value as "TRUE" | "FALSE")
                  }
                  className="user-edit-page__input"
                >
                  <option value="TRUE">공개</option>
                  <option value="FALSE">비공개</option>
                </select>
              </div>
            </div>
          </section>

          <section className="user-edit-page__section">
            <h2 className="user-edit-page__section-title">계정 정보</h2>

            <div className="user-edit-page__account-box">
              <div className="user-edit-page__account-row">
                <span>회원 ID</span>
                <strong>{user?.id}</strong>
              </div>

              <div className="user-edit-page__account-row">
                <span>이메일</span>
                <strong>{user?.email}</strong>
              </div>

              <div className="user-edit-page__account-row">
                <span>로그인 ID</span>
                <strong>{user?.loginId}</strong>
              </div>
            </div>
          </section>

          <div className="user-edit-page__actions">
            <button
              type="button"
              className="user-edit-page__button user-edit-page__button--secondary"
              onClick={() => navigate("/mypage")}
            >
              취소
            </button>

            <button
              type="submit"
              className="user-edit-page__button user-edit-page__button--primary"
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
