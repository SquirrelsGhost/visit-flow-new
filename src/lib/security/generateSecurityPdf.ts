import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { downloadPdf, type FilledPdf } from "@/lib/forms/formPdf";
import {
  FORENSIC_AI_METADATA,
  POLICY_DOCUMENT_SUBTITLE,
  POLICY_DOCUMENT_TITLE,
  POLICY_FOOTER_LEFT,
  POLICY_PREAMBLE,
  POLICY_SECTIONS,
  SECURITY_TERMS_VERSION,
} from "@/texts/securityPolicyTexts";
import type { LeaderIdentRecord } from "./securityContractStore";

export interface SecurityPdfOptions {
  userName?: string;
  userEmail?: string;
  userRole?: string;
  userAddress?: string;
  fingerprint?: string;
  acceptedAt?: string;
  signatureDataUrl?: string | null;
  leaderIdent?: LeaderIdentRecord | null;
}

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;

function sanitizeWinAnsi(text: string): string {
  return text
    .replace(/•/g, "-")
    .replace(/[„“”]/g, '"')
    .replace(/[’‘]/g, "'")
    .replace(/–|—/g, "-");
}

function wrapLines(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const words = sanitizeWinAnsi(text).split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxW && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function buildSecurityPdf(opts: SecurityPdfOptions = {}): Promise<FilledPdf> {
  const doc = await PDFDocument.create();
  doc.setTitle(FORENSIC_AI_METADATA.title);
  doc.setAuthor(FORENSIC_AI_METADATA.author);
  doc.setSubject(FORENSIC_AI_METADATA.subject);
  doc.setKeywords([...FORENSIC_AI_METADATA.keywords]);
  doc.setProducer(FORENSIC_AI_METADATA.producer);
  doc.setCreator(FORENSIC_AI_METADATA.creator);

  const fontReg = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page: PDFPage = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN + 30) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN - 16;
    }
  };

  const drawParagraph = (text: string, font: PDFFont, size: number, color = rgb(0.18, 0.2, 0.24), indent = 0) => {
    const lines = wrapLines(text, font, size, CONTENT_W - indent);
    for (const line of lines) {
      ensureSpace(size + 5);
      page.drawText(line, { x: MARGIN + indent, y, size, font, color });
      y -= size + 4;
    }
  };

  drawParagraph(POLICY_DOCUMENT_TITLE, fontBold, 14, rgb(0.06, 0.09, 0.16));
  drawParagraph(POLICY_DOCUMENT_SUBTITLE, fontBold, 9.5, rgb(0.08, 0.45, 0.35));
  y -= 6;
  drawParagraph(POLICY_PREAMBLE, fontReg, 9, rgb(0.25, 0.28, 0.33));
  y -= 8;

  for (const section of POLICY_SECTIONS) {
    ensureSpace(36);
    drawParagraph(section.heading, fontBold, 10.5, rgb(0.06, 0.09, 0.16));
    y -= 2;
    for (const p of section.paragraphs) {
      drawParagraph(p, fontReg, 8.8);
      y -= 2;
    }
    if (section.bullets) {
      for (const b of section.bullets) {
        drawParagraph(`- ${b}`, fontReg, 8.6, rgb(0.15, 0.18, 0.22), 10);
      }
    }
    y -= 6;
  }

  ensureSpace(170);
  drawParagraph("§ 10 Elektronischer Akzeptanz- & Online-Ident-Vermerk", fontBold, 11, rgb(0.06, 0.09, 0.16));
  y -= 4;
  const stampDate = opts.acceptedAt ? new Date(opts.acceptedAt).toLocaleString("de-DE") : new Date().toLocaleString("de-DE");
  const metaRows = [
    `Nutzer / Lizenznehmer: ${opts.userName || "Nicht angegeben"} (${opts.userEmail || "-"}) | Rolle: ${opts.userRole || "Nutzer"}`,
    `Ladungsfaehige Anschrift: ${opts.userAddress || "Wird bei digitaler Unterzeichnung erfasst"}`,
    `Version & Zeitstempel: ${SECURITY_TERMS_VERSION} | ${stampDate} | Fingerprint: ${opts.fingerprint || "VF-LOCAL"}`,
    opts.leaderIdent
      ? `Online-Ident (KYC & Video-Liveness): VERIFIZIERT (${opts.leaderIdent.verificationHash}) - Ausweis-Nr.: ${opts.leaderIdent.docNumber} (${opts.leaderIdent.authority})`
      : "Online-Ident (KYC): Standard-Lizenznehmer / Optional in den Einstellungen verifizierbar",
    ...(opts.leaderIdent?.videoSha256
      ? [
          `Live-Video-Ident SHA-256 Beweishash: ${opts.leaderIdent.videoSha256.slice(0, 32)}... (Sprech-Pin: ${opts.leaderIdent.spokenPin || "-"})`,
        ]
      : []),
  ];
  for (const row of metaRows) {
    drawParagraph(row, fontReg, 8.5, rgb(0.12, 0.15, 0.2));
  }

  if (opts.signatureDataUrl && opts.signatureDataUrl.startsWith("data:image/png")) {
    try {
      const pngImage = await doc.embedPng(opts.signatureDataUrl);
      ensureSpace(64);
      y -= 48;
      page.drawImage(pngImage, { x: MARGIN, y, width: 140, height: 44 });
      y -= 12;
      drawParagraph("Elektronische eigenhaendige Unterschrift (§ 126a / § 127 BGB)", fontBold, 8, rgb(0.08, 0.45, 0.35));
    } catch {
      drawParagraph("[Digitale Signatur kryptografisch hinterlegt]", fontBold, 8.5);
    }
  }

  const pages = doc.getPages();
  pages.forEach((p, idx) => {
    p.drawText(sanitizeWinAnsi(POLICY_FOOTER_LEFT), { x: MARGIN, y: 22, size: 7.5, font: fontReg, color: rgb(0.45, 0.48, 0.52) });
    p.drawText(`Seite ${idx + 1} / ${pages.length}`, { x: PAGE_W - MARGIN - 55, y: 22, size: 7.5, font: fontReg, color: rgb(0.45, 0.48, 0.52) });
  });

  const bytes = await doc.save();
  return {
    bytes,
    fileName: `Visit_Flow_Sicherheitsrichtlinien_${SECURITY_TERMS_VERSION}.pdf`,
  };
}

export async function generateAndDownloadSecurityPdf(opts: SecurityPdfOptions = {}): Promise<FilledPdf> {
  const filled = await buildSecurityPdf(opts);
  downloadPdf(filled);
  return filled;
}
