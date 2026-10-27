import type { RoomView } from "./game";
type Session = { code: string; token: string };
export async function exportGamePdf(
  snapshot: RoomView,
  session: Session,
  onProgress: (value: string) => void,
) {
  if (snapshot.status !== "finished")
    throw Error("Aguarde a revelação para baixar o PDF.");
  const { jsPDF } = await import("jspdf");
  await document.fonts.ready;
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const canvas = document.createElement("canvas");
  canvas.width = 1240;
  canvas.height = 1754;
  const ctx = canvas.getContext("2d")!;
  let pages = 0;
  function text(
    value: string,
    x: number,
    y: number,
    size: number,
    color = "#393147",
    max = 1080,
  ) {
    ctx.fillStyle = color;
    ctx.font = `${size}px "DM Sans Variable", sans-serif`;
    const words = Array.from(value);
    let line = "";
    for (const ch of words) {
      if (ctx.measureText(line + ch).width > max && line) {
        ctx.fillText(line, x, y);
        line = ch;
        y += size * 1.4;
      } else line += ch;
    }
    ctx.fillText(line, x, y);
    return y + size * 1.4;
  }
  for (let album = 0; album < snapshot.players.length; album++) {
    onProgress(`Preparando álbum ${album + 1}/${snapshot.players.length}…`);
    const response = await fetch(
      `/api/rooms?code=${session.code}&album=${album}`,
      { headers: { "x-player-token": session.token }, cache: "no-store" },
    );
    const data = await response.json();
    if (!response.ok) throw Error(data.error || "Falha ao carregar os álbuns.");
    const room = data.room as RoomView;
    if (
      room.status !== "finished" ||
      room.gameId !== snapshot.gameId ||
      room.revealedAlbum !== album
    )
      throw Error(
        "A partida mudou durante o download. Baixe o PDF antes de iniciar outra partida.",
      );
    const entries = room.albums?.[album];
    if (!entries?.length || entries.length !== snapshot.totalRounds)
      throw Error("O álbum está incompleto. Tente novamente.");
    for (let first = 0; first < entries.length; first += 3) {
      ctx.fillStyle = "#fcfaf7";
      ctx.fillRect(0, 0, 1240, 1754);
      text("PhoneArt · a história completa", 70, 85, 40, "#9271c8");
      text(
        `Sala ${room.code} · ${room.mode === "chaos" ? "Caos Criativo" : room.mode === "lightning" ? "Relâmpago" : "Clássico"}`,
        70,
        135,
        23,
        "#92889f",
      );
      text(`Álbum de ${room.players[album].name}`, 70, 198, 30);
      for (let i = first; i < Math.min(first + 3, entries.length); i++) {
        const entry = entries[i],
          top = 250 + (i - first) * 465;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(60, top, 1120, 435);
        const author =
          room.players.find((p) => p.id === entry.playerId)?.name ?? "Jogador";
        text(`Rodada ${i + 1} · ${author}`, 85, top + 44, 25);
        text(
          `${entry.kind === "drawing" ? "Desenho" : i === 0 ? "Frase inicial" : "Adivinhação"}${entry.timedOut ? " · tempo esgotado" : ""}`,
          85,
          top + 78,
          19,
          "#92889f",
        );
        if (entry.kind === "drawing" && entry.value) {
          if (!entry.value.startsWith("data:image/webp;base64,"))
            throw Error("Não foi possível recuperar um dos desenhos.");
          const image = await new Promise<HTMLImageElement>(
            (resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = () =>
                reject(
                  Error("Um desenho não pôde ser carregado. Tente novamente."),
                );
              img.src = entry.value;
            },
          );
          const height = 310,
            width = (height * image.width) / image.height;
          ctx.drawImage(image, (1240 - width) / 2, top + 105, width, height);
        } else
          text(
            entry.value || "(Desenho em branco)",
            90,
            top + 165,
            34,
            "#7955b1",
            1050,
          );
      }
      text(
        `PhoneArt · álbum ${album + 1}/${room.players.length} · página ${pages + 1}`,
        70,
        1710,
        18,
        "#92889f",
      );
      if (pages++) pdf.addPage();
      pdf.addImage(
        canvas.toDataURL("image/jpeg", 0.85),
        "JPEG",
        0,
        0,
        210,
        297,
        undefined,
        "FAST",
      );
      // Yield between pages so progress updates and touch events remain responsive.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
  pdf.setProperties({
    title: `PhoneArt - Sala ${snapshot.code}`,
    subject: "Sequência completa de desenhos e frases",
    creator: "PhoneArt",
  });
  pdf.save(`PhoneArt-${snapshot.code}.pdf`);
}
