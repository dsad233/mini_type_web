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

export default function EditUserPage() {
  const navigate = useNavigate();
  const isSession = getWithExpiry("ack");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [user, setUser] = useState<TUserProfile | null>(null);

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "">("");
  const [birthDay, setBirthDay] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+82");
  const [phoneLocalNumber, setPhoneLocalNumber] = useState("");
  const [address, setAddress] = useState("");
  const [isPublic, setIsPublic] = useState<"TRUE" | "FALSE">("TRUE");

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
      await fetch("/api/users/existing/info", {
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
            setUser(response.data);

            setName(response?.data.name || "");
            setNickname(response?.data.nickname || "");
            setGender(response?.data.gender || "");
            setBirthDay(
              response?.data.birthDay
                ? String(response?.data.birthDay).slice(0, 10)
                : "",
            );

            const phoneInfo = splitPhoneNumber(
              response?.data.phoneNumber || null,
            );
            setPhoneCountryCode(phoneInfo.countryCode);
            setPhoneLocalNumber(phoneInfo.localNumber);

            setAddress(response?.data.address || "");
            setIsPublic(response?.data.isPublic || "TRUE");

            setIsLoading(false);
            return res;
          }
        });
    };

    requestUserProfile();
  }, [navigate, isSession]);

  const validation = useMemo(() => {
    return {
      nameLength: name.trim().length >= 2 && name.trim().length <= 50,
      nicknameLength:
        nickname.trim().length >= 2 && nickname.trim().length <= 32,
      phonePattern:
        normalizedPhoneLocalNumber.length === 0 ||
        /^[0-9]{7,12}$/.test(normalizedPhoneLocalNumber),
      addressLength: address.trim().length <= 100,
    };
  }, [name, nickname, normalizedPhoneLocalNumber, address]);

  const isChanged =
    name !== (user?.name || "") ||
    nickname !== (user?.nickname || "") ||
    gender !== (user?.gender || "") ||
    birthDay !== (user?.birthDay ? String(user.birthDay).slice(0, 10) : "") ||
    normalizedPhoneNumber !== (user?.phoneNumber || null) ||
    address !== (user?.address || "") ||
    isPublic !== (user?.isPublic || "TRUE");

  const isFormValid =
    validation.nameLength &&
    validation.nicknameLength &&
    validation.phonePattern &&
    validation.addressLength;

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

    if (!isFormValid) {
      alert("입력값을 다시 확인해주세요.");
      return;
    }

    const message = confirm("저장하시겠습니까?");

    if (!message) return;

    setIsSaving(true);

    await fetch("/api/users/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${isSession}`,
      },
      body: JSON.stringify({
        name: name.trim(),
        nickname: nickname.trim(),
        gender: gender === "" ? null : gender,
        birthDay: birthDay || null,
        phoneNumber: normalizedPhoneNumber,
        address: address.trim() || null,
        isPublic,
      }),
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
          setIsLoading(false);
          alert("회원 정보 수정이 완료되었습니다.");
          navigate("/mypage");
          return res;
        }
      });
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
                <span>{nickname?.[0] || user?.nickname?.[0] || "U"}</span>
              )}
            </div>

            <div className="user-edit-page__profile-summary">
              <strong>{nickname || "닉네임 없음"}</strong>
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
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름 입력"
                  maxLength={50}
                  required
                  aria-required="true"
                  className="user-edit-page__input"
                />
                <small
                  className={
                    validation.nameLength
                      ? "user-edit-page__message user-edit-page__message--valid"
                      : "user-edit-page__message user-edit-page__message--error"
                  }
                >
                  2자 이상 50자 이하로 입력해주세요.
                </small>
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
                <input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임 입력"
                  maxLength={32}
                  required
                  aria-required="true"
                  className="user-edit-page__input"
                />
                <small
                  className={
                    validation.nicknameLength
                      ? "user-edit-page__message user-edit-page__message--valid"
                      : "user-edit-page__message user-edit-page__message--error"
                  }
                >
                  2자 이상 32자 이하로 입력해주세요.
                </small>
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
