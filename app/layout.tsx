import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/outfit";
import "./globals.css";
export const metadata: Metadata = {
  title: "PhoneArt — a imaginação passa de mão em mão",
  description:
    "Uma frase vira desenho, um desenho vira outra história. Jogue PhoneArt online com até 20 amigos.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
