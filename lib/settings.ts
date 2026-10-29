export const AUTO_SEND_GRACE_MS = 5000;
export const TIME_OPTIONS = [
  15, 20, 30, 45, 60, 90, 120, 180, 240, 300, 600,
] as const;
export function timeOptionsFor(mode: string): readonly number[] {
  if (mode === "phoneguess") return [90];
  return TIME_OPTIONS.filter(
    (seconds) => mode !== "lightning" || seconds <= 60,
  );
}
export function timeLabel(seconds: number) {
  if (seconds < 60) return `${seconds} segundos`;
  if (seconds % 60) return `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
  return `${seconds / 60} ${seconds === 60 ? "minuto" : "minutos"}`;
}
