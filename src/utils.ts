import { Buffer } from "buffer";

// 토큰 조회
export function getWithExpiry(key: string): string | null {
  const itemStr = localStorage.getItem(key);
  // if the item doesn't exist, return null
  if (!itemStr) {
    return null;
  }

  const item = JSON.parse(itemStr);
  const now = new Date();
  // compare the expiry time of the item with the current time
  if (now.getTime() > item.expiry) {
    // 다시 리프래쉬 토큰으로 토큰 재발급
    const refreshToken = localStorage.getItem("refresh_token");

    if (refreshToken) {
      getNewToken(item.value, JSON.parse(refreshToken).value);

      return JSON.parse(localStorage.getItem(key) as string).value;
    }

    // 리프래쉬 토큰이 없다면, null로 리턴
    localStorage.removeItem(key);

    return null;
  }

  return "Bearer " + item.value;
}

// 토큰 저장
export function setWithExpiry(key: string, value: string, ttl: number): void {
  const now = new Date();

  // `item` is an object which contains the original value
  // as well as the time when it's supposed to expire
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };

  localStorage.setItem(key, JSON.stringify(item));
}

// 토큰 삭제
export function removeSession(key: string): void {
  localStorage.removeItem(key);
}

// 페이지 번호 계산 함수
export const getVisiblePages = (page: number, totalPages: number) => {
  const maxVisible = 5;
  let start = Math.max(page - 2, 1);
  const end = Math.min(start + maxVisible - 1, totalPages);

  if (end - start < maxVisible - 1) {
    start = Math.max(end - maxVisible + 1, 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

// 토큰 재발급 함수
export async function getNewToken(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await fetch("/api/auth/reissue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${accessToken}`,
    },
    body: JSON.stringify({
      refreshToken: refreshToken,
    }),
  }).then(async (res) => {
    if (res?.ok) {
      const response = await res.json();
      // 기존 토큰 제거
      localStorage.removeItem(accessToken);
      localStorage.removeItem(refreshToken);

      // 새로운 토큰 저장
      setWithExpiry("ack", response.data["access_token"], 60 * 60 * 1000);
      setWithExpiry(
        "ref",
        response.data["refresh_token"],
        60 * 60 * 1000 * 24 * 7,
      );

      return res;
    }
  });
}

// 이미지 복호화 함수
export function imageDecodeToUrl(image: string | null): string | null {
  const url = image
    ? URL.createObjectURL(
        new Blob([Buffer.from(image, "base64").buffer], {
          type: "image/png",
        }),
      )
    : null;

  return url;
}

// 이미지 Blob 화 함수
export function imageBlob() {}
