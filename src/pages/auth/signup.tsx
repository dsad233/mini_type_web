import { useMemo, useState } from "react";
import "../../styles/auth/signup.css";
import { Loading } from "@src/components";
import { useNavigate } from "react-router-dom";
import { Regex } from "@src/utils";

type TCheckStatus = "idle" | "checking" | "available" | "unavailable";

type TCheckType = "loginId" | "nickname" | "email";

export default function SignUp() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [loginId, setLoginId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [birthDay, setBirthDay] = useState<string>("");
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>("+82");
  const [phoneLocalNumber, setPhoneLocalNumber] = useState<string>("");
  const [isPublic, setIsPublic] = useState<string>("TRUE");

  const [loginIdStatus, setLoginIdStatus] = useState<TCheckStatus>("idle");
  const [nicknameStatus, setNicknameStatus] = useState<TCheckStatus>("idle");
  const [emailStatus, setEmailStatus] = useState<TCheckStatus>("idle");

  const normalizedPhoneLocalNumber = phoneLocalNumber.replace(/[^0-9]/g, "");

  const normalizedPhoneNumber = normalizedPhoneLocalNumber
    ? `${phoneCountryCode}${normalizedPhoneLocalNumber}`
    : "";

  const emailContainsKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(email);

  const validation = useMemo(() => {
    const trimmedLoginId = loginId.trim();
    const trimmedNickname = nickname.trim();
    const trimmedEmail = email.trim();

    return {
      loginId: Regex.loginId.test(trimmedLoginId),
      nickname: trimmedNickname.length >= 2 && trimmedNickname.length <= 32,
      email: !emailContainsKorean && Regex.email.test(trimmedEmail),
      password: password.length >= 8,
      passwordMatch: confirmPassword.length > 0 && password === confirmPassword,
    };
  }, [
    loginId,
    nickname,
    email,
    emailContainsKorean,
    password,
    confirmPassword,
  ]);

  const getFieldLabel = (type: TCheckType) => {
    if (type === "loginId") return "아이디";
    if (type === "email") return "이메일";
    return "닉네임";
  };

  const checkDuplicate = async ({
    value,
    type,
  }: {
    value: string;
    type: TCheckType;
  }) => {
    const trimmedValue = value.trim();
    const fieldLabel = getFieldLabel(type);

    if (!trimmedValue) {
      alert(`${fieldLabel}을 입력해주세요.`);
      return;
    }

    if (type === "loginId" && !validation.loginId) {
      alert(
        "아이디는 영문과 숫자만 사용하여 4자 이상 20자 이하로 입력해주세요.",
      );
      return;
    }

    if (type === "nickname" && !validation.nickname) {
      alert("닉네임은 2자 이상 32자 이하로 입력해주세요.");
      return;
    }

    if (type === "email" && !validation.email) {
      alert("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    const setStatus =
      type === "loginId"
        ? setLoginIdStatus
        : type === "email"
          ? setEmailStatus
          : setNicknameStatus;

    const endpoint =
      type === "loginId"
        ? `/api/auth/check/loginid?loginId=${encodeURIComponent(trimmedValue)}`
        : type === "email"
          ? `/api/auth/check/email?email=${encodeURIComponent(trimmedValue)}`
          : `/api/auth/check/nickname?nickname=${encodeURIComponent(
              trimmedValue,
            )}`;

    try {
      setStatus("checking");

      const res = await fetch(endpoint, {
        method: "GET",
      });

      const response = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("unavailable");

        alert(
          response.error ||
            response.message ||
            `사용할 수 없는 ${fieldLabel}입니다.`,
        );

        return;
      }

      const isAvailable = response.verify === true;

      setStatus(isAvailable ? "available" : "unavailable");
    } catch (error) {
      console.error(`${fieldLabel} 중복 확인 오류:`, error);
      setStatus("idle");
      alert(`${fieldLabel} 중복 확인 중 오류가 발생했습니다.`);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validation.nickname) {
      alert("닉네임은 2자 이상 32자 이하로 입력해주세요.");
      return;
    }

    if (!validation.loginId) {
      alert(
        "아이디는 영문과 숫자만 사용하여 4자 이상 20자 이하로 입력해주세요.",
      );
      return;
    }

    if (!validation.email) {
      alert("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    if (!validation.password) {
      alert("비밀번호는 8자 이상 입력해주세요.");
      return;
    }

    if (!validation.passwordMatch) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (nicknameStatus !== "available") {
      alert("닉네임 중복 확인을 완료해주세요.");
      return;
    }

    if (loginIdStatus !== "available") {
      alert("아이디 중복 확인을 완료해주세요.");
      return;
    }

    if (emailStatus !== "available") {
      alert("이메일 중복 확인을 완료해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          loginId: loginId.trim(),
          password,
          confirmPassword,
          name: name.trim() || null,
          nickname: nickname.trim(),
          gender: gender || null,
          birthDay: birthDay || null,
          phoneNumber: normalizedPhoneNumber || null,
          isPublic,
        }),
      });

      const response = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          response.error || response.message || "회원가입에 실패했습니다.",
        );
      }

      alert(
        "회원가입이 완료되었습니다. 이메일을 확인하여 이메일 인증을 완료해주세요.",
      );

      navigate("/");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "회원가입 중 오류가 발생했습니다.";

      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <main className="signup-page">
          <section className="signup-shell">
            <div className="signup-hero">
              <span className="signup-badge">COMMUNITY HUB</span>

              <h1>함께 이야기할 계정을 만들어보세요</h1>

              <p>
                개발, 게임, 스포츠, 자유 주제를 나누는 커뮤니티에 가입하고
                게시글과 댓글 활동을 시작해보세요.
              </p>

              <div className="signup-hero-card">
                <div className="signup-hero-stat">
                  <strong>FREE</strong>
                  <span>자유로운 커뮤니티 참여</span>
                </div>

                <div className="signup-hero-stat">
                  <strong>PROFILE</strong>
                  <span>닉네임 기반 활동</span>
                </div>

                <div className="signup-hero-stat">
                  <strong>VERIFY</strong>
                  <span>이메일 인증으로 안전하게</span>
                </div>
              </div>
            </div>

            <section className="signup-card" aria-labelledby="signup-title">
              <div className="signup-card-head">
                <span className="signup-badge signup-badge--soft">SIGN UP</span>

                <h2 id="signup-title">회원가입</h2>

                <p>
                  필수 정보를 입력하고 중복 확인 및 이메일 인증으로 가입을
                  완료하세요.
                </p>

                <p className="signup-required-guide">
                  <span className="signup-required-mark" aria-hidden="true">
                    *
                  </span>{" "}
                  표시된 항목은 필수 입력입니다.
                </p>
              </div>

              <form className="signup-form" onSubmit={handleSignUp}>
                <div className="signup-field-row">
                  <div className="signup-field">
                    <label htmlFor="name">
                      이름
                      <span className="signup-optional-text">(선택)</span>
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={50}
                    />

                    <div
                      className="signup-validation-slot"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="signup-field">
                    <label htmlFor="nickname">
                      닉네임
                      <span className="signup-required-mark" aria-hidden="true">
                        *
                      </span>
                    </label>

                    <div className="signup-check-field">
                      <input
                        id="nickname"
                        name="nickname"
                        type="text"
                        autoComplete="nickname"
                        required
                        aria-required="true"
                        minLength={2}
                        maxLength={32}
                        value={nickname}
                        onChange={(e) => {
                          setNickname(e.target.value);
                          setNicknameStatus("idle");
                        }}
                      />

                      <button
                        type="button"
                        className="signup-duplicate-check-btn"
                        disabled={
                          nicknameStatus === "checking" || !validation.nickname
                        }
                        onClick={() =>
                          checkDuplicate({
                            value: nickname,
                            type: "nickname",
                          })
                        }
                      >
                        {nicknameStatus === "checking" ? "확인 중" : "확인"}
                      </button>
                    </div>

                    <div
                      className="signup-validation-slot"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      {nickname.trim().length > 0 && !validation.nickname && (
                        <small className="signup-validation-message is-error">
                          닉네임은 2자 이상 32자 이하로 입력해주세요.
                        </small>
                      )}

                      {nickname.trim().length > 0 &&
                        validation.nickname &&
                        nicknameStatus === "idle" && (
                          <small className="signup-validation-message is-default">
                            사용 가능한 형식입니다. 중복 확인을 진행해주세요.
                          </small>
                        )}

                      {nicknameStatus === "available" && (
                        <small className="signup-validation-message is-success">
                          사용 가능한 닉네임입니다.
                        </small>
                      )}

                      {nicknameStatus === "unavailable" && (
                        <small className="signup-validation-message is-error">
                          이미 사용 중이거나 사용할 수 없는 닉네임입니다.
                        </small>
                      )}
                    </div>
                  </div>
                </div>

                <div className="signup-field">
                  <label htmlFor="loginId">
                    아이디
                    <span className="signup-required-mark" aria-hidden="true">
                      *
                    </span>
                  </label>

                  <div className="signup-check-field">
                    <input
                      id="loginId"
                      name="loginId"
                      type="text"
                      autoComplete="username"
                      required
                      aria-required="true"
                      minLength={2}
                      maxLength={13}
                      pattern="[a-zA-Z0-9]+"
                      value={loginId}
                      onChange={(e) => {
                        setLoginId(e.target.value);
                        setLoginIdStatus("idle");
                      }}
                    />

                    <button
                      type="button"
                      className="signup-duplicate-check-btn"
                      disabled={
                        loginIdStatus === "checking" || !validation.loginId
                      }
                      onClick={() =>
                        checkDuplicate({
                          value: loginId,
                          type: "loginId",
                        })
                      }
                    >
                      {loginIdStatus === "checking" ? "확인 중" : "확인"}
                    </button>
                  </div>

                  <div
                    className="signup-validation-slot"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {loginId.trim().length > 0 && !validation.loginId && (
                      <small className="signup-validation-message is-error">
                        아이디는 영문과 숫자만 사용하여 2자 이상 13자 이하로
                        입력해주세요.
                      </small>
                    )}

                    {loginId.trim().length > 0 &&
                      validation.loginId &&
                      loginIdStatus === "idle" && (
                        <small className="signup-validation-message is-default">
                          사용 가능한 형식입니다. 중복 확인을 진행해주세요.
                        </small>
                      )}

                    {loginIdStatus === "available" && (
                      <small className="signup-validation-message is-success">
                        사용 가능한 아이디입니다.
                      </small>
                    )}

                    {loginIdStatus === "unavailable" && (
                      <small className="signup-validation-message is-error">
                        이미 사용 중이거나 사용할 수 없는 아이디입니다.
                      </small>
                    )}
                  </div>
                </div>

                <div className="signup-field">
                  <label htmlFor="email">
                    이메일
                    <span className="signup-required-mark" aria-hidden="true">
                      *
                    </span>
                  </label>

                  <div className="signup-check-field">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      aria-required="true"
                      maxLength={254}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailStatus("idle");
                      }}
                    />

                    <button
                      type="button"
                      className="signup-duplicate-check-btn"
                      disabled={emailStatus === "checking" || !validation.email}
                      onClick={() =>
                        checkDuplicate({
                          value: email,
                          type: "email",
                        })
                      }
                    >
                      {emailStatus === "checking" ? "확인 중" : "확인"}
                    </button>
                  </div>

                  <div
                    className="signup-validation-slot"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {email.trim().length > 0 && !validation.email && (
                      <small className="signup-validation-message is-error">
                        {emailContainsKorean
                          ? "이메일에는 한글을 입력할 수 없습니다."
                          : "올바른 이메일 형식을 입력해주세요."}
                      </small>
                    )}

                    {email.trim().length > 0 &&
                      validation.email &&
                      emailStatus === "idle" && (
                        <small className="signup-validation-message is-default">
                          사용 가능한 형식입니다. 중복 확인을 진행해주세요.
                        </small>
                      )}

                    {emailStatus === "available" && (
                      <small className="signup-validation-message is-success">
                        사용 가능한 이메일입니다.
                      </small>
                    )}

                    {emailStatus === "unavailable" && (
                      <small className="signup-validation-message is-error">
                        이미 가입되어 있거나 사용할 수 없는 이메일입니다.
                      </small>
                    )}
                  </div>
                </div>

                <div className="signup-field-row">
                  <div className="signup-field">
                    <label htmlFor="password">
                      비밀번호
                      <span className="signup-required-mark" aria-hidden="true">
                        *
                      </span>
                    </label>

                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      aria-describedby="password-help"
                      required
                      aria-required="true"
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    <div
                      className="signup-validation-slot"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="signup-field">
                    <label htmlFor="passwordConfirm">
                      비밀번호 확인
                      <span className="signup-required-mark" aria-hidden="true">
                        *
                      </span>
                    </label>

                    <input
                      id="passwordConfirm"
                      name="passwordConfirm"
                      type="password"
                      autoComplete="new-password"
                      required
                      aria-required="true"
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <div
                      className="signup-validation-slot"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <p id="password-help" className="signup-help">
                  비밀번호는 8자 이상, 영문/숫자/특수문자를 포함하는 것을
                  권장합니다.
                </p>

                <div className="signup-field-row">
                  <div className="signup-field">
                    <label htmlFor="phoneLocalNumber">
                      전화번호
                      <span className="signup-optional-text">(선택)</span>
                    </label>

                    <div className="signup-phone-field">
                      <select
                        id="phoneCountryCode"
                        name="phoneCountryCode"
                        value={phoneCountryCode}
                        onChange={(e) => setPhoneCountryCode(e.target.value)}
                        className="signup-phone-code"
                      >
                        <option value="+82">+82</option>
                        <option value="+81">+81</option>
                        <option value="+1">+1</option>
                        <option value="+84">+84</option>
                        <option value="+886">+886</option>
                      </select>

                      <input
                        id="phoneLocalNumber"
                        name="phoneLocalNumber"
                        type="tel"
                        autoComplete="tel-national"
                        value={phoneLocalNumber}
                        onChange={(e) =>
                          setPhoneLocalNumber(
                            e.target.value.replace(/[^0-9]/g, ""),
                          )
                        }
                        placeholder="01012345678"
                        maxLength={15}
                        className="signup-phone-input"
                      />
                    </div>

                    <div
                      className="signup-validation-slot"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="signup-field">
                    <label htmlFor="birthDay">
                      생년월일
                      <span className="signup-optional-text">(선택)</span>
                    </label>

                    <input
                      id="birthDay"
                      name="birthDay"
                      type="date"
                      value={birthDay}
                      onChange={(e) => setBirthDay(e.target.value)}
                    />

                    <div
                      className="signup-validation-slot"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div className="signup-field">
                  <span className="signup-label">
                    성별
                    <span className="signup-optional-text">(선택)</span>
                  </span>

                  <div className="signup-radio-group">
                    <label className="signup-radio">
                      <input
                        type="radio"
                        name="gender"
                        value="MALE"
                        checked={gender === "MALE"}
                        onChange={(e) => setGender(e.target.value)}
                      />
                      <span>남성</span>
                    </label>

                    <label className="signup-radio">
                      <input
                        type="radio"
                        name="gender"
                        value="FEMALE"
                        checked={gender === "FEMALE"}
                        onChange={(e) => setGender(e.target.value)}
                      />
                      <span>여성</span>
                    </label>
                  </div>
                </div>

                <label className="signup-check">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={isPublic === "TRUE"}
                    onChange={(e) =>
                      setIsPublic(e.target.checked ? "TRUE" : "FALSE")
                    }
                  />

                  <span>
                    프로필 공개에 동의합니다.{" "}
                    <span className="signup-optional-text">(선택)</span>
                  </span>
                </label>

                <label className="signup-check">
                  <input type="checkbox" name="terms" required />

                  <span>
                    이용약관 및 개인정보 수집·이용에 동의합니다.
                    <span className="signup-required-mark" aria-hidden="true">
                      *
                    </span>
                  </span>
                </label>

                <button
                  type="submit"
                  className="signup-submit-btn"
                  disabled={isLoading}
                >
                  회원가입 완료
                </button>
              </form>

              <div className="signup-footer">
                <span>이미 계정이 있나요?</span>
                <a href="/signin">로그인</a>
              </div>
            </section>
          </section>
        </main>
      )}
    </>
  );
}
