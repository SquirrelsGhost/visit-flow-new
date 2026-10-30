// Braucht useState für die Felder des Lead-Formulars
"use client";

import { useState, type InputHTMLAttributes } from "react";
import { colorForStatus, type VisitDetails } from "../../../lib/map/mapTypes";
import { DIRECT_LEAD, type SaleResult } from "../../../lib/map/saleProducts";
import MapStatusIcon from "../MapStatusIcon";
import MapStepFrame from "../steps/MapStepFrame";
import { STEP_INPUT, STEP_LABEL } from "../steps/stepStyles";

interface MapSaleLeadStepProps {
  saving: boolean;
  onBack: () => void;
  onSave: (details: VisitDetails, sale: SaleResult) => void;
}

const STATUS = "Angetroffen → Sale" as const;

/** Solar: Leaddaten statt Produkte, Nachname Pflicht; gespeichert als Direkt-Lead (v1 renderSolarLeadForm). */
export default function MapSaleLeadStep({ saving, onBack, onSave }: MapSaleLeadStepProps) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const color = colorForStatus(STATUS);

  const save = () => {
    const doorName = `${first.trim()} ${last.trim()}`.trim();
    const comment = [note.trim(), `1x ${DIRECT_LEAD.type}`].filter(Boolean).join(" | ");
    onSave(
      { comment, email: email.trim() || undefined, phone: phone.trim() || undefined },
      { products: [DIRECT_LEAD], vertical: "solar", doorName, note: note.trim() },
    );
  };

  const field = (label: string, value: string, set: (v: string) => void, props: InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className={STEP_LABEL}>{label}</span>
      <input value={value} onChange={(e) => set(e.target.value)} className={STEP_INPUT} {...props} />
    </label>
  );

  return (
    <MapStepFrame
      title="Leaddaten erfassen"
      color={color}
      icon={<MapStatusIcon status={STATUS} vertical="solar" size={18} />}
      saving={saving}
      canSave={Boolean(last.trim())}
      onBack={onBack}
      onSave={save}
    >
      <div className="grid grid-cols-2 gap-2">
        {field("Vorname", first, setFirst, { autoComplete: "off" })}
        {field("Nachname *", last, setLast, { autoComplete: "off", required: true })}
      </div>
      {field("Telefon", phone, setPhone, { type: "tel", placeholder: "z. B. +49 170 1234567" })}
      {field("E-Mail", email, setEmail, { type: "email", placeholder: "z. B. max.mustermann@web.de" })}
      <label className="block">
        <span className={STEP_LABEL}>Notiz</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Zusätzliche Informationen…" className={STEP_INPUT} />
      </label>
    </MapStepFrame>
  );
}
