/** Erlaubte Zeichen im Rechner (wie v1): Ziffern, Operatoren, Punkt, Klammern, Leerzeichen. */
export const sanitize = (s: string) => s.replace(/[^0-9+\-*/().% ]/g, "");

type Token = { kind: "num"; value: number } | { kind: "op"; value: string };

function tokenize(expr: string): Token[] | null {
  const tokens: Token[] = [];
  const re = /\s*(\d+\.?\d*|\.\d+|[+\-*/()%])/y;
  let pos = 0;
  while (pos < expr.length) {
    if (/^\s+$/.test(expr.slice(pos))) break;
    re.lastIndex = pos;
    const match = re.exec(expr);
    if (!match?.[1]) return null;
    const raw = match[1];
    tokens.push(/[\d.]/.test(raw[0] ?? "") ? { kind: "num", value: Number(raw) } : { kind: "op", value: raw });
    pos = re.lastIndex;
  }
  return tokens;
}

/** Ein Faktor mit nachgestelltem %, z.B. "7%". Bei "a + 7%" heißt das: a plus 7 % von a. */
interface Term {
  value: number;
  percent: number | null;
}

/**
 * Kleiner Rechenparser statt v1 `Function(...)`: kein eval, punkt-vor-strich, Klammern, Vorzeichen.
 * Prozent wie am Taschenrechner: "19.99*3 + 7%" = 59,97 + 7 %, "50*10%" = 5.
 */
class Parser {
  private i = 0;
  constructor(private readonly tokens: Token[]) {}

  parse(): number | null {
    const value = this.expr();
    return this.i === this.tokens.length ? value : null;
  }

  private peek = () => this.tokens[this.i];
  private isOp = (op: string) => {
    const t = this.peek();
    return t?.kind === "op" && t.value === op;
  };

  private expr(): number {
    let left = this.term().value;
    while (this.isOp("+") || this.isOp("-")) {
      const op = (this.tokens[this.i++] as Token).value;
      const right = this.term();
      const amount = right.percent === null ? right.value : (left * right.percent) / 100;
      left = op === "+" ? left + amount : left - amount;
    }
    return left;
  }

  private term(): Term {
    let current = this.unary();
    while (this.isOp("*") || this.isOp("/")) {
      const op = (this.tokens[this.i++] as Token).value;
      const right = this.unary().value;
      current = { value: op === "*" ? current.value * right : current.value / right, percent: null };
    }
    return current;
  }

  private unary(): Term {
    if (this.isOp("-") || this.isOp("+")) {
      const negate = (this.tokens[this.i++] as Token).value === "-";
      const inner = this.unary();
      return negate ? { value: -inner.value, percent: inner.percent === null ? null : -inner.percent } : inner;
    }
    const base = this.primary();
    if (this.isOp("%")) {
      this.i++;
      return { value: base / 100, percent: base };
    }
    return { value: base, percent: null };
  }

  private primary(): number {
    const t = this.tokens[this.i++];
    if (t?.kind === "num") return t.value;
    if (t?.kind === "op" && t.value === "(") {
      const value = this.expr();
      if (!this.isOp(")")) throw new Error("paren");
      this.i++;
      return value;
    }
    throw new Error("token");
  }
}

/** Ergebnis des Ausdrucks; leer = 0, unvollständig oder ungültig = null (Anzeige "—"). */
export function evaluate(expr: string): number | null {
  const clean = sanitize(expr);
  if (!clean.trim()) return 0;
  const tokens = tokenize(clean);
  if (!tokens) return null;
  try {
    const result = new Parser(tokens).parse();
    return result !== null && Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

/** Deutsche Schreibweise mit höchstens 6 Nachkommastellen (v1 formatResult). */
export function formatResult(n: number | null): string {
  if (n === null) return "—";
  return n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 6 });
}

/** Schlaue Klammer-Taste: öffnet nach Operator oder am Anfang, schließt sonst eine offene Klammer. */
export function nextParen(expr: string): "(" | ")" {
  const open = (expr.match(/\(/g) || []).length;
  const close = (expr.match(/\)/g) || []).length;
  const last = expr.trim().slice(-1);
  const isOperatorOrStart = last === "" || /[+\-*/%(.]/.test(last);
  return open <= close || isOperatorOrStart ? "(" : ")";
}
