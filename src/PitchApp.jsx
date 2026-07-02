// ═══════════════════════════════════════════════════════════════════════════
// PitchApp.jsx — Der Pitch-Flow (Stufe 1).
// Wischbare Vollbild-Karten: Lichtschalter-Auftakt → 4 Karten → Abschluss.
// Seiten-Punkte, „Überspringen" oben rechts, Zurückwischen. System-Start
// für Hell/Dunkel. Karte „darstellung" (Karte 3) zeigt vorerst einen Platz-
// halter — die echten Bausteine VEKachel/VEListenZeile kommen als nächster
// Bau-Schritt hinein.
//
// Coding-Regeln (Safari/iOS): kein ?., keine IIFE in JSX, Werte vor return
// als const, dvh statt vh, Inputs ≥16px.
// ═══════════════════════════════════════════════════════════════════════════
import React from "react";
import { DARK, LIGHT, ACCENT, RAD, DESKTOP_MIN_WIDTH, PITCH_VERSION } from "./tokens.js";
import { KARTEN, AUFTAKT_HELLDUNKEL, MARKE } from "./inhalte.js";
import { stilTexte } from "./stil.js";
import Lichtschalter from "./Lichtschalter.jsx";
import Vorschau from "./Vorschau.jsx";

// System-Präferenz Hell/Dunkel auslesen (Start-Grundeinstellung).
function systemDunkel() {
  const mm = typeof window !== "undefined" && window.matchMedia;
  if (!mm) return true;
  const q = window.matchMedia("(prefers-color-scheme: dark)");
  return (q && q.matches) || false;
}

export default function PitchApp() {
  // Hell/Dunkel — Start aus System-Präferenz.
  const [modus, setModus] = React.useState(systemDunkel() ? "dunkel" : "hell");
  const t = modus === "dunkel" ? DARK : LIGHT;
  const accent = ACCENT;
  const stil = stilTexte(t, accent);

  // Aktuelle Karte. 0 = Lichtschalter-Auftakt, dann KARTEN[0..].
  // Gesamtzahl der Screens = 1 (Lichtschalter) + KARTEN.length.
  const gesamt = KARTEN.length + 1;
  const [screen, setScreen] = React.useState(0);

  // Touch-Wischen.
  const startRef = React.useRef(null);
  const onTouchStart = (e) => {
    const tch = (e.touches && e.touches[0]) || null;
    startRef.current = tch ? { x: tch.clientX, y: tch.clientY } : null;
  };
  const onTouchEnd = (e) => {
    const s = startRef.current;
    if (!s) return;
    const tch = (e.changedTouches && e.changedTouches[0]) || null;
    if (!tch) return;
    const dx = tch.clientX - s.x;
    const dy = tch.clientY - s.y;
    // Nur horizontale Wische zählen (vertikal = Scrollen).
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) vor();
      else zurueck();
    }
    startRef.current = null;
  };

  const vor = () => setScreen(s => Math.min(s + 1, gesamt - 1));
  const zurueck = () => setScreen(s => Math.max(s - 1, 0));
  const zumAbschluss = () => setScreen(gesamt - 1);

  // Tastatur (Desktop): Pfeile.
  React.useEffect(() => {
    const fn = (e) => {
      if (e.key === "ArrowRight") vor();
      else if (e.key === "ArrowLeft") zurueck();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [gesamt]);

  const buehneStyle = {
    position: "fixed", inset: 0,
    background: t.bg, color: t.text,
    transition: "background 420ms ease, color 420ms ease",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: "flex", flexDirection: "column",
    overflow: "hidden"
  };

  // „Überspringen" oben rechts — nur wenn nicht schon am Abschluss.
  const zeigeSkip = screen < gesamt - 1;

  return (
    <div style={buehneStyle} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Versionsnummer — unauffällig unten links, zur Cache-Kontrolle. */}
      <div style={{
        position: "absolute", left: 10, bottom: 6,
        fontSize: 10, color: t.muted, opacity: 0.5,
        letterSpacing: "0.02em", pointerEvents: "none", userSelect: "none"
      }}>v{PITCH_VERSION}</div>
      {/* Kopfzeile: Überspringen */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "max(16px, env(safe-area-inset-top)) 18px 0" }}>
        {zeigeSkip ? (
          <button
            onClick={zumAbschluss}
            style={{
              background: "transparent", border: "none",
              color: t.muted, fontSize: 16, cursor: "pointer",
              padding: "8px 4px", WebkitTapHighlightColor: "transparent"
            }}
          >
            Überspringen
          </button>
        ) : <div style={{ height: 36 }} />}
      </div>

      {/* Bühne: aktueller Screen. ALLE Screens echt vertikal zentriert, aber
          optisch einen Tick nach oben (paddingBottom hebt die Mitte an) — wirkt
          sonst zu tief. Gleiche Logik für Handy und Monitor. */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "0 28px", paddingBottom: "8vh",
        minHeight: 0, position: "relative"
      }}>
        {screen === 0
          ? <AuftaktHellDunkel modus={modus} onWaehle={setModus} t={t} accent={accent} stil={stil} />
          : <KartenScreen karte={KARTEN[screen - 1]} t={t} accent={accent} stil={stil} />}

        {/* Weiter — nur Pfeil in Cyan (Balkenfarbe), kein Kreis. Leicht,
            schwebend. Auf allen Folien außer der letzten. Wischen bleibt zusätzlich. */}
        {screen < gesamt - 1 ? (
          <button
            onClick={vor}
            aria-label="Weiter"
            style={{
              position: "absolute", right: "clamp(12px, 5vw, 52px)", bottom: 6,
              background: "transparent", border: "none",
              color: accent, fontSize: 34, lineHeight: 1,
              padding: 12, cursor: "pointer",
              WebkitTapHighlightColor: "transparent"
            }}
          >
            →
          </button>
        ) : null}
      </div>

      {/* Fußzeile: dezenter Fortschrittsstrich */}
      <div style={{ padding: "0 28px max(26px, env(safe-area-inset-bottom))" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", height: 2, background: t.border, borderRadius: RAD.pill, overflow: "hidden" }}>
          <div style={{
            height: "100%", background: accent, borderRadius: RAD.pill,
            width: ((screen + 1) / gesamt * 100) + "%",
            transition: "width 340ms ease"
          }} />
        </div>
      </div>
    </div>
  );
}

// ── Auftakt-Screen: Lichtschalter als Star. Überschrift oben, Schalter Mitte,
//    Beschreibung darunter (ohne zweiten Mond). Der Weiter-Pfeil liegt als
//    runder Button auf Bühnen-Ebene unten rechts (siehe PitchApp). ──────────
function AuftaktHellDunkel({ modus, onWaehle, t, accent, stil }) {
  const istDunkel = modus === "dunkel";
  const hd = AUFTAKT_HELLDUNKEL;
  const aktiv = istDunkel ? hd.dunkel : hd.hell;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      {/* Frage — edel, nicht wuchtig */}
      <div style={{ ...stil.frage, textAlign: "center", marginBottom: 64 }}>
        {hd.frage}
      </div>

      {/* Der Star: Schalter */}
      <Lichtschalter modus={modus} onWaehle={onWaehle} t={t} accent={accent} gross />

      {/* Beschreibung — nur Text, KEIN zweiter Mond. Feste Höhe für Ruhe. */}
      <div style={{ height: 86, marginTop: 44, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
        <div key={istDunkel ? "d" : "h"} style={{ textAlign: "center", animation: "pitchFade 420ms ease" }}>
          <div style={stil.beschrTitel}>{aktiv.titel}</div>
          <div style={stil.beschrZeile}>{aktiv.zeile}</div>
        </div>
      </div>
    </div>
  );
}

// ── Wortmarke: hebt jedes „AllesDa" im Text farbig hervor (§76: ein Aussehen
//    für die Marke, egal wo sie im Text steht). Gibt ein Array aus Text +
//    farbigen <span> zurück. Kein ?. (iOS-Regel).
function mitWortmarke(text, accent) {
  if (!text || text.indexOf("AllesDa") === -1) return text;
  const teile = text.split("AllesDa");
  const out = [];
  for (let i = 0; i < teile.length; i++) {
    if (teile[i]) out.push(teile[i]);
    if (i < teile.length - 1) {
      out.push(
        <span key={"m" + i} style={{ color: accent, fontWeight: 700 }}>AllesDa</span>
      );
    }
  }
  return out;
}

// ── Inhalts-Screen: rendert eine Folie je nach Typ ──────────────────────────
function KartenScreen({ karte, t, accent, stil }) {
  const typ = karte.typ;

  if (typ === "auftakt") {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <span style={stil.markeName}>{MARKE.name}</span>
          <span style={stil.markeEndung}>{MARKE.endung}</span>
        </div>
        {karte.zeilen.map((z, i) => (
          <div key={i} style={stil.auftaktZeile}>{z}</div>
        ))}
      </div>
    );
  }

  if (typ === "abschluss") {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {karte.zeilen.map((z, i) => (
          <div key={i} style={{ ...(i === 0 ? stil.abschlussStark : stil.abschlussSub), marginBottom: 16 }}>{z}</div>
        ))}
        <button
          onClick={() => { /* Später: Sprung in die Spielwiese (Stufe 2). */ }}
          style={{
            marginTop: 24, background: accent, color: "#FFFFFF",
            border: "none", borderRadius: RAD.xl,
            fontSize: 17, fontWeight: 600, padding: "15px 38px",
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
            boxShadow: "0 6px 18px rgba(14,116,144,0.28)"
          }}
        >
          {karte.knopf}
        </button>
      </div>
    );
  }

  // Gemeinsamer Rahmen für text / stark / darstellung.
  const istDarstellung = typ === "darstellung";
  const istStark = typ === "stark";

  // Die frühere Überzeile wird zur Schluss-Aussage UNTER dem Text (Dramaturgie:
  // erst der Inhalt/Beweis, dann die Aussage als leise Pointe). Gleiche Optik
  // wie die alte eyebrow, nur Abstand nach oben statt unten. Text-Folien nutzen
  // `eyebrow`, stark-Folien optional `aussage`.
  const schlussText = karte.eyebrow || karte.aussage || null;
  const schlussStil = { ...stil.eyebrow, marginBottom: 0, marginTop: 28 };
  const schluss = schlussText ? (
    <div style={schlussStil}>{schlussText}</div>
  ) : null;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", width: "100%" }}>
      {istStark ? (
        <div style={stil.stark}>{mitWortmarke(karte.stark, accent)}</div>
      ) : null}

      {karte.text ? (
        <p style={{ ...stil.text, margin: 0 }}>{mitWortmarke(karte.text, accent)}</p>
      ) : null}

      {karte.nachsatz ? (
        <p style={{ ...stil.nachsatz, marginBottom: 0 }}>{karte.nachsatz}</p>
      ) : null}

      {/* Schluss-Aussage — bei darstellung VOR der Vorschau (als Überleitung),
          sonst ganz am Ende. */}
      {istDarstellung ? (
        <>
          {schluss}
          <div style={{ marginTop: 22 }}>
            <Vorschau t={t} accent={accent} />
          </div>
        </>
      ) : (
        schluss
      )}
    </div>
  );
}
