// ═══════════════════════════════════════════════════════════════════════════
// Vorschau.jsx — Live-Vorschau „Karten ⇆ Liste" für Karte 3 des Pitch.
// WEG B1: ORIGINALGETREUE Nachbildung der echten AllesDa-Bausteine — echtes
// Gebäude-Icon (SVG-Pfad 1:1), echte Avatar-Form (Firma=rounded rect,
// Person=Kreis, bg {color}22, Rand {color}40), echte Rollen-Badges
// (Mieter "M" grün #22C55E, Eigentümer "E" pink #F472B6), Bereichsfarben
// (Objekte Cyan #0E7490, Kontakte Violett #8B5CF6). Zeigt Objekte UND Kontakte.
// Unabhängig von den App-Hooks (sicher), aber optisch echt.
// Kein ?. (iOS-Regel), Werte vor return als const.
// ═══════════════════════════════════════════════════════════════════════════
import React from "react";
import { RAD } from "./tokens.js";

const OBJEKT_FARBE = "#0E7490";   // Cyan
const KONTAKT_FARBE = "#8B5CF6";  // Violett
const MIETER = "#22C55E";         // M grün
const EIGENT = "#F472B6";         // E pink

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

// ── Avatar (echte Form): Firma=rounded rect mit building-Icon, Person=Kreis
//    mit Initialen. Optional Eck-Badge unten-rechts (Rolle). ──
function Av({ firma, initialen, farbe, badge, size }) {
  const s = size || 40;
  const bg = farbe + "22";
  const rand = farbe + "40";
  return (
    <div style={{ position: "relative", width: s, height: s, flexShrink: 0 }}>
      <div style={{
        width: s, height: s,
        borderRadius: firma ? Math.round(s * 0.22) : "50%",
        background: bg, border: `1.5px solid ${rand}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxSizing: "border-box"
      }}>
        {firma
          ? <Icon d={BUILDING} size={Math.round(s * 0.5)} color={farbe} stroke={1.6} />
          : <span style={{ fontSize: s * 0.36, fontWeight: 800, color: farbe, lineHeight: 1 }}>{initialen}</span>}
      </div>
      {badge ? (
        <div style={{
          position: "absolute", right: -3, bottom: -3,
          width: s * 0.42, height: s * 0.42, borderRadius: "50%",
          background: badge.farbe, color: "#FFFFFF",
          fontSize: s * 0.26, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid #0D0D16"
        }}>{badge.k}</div>
      ) : null}
    </div>
  );
}

// Beispiel-Objekte (mit den Sonderfällen aus dem Pitch).
const OBJEKTE = [
  { nr: "WEG Lindenhof", adr: "Lindenstraße 12, Kassel", eh: 18, status: "#EF4444" },
  { nr: "Objekt Rheinblick", adr: "Uferweg 3–5, Mainz", eh: 9, status: null }
];

// Beispiel-Kontakte (Firma + Person, mit Rollen-Badge).
const KONTAKTE = [
  { firma: true, name: "Bäckerei Körnig e.K.", ini: "B", tel: "+49 1550 00 01001", mail: "gewerbe.koernig@…", badge: { k: "M", farbe: MIETER } },
  { firma: false, name: "Dirk Mahler", ini: "DM", tel: "+49 555 01 033", mail: "d.mahler@…", badge: { k: "E", farbe: EIGENT } }
];

// ── Objekt als Karte ──
function ObjKarte({ o, t }) {
  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: RAD.lg, background: t.card, padding: "10px 12px", display: "flex", alignItems: "center", gap: 12 }}>
      <Av firma={true} farbe={OBJEKT_FARBE} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: OBJEKT_FARBE, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.nr}</div>
        <div style={{ fontSize: 13, color: t.sub, marginTop: 1 }}>{o.adr}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{ fontSize: 13, color: t.sub, whiteSpace: "nowrap" }}><strong style={{ color: t.text }}>{o.eh}</strong> EH</div>
        {o.status ? <div style={{ width: 9, height: 9, borderRadius: "50%", background: o.status }} /> : null}
      </div>
    </div>
  );
}

// ── Kontakt als Karte (Avatar + Name + Tel/Mail + Eck-Badge groß rechts) ──
function KonKarte({ k, t }) {
  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: RAD.lg, background: t.card, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
      <Av firma={k.firma} initialen={k.ini} farbe={KONTAKT_FARBE} badge={k.badge} size={44} />
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

// ── Objekt als Listenzeile ──
function ObjZeile({ o, t, letzte }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderBottom: letzte ? "none" : `1px solid ${t.border}` }}>
      {o.status ? <div style={{ width: 8, height: 8, borderRadius: "50%", background: o.status, flexShrink: 0 }} /> : <div style={{ width: 8, flexShrink: 0 }} />}
      <div style={{ fontSize: 14, fontWeight: 700, color: t.text, flexShrink: 0 }}>{o.nr}</div>
      <div style={{ fontSize: 13, color: t.sub, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.adr}</div>
      <div style={{ fontSize: 13, color: t.sub, flexShrink: 0 }}>{o.eh} EH</div>
    </div>
  );
}

// ── Kontakt als Listenzeile ──
function KonZeile({ k, t, letzte }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderBottom: letzte ? "none" : `1px solid ${t.border}` }}>
      <Av firma={k.firma} initialen={k.ini} farbe={KONTAKT_FARBE} badge={k.badge} size={30} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{k.name}</div>
        <div style={{ fontSize: 12.5, color: t.sub }}>{k.tel}</div>
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

      <div key={ansicht} style={{ animation: "pitchFade 300ms ease" }}>
        {ansicht === "karten" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <ObjKarte o={OBJEKTE[0]} t={t} />
            <KonKarte k={KONTAKTE[0]} t={t} />
            <KonKarte k={KONTAKTE[1]} t={t} />
          </div>
        ) : (
          <div style={{ border: `1px solid ${t.border}`, borderRadius: RAD.lg, background: t.card, overflow: "hidden" }}>
            <ObjZeile o={OBJEKTE[0]} t={t} />
            <ObjZeile o={OBJEKTE[1]} t={t} />
            <KonZeile k={KONTAKTE[0]} t={t} />
            <KonZeile k={KONTAKTE[1]} t={t} letzte={true} />
          </div>
        )}
      </div>
    </div>
  );
}
