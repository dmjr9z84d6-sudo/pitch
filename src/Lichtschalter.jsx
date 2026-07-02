// ═══════════════════════════════════════════════════════════════════════════
// Lichtschalter.jsx — Der charmante Hell/Dunkel-Einstieg.
// Thematisch stimmig zur Hausverwaltung (Sie verwalten Gebäude → hier Ihr
// Schalter). Reagiert auf die Fensterform:
//   • hochkant (schmal): vertikal — oben ☀️ Hell, unten 🌙 Dunkel
//   • breit:             horizontal — links ☀️ Hell, rechts 🌙 Dunkel
// Kein ?. (Safari/iOS-Regel). Werte vor return als const.
// ═══════════════════════════════════════════════════════════════════════════
import React from "react";
import { RAD, DESKTOP_MIN_WIDTH } from "./tokens.js";

// Fensterbreite live (reagiert aufs iPad-Drehen).
function useBreit() {
  const [breit, setBreit] = React.useState(
    typeof window !== "undefined" && window.innerWidth >= DESKTOP_MIN_WIDTH
  );
  React.useEffect(() => {
    const fn = () => setBreit(window.innerWidth >= DESKTOP_MIN_WIDTH);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return breit;
}

// modus: "hell" | "dunkel". onWaehle(neuerModus).
export default function Lichtschalter({ modus, onWaehle, t, accent }) {
  const breit = useBreit();
  const istDunkel = modus === "dunkel";

  // Spur (Schalter-Rahmen). Bei breit horizontal, sonst vertikal.
  const spurBreite = breit ? 220 : 96;
  const spurHoehe = breit ? 96 : 220;
  const knaufGroesse = breit ? 84 : 84;
  const rand = 6;

  // Knauf-Position: hell = Anfang (oben/links), dunkel = Ende (unten/rechts).
  const verschiebung = breit
    ? { transform: istDunkel ? `translateX(${spurBreite - knaufGroesse - rand * 2}px)` : "translateX(0px)" }
    : { transform: istDunkel ? `translateY(${spurHoehe - knaufGroesse - rand * 2}px)` : "translateY(0px)" };

  const spurStyle = {
    position: "relative",
    width: spurBreite, height: spurHoehe,
    borderRadius: RAD.pill,
    background: istDunkel ? "#0D0D16" : "#E8ECF4",
    border: `1px solid ${t.border}`,
    cursor: "pointer",
    transition: "background 420ms ease, border-color 420ms ease",
    boxShadow: istDunkel
      ? "inset 0 2px 12px rgba(0,0,0,0.55)"
      : "inset 0 2px 10px rgba(80,110,160,0.20)",
    display: "flex",
    flexShrink: 0,
    WebkitTapHighlightColor: "transparent"
  };

  const knaufStyle = {
    position: "absolute",
    top: rand, left: rand,
    width: knaufGroesse, height: knaufGroesse,
    borderRadius: RAD.full,
    background: istDunkel
      ? "radial-gradient(circle at 35% 30%, #2A2A3E, #12121C)"
      : "radial-gradient(circle at 35% 30%, #FFFFFF, #FBE7B0)",
    boxShadow: istDunkel
      ? "0 4px 14px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)"
      : "0 4px 14px rgba(210,170,60,0.35), 0 0 0 1px rgba(255,255,255,0.6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 38, lineHeight: 1,
    transition: "transform 420ms cubic-bezier(.34,1.4,.5,1), background 420ms ease, box-shadow 420ms ease",
    ...verschiebung
  };

  // Klick auf die Spur kippt den Zustand um.
  const kippe = () => onWaehle(istDunkel ? "hell" : "dunkel");

  return (
    <div
      role="switch"
      aria-checked={istDunkel}
      aria-label="Hell oder Dunkel wählen"
      onClick={kippe}
      style={spurStyle}
    >
      <div style={knaufStyle}>{istDunkel ? "🌙" : "☀️"}</div>
    </div>
  );
}
