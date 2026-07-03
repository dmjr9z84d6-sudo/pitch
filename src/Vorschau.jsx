// ═══════════════════════════════════════════════════════════════════════════
// Vorschau.jsx — Live-Vorschau „Karten ⇆ Liste" für Karte 3 des Pitch.
// VOLL ORIGINALGETREUE Nachbildung der echten AllesDa-Bausteine:
// - Objekt-Karte: Avatar mit ZWEI Eck-Badges (EN blau oben-rechts, M grün
//   unten-links), drei Textzeilen (VE-Nr cyan → fetter Name → Straße → Ort),
//   rechts „7 WE" + drei runde Verwendungs-Badges (M/EN/N), unten orange
//   Fälligkeitszeile mit Trennlinie.
// - Kontakt-Karte: Avatar (Firma=rounded rect, Person=Kreis) mit Rollen-Badge
//   unten-links, Name violett, Tel/Mail mit Icons.
// - Listen strikt einzeilig: Objekt (Punkt + VE-Nr + Adresse + EH),
//   Kontakt (Punkt + Name [Firma unterstrichen] + Rolle).
// Farben 1:1 aus der App: Objekte Cyan, Kontakte Violett, Mieter grün,
// Eigentümer pink, Eigennutzung blau, Nießbraucher lila, Warn-Orange.
// Unabhängig von den App-Hooks (sicher), aber optisch echt.
// Kein ?. (iOS-Regel), Werte vor return als const.
//
// KOPF-FIX (Grid-Overlay): Beide Ansichten liegen im SELBEN Grid-Feld
// übereinander — der Container ist immer so hoch wie die höhere Variante
// (Karten). Beim Umschalten ändert sich die Folien-Höhe nicht, die
// Überschrift („oder") und der Umschalter bleiben exakt stehen. Die
// inaktive Variante ist per Opacity ausgeblendet und nicht klickbar
// (weicher Cross-Fade statt Neuaufbau).
// ═══════════════════════════════════════════════════════════════════════════
import React from "react";
import { RAD } from "./tokens.js";

const OBJEKT_FARBE = "#0E7490";   // Cyan (Bereich Objekte)
const KONTAKT_FARBE = "#8B5CF6";  // Violett (Bereich Kontakte)
const MIETER = "#22C55E";         // M grün
const EIGENT = "#F472B6";         // E pink
const EN_BLAU = "#3B82F6";        // EN blau (Eigennutzung)
const NIESS = "#9333EA";          // N lila (Nießbraucher)
const WARN = "#F59E0B";           // Warn-Orange (Fälligkeit)

// Echter building-SVG-Pfad aus utils-icons.jsx.
const BUILDING = "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21";
const PHONE = "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z";
const MAIL = "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75";

function Icon({ d, size, color, stroke }) {
  const s = size || 16;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={stroke || 1.6} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: "block" }}>
      <path d={d} />
    </svg>
  );
}

// ── Runder Verwendungs-/Rollen-Badge (M/EN/N/E) ──
function RundBadge({ k, farbe, size }) {
  const r = size || 22;
  return (
    <div style={{
      width: r, height: r, borderRadius: "50%",
      background: farbe, color: "#FFFFFF",
      fontSize: r * 0.42, fontWeight: 700,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0
    }}>{k}</div>
  );
}

// ── Avatar (echte Form): Firma=rounded rect mit building-Icon, Person=Kreis
//    mit Initialen. Optional ZWEI Eck-Badges: oben-rechts + unten-links. ──
function Av({ firma, initialen, farbe, size, badgeOR, badgeUL }) {
  const s = size || 40;
  const bs = s * 0.44;
  return (
    <div style={{ position: "relative", width: s, height: s, flexShrink: 0 }}>
      <div style={{
        width: s, height: s,
        borderRadius: firma ? Math.round(s * 0.22) : "50%",
        background: farbe + "22", border: `1.5px solid ${farbe}40`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxSizing: "border-box"
      }}>
        {firma
          ? <Icon d={BUILDING} size={Math.round(s * 0.5)} color={farbe} />
          : <span style={{ fontSize: s * 0.36, fontWeight: 800, color: farbe, lineHeight: 1 }}>{initialen}</span>}
      </div>
      {badgeOR ? (
        <div style={{ position: "absolute", top: -bs * 0.35, right: -bs * 0.35 }}>
          <RundBadge k={badgeOR.k} farbe={badgeOR.farbe} size={bs} />
        </div>
      ) : null}
      {badgeUL ? (
        <div style={{ position: "absolute", bottom: -bs * 0.35, left: -bs * 0.35 }}>
          <RundBadge k={badgeUL.k} farbe={badgeUL.farbe} size={bs} />
        </div>
      ) : null}
    </div>
  );
}

// Beispiel-Objekt (mit allen Details wie im echten Screenshot).
const OBJ = {
  nr: "VE-001", name: "WEG Lessingstraße 22, Leipzig",
  strasse: "Lessingstraße 22", ort: "Leipzig", we: 7,
  faellig: "Haus- und Grundbesitzerhaftpflicht in 43 Tagen",
  status: WARN
};
const OBJ2 = { nr: "VE-002", name: "Objekt Rheinblick", strasse: "Uferweg 3–5", ort: "Mainz", we: 9, status: null };

const KONTAKTE = [
  { firma: true, name: "Bäckerei Körnig e.K.", ini: "B", tel: "+49 1550 00 01001", mail: "gewerbe.koernig@…", rolle: "Mieter", punkt: MIETER, badge: { k: "M", farbe: MIETER } },
  { firma: false, name: "Dirk Mahler", ini: "DM", tel: "+49 555 01 033", mail: "d.mahler@…", rolle: "Eigentümer", punkt: EIGENT, badge: { k: "E", farbe: EIGENT } }
];

// ── OBJEKT-KARTE (voll originalgetreu) ──
function ObjKarte({ t }) {
  const o = OBJ;
  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: RAD.lg, background: t.card, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px" }}>
        {/* Avatar mit 2 Eck-Badges: EN oben-rechts (blau), M unten-links (grün) */}
        <Av firma={true} farbe={OBJEKT_FARBE} size={40}
            badgeOR={{ k: "EN", farbe: EN_BLAU }} badgeUL={{ k: "M", farbe: MIETER }} />
        {/* Mitte: VE-Nr + fetter Name + Straße + Ort */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: OBJEKT_FARBE, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.nr}</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: t.text, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.name}</div>
          <div style={{ fontSize: 12.5, color: t.sub, marginTop: 1 }}>{o.strasse}</div>
          <div style={{ fontSize: 12.5, color: t.sub }}>{o.ort}</div>
        </div>
        {/* Rechts: WE-Zahl + drei runde Verwendungs-Badges */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          <div style={{ fontSize: 13, color: t.sub, whiteSpace: "nowrap" }}><strong style={{ color: t.text }}>{o.we}</strong> WE</div>
          <div style={{ display: "flex", gap: 4 }}>
            <RundBadge k="M" farbe={MIETER} size={20} />
            <RundBadge k="EN" farbe={EN_BLAU} size={20} />
            <RundBadge k="N" farbe={NIESS} size={20} />
          </div>
        </div>
      </div>
      {/* Unten: orange Fälligkeitszeile mit Trennlinie */}
      <div style={{
        borderTop: `1px solid ${t.border}`, padding: "0 12px", height: 30,
        display: "flex", alignItems: "center", color: WARN,
        fontSize: 12.5, fontWeight: 700, letterSpacing: "0.02em",
        whiteSpace: "nowrap", overflow: "hidden"
      }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{o.faellig}</span>
      </div>
    </div>
  );
}

// ── Kontakt als Karte (Avatar + Name + Tel/Mail + Rollen-Badge unten-links) ──
function KonKarte({ k, t }) {
  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: RAD.lg, background: t.card, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
      <Av firma={k.firma} initialen={k.ini} farbe={KONTAKT_FARBE} size={44} badgeUL={k.badge} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: KONTAKT_FARBE, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{k.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <Icon d={PHONE} size={13} color={t.sub} /><span style={{ fontSize: 12.5, color: t.sub }}>{k.tel}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
          <Icon d={MAIL} size={13} color={t.sub} /><span style={{ fontSize: 12.5, color: t.sub }}>{k.mail}</span>
        </div>
      </div>
    </div>
  );
}

// ── Objekt als Listenzeile (strikt einzeilig, eigene Karte) ──
function ObjZeile({ o, t }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: `1px solid ${t.border}`, borderRadius: RAD.md, background: t.card }}>
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: o.status || t.muted, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: t.text, flexShrink: 0 }}>{o.nr}</span>
        <span style={{ fontSize: 13, color: t.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.strasse}, {o.ort}</span>
      </div>
      <span style={{ fontSize: 12.5, color: t.muted, flexShrink: 0, whiteSpace: "nowrap" }}>{o.we} EH</span>
    </div>
  );
}

// ── Kontakt als Listenzeile (strikt einzeilig, Firma unterstrichen) ──
function KonZeile({ k, t }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: `1px solid ${t.border}`, borderRadius: RAD.md, background: t.card }}>
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: k.punkt, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: t.text, flexShrink: 0, textDecoration: k.firma ? "underline" : "none" }}>{k.name}</span>
        <span style={{ fontSize: 13, color: t.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.rolle}</span>
      </div>
    </div>
  );
}

export default function Vorschau({ t, accent }) {
  const [ansicht, setAnsicht] = React.useState("karten");

  const pill = (wert, label) => {
    const aktiv = ansicht === wert;
    return (
      <button onClick={() => setAnsicht(wert)} style={{
        flex: 1, padding: "7px 0", borderRadius: RAD.ms, border: "none",
        background: aktiv ? accent : "transparent",
        color: aktiv ? "#FFFFFF" : t.sub,
        fontSize: 14, fontWeight: 600, cursor: "pointer",
        transition: "background 200ms ease, color 200ms ease",
        WebkitTapHighlightColor: "transparent"
      }}>{label}</button>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 4, padding: 4, marginBottom: 14, background: t.surface, borderRadius: RAD.md, border: `1px solid ${t.border}` }}>
        {pill("karten", "Karten")}
        {pill("liste", "Liste")}
      </div>

      {/* KOPF-FIX: Beide Varianten liegen im SELBEN Grid-Feld übereinander —
          der Container ist dadurch immer so hoch wie die höhere Variante
          (Karten). Beim Umschalten ändert sich die Folien-Höhe nicht, der
          Kopf (Überschrift + Umschalter) bleibt exakt stehen. Die inaktive
          Variante ist per Opacity ausgeblendet und nicht klickbar. */}
      <div style={{ display: "grid" }}>
        <div style={{
          gridArea: "1 / 1", alignSelf: "start",
          opacity: ansicht === "karten" ? 1 : 0,
          pointerEvents: ansicht === "karten" ? "auto" : "none",
          transition: "opacity 300ms ease"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <ObjKarte t={t} />
            <KonKarte k={KONTAKTE[0]} t={t} />
            <KonKarte k={KONTAKTE[1]} t={t} />
          </div>
        </div>
        <div style={{
          gridArea: "1 / 1", alignSelf: "start",
          opacity: ansicht === "liste" ? 1 : 0,
          pointerEvents: ansicht === "liste" ? "auto" : "none",
          transition: "opacity 300ms ease"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ObjZeile o={OBJ} t={t} />
            <ObjZeile o={OBJ2} t={t} />
            <KonZeile k={KONTAKTE[0]} t={t} />
            <KonZeile k={KONTAKTE[1]} t={t} />
          </div>
        </div>
      </div>
    </div>
  );
}
