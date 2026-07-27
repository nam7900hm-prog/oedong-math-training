import type { Metadata } from "next";
import "./globals.css";
import "./pdf-review.css";

export const metadata: Metadata = {
  title: "외동중학교 수학 훈련 프로그램 · YR",
  description: "수학 공부는 반복 반복으로 구구단이 될 때까지. 캡처와 PDF 문제를 등록하고 조각 학습으로 연결하는 수학 훈련 프로그램",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
