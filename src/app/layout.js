import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Llama-AI",
  description: "A Next.js 14 API that dynamically generates responses using Llama chat completions, allowing customization of user input via URL query parameters.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
