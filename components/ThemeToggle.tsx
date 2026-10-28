"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");
  useEffect(
    () => setTheme(document.documentElement.dataset.theme || "dark"),
    [],
  );
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "light" ? "#f0f7ff" : "#080f20");
    setTheme(next);
    try {
      localStorage.setItem("phoneart-theme", next);
    } catch {}
  }
  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
      title={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      <span>{theme === "dark" ? "Claro" : "Escuro"}</span>
    </button>
  );
}
