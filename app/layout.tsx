import type { Metadata } from "next";
import "./globals.css";
import "./pdf-review.css";
import "katex/dist/katex.min.css";
import "./math-formula.css";
import {MathKeyboardProvider} from "./math-keyboard";

export const metadata: Metadata = {
  title: "YR 수학 훈련 프로그램",
  description: "수학 공부는 반복 반복으로 구구단이 될 때까지. 캡처와 PDF 문제를 등록하고 조각 학습으로 연결하는 수학 훈련 프로그램",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body><MathKeyboardProvider>{children}</MathKeyboardProvider></body></html>;
}
