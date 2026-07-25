import type { Metadata } from "next";
import "./globals.css";
import "./pdf-review.css";

export const metadata: Metadata = {
  title: "외동중 수학 훈련소",
  description: "문제를 조각내어 이해하고 반복 훈련하는 다국어 중학교 수학 학습 앱",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
