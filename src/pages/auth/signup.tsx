import { useState } from "react";
import "../../styles/auth/signup.css";
import { Loading } from "@src/components";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [loginId, setLoginId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [birthDay, setBirthDay] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        loginId: loginId,
        password: password,
        confirmPassword: confirmPassword,
        name: name,
        nickname: nickname,
        gender: gender,
        birthDay: birthDay,
        phoneNumber: phoneNumber,
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
          alert("회원가입이 완료되었습니다. 이메일 인증을 완료해주세요.");
          setIsLoading(false);
          navigate("/");
          return res;
        }
      });
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
                <p>필수 정보를 입력하고 이메일 인증으로 가입을 완료하세요.</p>
              </div>

              <form className="signup-form" onSubmit={handleSignUp}>
                <div className="signup-field-row">
                  <div className="signup-field">
                    <label htmlFor="name">이름</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="signup-field">
                    <label htmlFor="nickname">닉네임</label>
                    <input
                      id="nickname"
                      name="nickname"
                      type="text"
                      autoComplete="nickname"
                      onChange={(e) => setNickname(e.target.value)}
                    />
                  </div>
                </div>

                <div className="signup-field">
                  <label htmlFor="loginId">아이디</label>
                  <input
                    id="loginId"
                    name="loginId"
                    type="text"
                    autoComplete="username"
                    onChange={(e) => setLoginId(e.target.value)}
                  />
                  <small>영문, 숫자 조합으로 4자 이상 입력해주세요.</small>
                </div>

                <div className="signup-field">
                  <label htmlFor="email">이메일</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="signup-field-row">
                  <div className="signup-field">
                    <label htmlFor="password">비밀번호</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      aria-describedby="password-help"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="signup-field">
                    <label htmlFor="passwordConfirm">비밀번호 확인</label>
                    <input
                      id="passwordConfirm"
                      name="passwordConfirm"
                      type="password"
                      autoComplete="new-password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <p id="password-help" className="signup-help">
                  비밀번호는 8자 이상, 영문/숫자/특수문자를 포함하는 것을
                  권장합니다.
                </p>

                <div className="signup-field-row">
                  <div className="signup-field">
                    <label htmlFor="phoneNumber">전화번호</label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      autoComplete="tel"
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>

                  <div className="signup-field">
                    <label htmlFor="birthDay">생년월일</label>
                    <input
                      id="birthDay"
                      name="birthDay"
                      type="date"
                      onChange={(e) => setBirthDay(e.target.value)}
                    />
                  </div>
                </div>

                <div className="signup-field">
                  <span className="signup-label">성별</span>
                  <div className="signup-radio-group">
                    <label className="signup-radio">
                      <input
                        type="radio"
                        name="gender"
                        value="MALE"
                        onClick={() => setGender("MALE")}
                      />
                      <span>남성</span>
                    </label>

                    <label className="signup-radio">
                      <input
                        type="radio"
                        name="gender"
                        value="FEMALE"
                        onClick={() => setGender("FEMALE")}
                      />
                      <span>여성</span>
                    </label>
                  </div>
                </div>

                <label className="signup-check">
                  <input type="checkbox" name="isPublic" defaultChecked />
                  <span>프로필 공개에 동의합니다.</span>
                </label>

                <label className="signup-check">
                  <input type="checkbox" name="terms" />
                  <span>이용약관 및 개인정보 수집·이용에 동의합니다.</span>
                </label>

                <button type="submit" className="signup-submit-btn">
                  회원가입 완료
                </button>
              </form>

              <div className="signup-footer">
                <span>이미 계정이 있나요?</span>
                <a href="/login">로그인</a>
              </div>
            </section>
          </section>
        </main>
      )}
    </>
  );
}
