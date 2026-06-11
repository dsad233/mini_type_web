import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Header } from "./components/index.ts";
import App from "@src/App.tsx";
import Login from "./pages/auth/login.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MyPage from "./pages/users/mypage.tsx";
import CertifiEmail from "./pages/certifiEmail.tsx";
import ResetPassword from "./pages/resetPassword.tsx";
import SignUp from "./pages/auth/signup.tsx";
import Posts from "./pages/posts/posts.tsx";
import CreatePost from "./pages/posts/createPost.tsx";
import { PostOne } from "./pages/posts/postOne.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <Header />
      <Routes>
        <Route path="/" element={<App />} />
        // auth
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/certifiemail" element={<CertifiEmail />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        // users
        <Route path="/mypage" element={<MyPage />} />
        // posts
        <Route path="/posts" element={<Posts />} />
        <Route path="/post/:id" element={<PostOne />} />
        <Route path="/posts/create" element={<CreatePost />} />
      </Routes>
    </StrictMode>
  </BrowserRouter>,
);
