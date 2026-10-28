import type { Metadata, Viewport } from "next";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/outfit";
import "@fontsource-variable/pixelify-sans";
import "./globals.css";
export const viewport: Viewport = {
  themeColor: "#0a1719",
  colorScheme: "light dark",
};
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
    <html lang="pt-BR" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('phoneart-theme')==='light'?'light':'dark';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=t==='light'?'#edf7f2':'#0a1719';}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
