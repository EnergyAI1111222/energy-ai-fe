/**
 * Picasso formula engine — safe expression evaluator.
 *
 * Supports:
 *   numbers (3, 3.14, .5, 1e3)
 *   variables: single letters A..Z (mapped to layer values at the current ts)
 *   operators: + - * / unary -
 *   grouping: ( ... )
 *   functions: abs(x), min(...), max(...), avg(...), sum(...), pow(x, y)
 *
 * Implementation: recursive-descent parser → AST → evaluator.
 * No use of eval / new Function — input is user-controlled, so the parser
 * rejects anything outside the grammar above.
 */
export type Ast =
  | { kind: "num"; value: number }
  | { kind: "var"; name: string }
  | { kind: "neg"; arg: Ast }
  | { kind: "bin"; op: "+" | "-" | "*" | "/"; lhs: Ast; rhs: Ast }
  | { kind: "call"; name: string; args: Ast[] };

type Token =
  | { t: "num"; v: number }
  | { t: "id"; v: string }
  | { t: "op"; v: "+" | "-" | "*" | "/" }
  | { t: "lp" }
  | { t: "rp" }
  | { t: "comma" };

function tokenize(src: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === " " || c === "\t" || c === "\n") { i++; continue; }
    if (c === "(") { out.push({ t: "lp" }); i++; continue; }
    if (c === ")") { out.push({ t: "rp" }); i++; continue; }
    if (c === ",") { out.push({ t: "comma" }); i++; continue; }
    if (c === "+" || c === "-" || c === "*" || c === "/") {
      out.push({ t: "op", v: c });
      i++;
      continue;
    }
    if ((c >= "0" && c <= "9") || c === ".") {
      let j = i;
      while (j < src.length && /[0-9._eE+\-]/.test(src[j])) {
        // Stop e+/e- only if previous char is e/E
        if ((src[j] === "+" || src[j] === "-") && !/[eE]/.test(src[j - 1])) break;
        j++;
      }
      const lit = src.slice(i, j);
      const v = Number(lit);
      if (!Number.isFinite(v)) throw new Error(`Invalid number: ${lit}`);
      out.push({ t: "num", v });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      out.push({ t: "id", v: src.slice(i, j) });
      i = j;
      continue;
    }
    throw new Error(`Unexpected character '${c}' at position ${i}`);
  }
  return out;
}

class Parser {
  private p = 0;
  constructor(private tokens: Token[]) {}
  private peek(): Token | undefined { return this.tokens[this.p]; }
  private eat(): Token { const t = this.tokens[this.p++]; if (!t) throw new Error("Unexpected end of expression"); return t; }
  private expect<T extends Token["t"]>(t: T): Extract<Token, { t: T }> {
    const tok = this.eat();
    if (tok.t !== t) throw new Error(`Expected ${t}, got ${tok.t}`);
    return tok as Extract<Token, { t: T }>;
  }

  parse(): Ast {
    const ast = this.expr();
    if (this.p < this.tokens.length) throw new Error(`Unexpected token at position ${this.p}`);
    return ast;
  }

  private expr(): Ast {
    let lhs = this.term();
    while (this.peek()?.t === "op" && (this.peek() as any).v !== "*" && (this.peek() as any).v !== "/") {
      const op = (this.eat() as any).v as "+" | "-";
      const rhs = this.term();
      lhs = { kind: "bin", op, lhs, rhs };
    }
    return lhs;
  }

  private term(): Ast {
    let lhs = this.factor();
    while (this.peek()?.t === "op" && ((this.peek() as any).v === "*" || (this.peek() as any).v === "/")) {
      const op = (this.eat() as any).v as "*" | "/";
      const rhs = this.factor();
      lhs = { kind: "bin", op, lhs, rhs };
    }
    return lhs;
  }

  private factor(): Ast {
    const tok = this.peek();
    if (!tok) throw new Error("Unexpected end of expression");
    if (tok.t === "op" && tok.v === "-") { this.eat(); return { kind: "neg", arg: this.factor() }; }
    if (tok.t === "op" && tok.v === "+") { this.eat(); return this.factor(); }
    if (tok.t === "num") { this.eat(); return { kind: "num", value: tok.v }; }
    if (tok.t === "lp") {
      this.eat();
      const inner = this.expr();
      this.expect("rp");
      return inner;
    }
    if (tok.t === "id") {
      this.eat();
      const name = tok.v;
      if (this.peek()?.t === "lp") {
        this.eat();
        const args: Ast[] = [];
        if (this.peek()?.t !== "rp") {
          args.push(this.expr());
          while (this.peek()?.t === "comma") { this.eat(); args.push(this.expr()); }
        }
        this.expect("rp");
        return { kind: "call", name: name.toLowerCase(), args };
      }
      return { kind: "var", name: name.toUpperCase() };
    }
    throw new Error(`Unexpected token ${tok.t}`);
  }
}

const FUNCS: Record<string, (...args: number[]) => number> = {
  abs: Math.abs,
  min: Math.min,
  max: Math.max,
  pow: Math.pow,
  sum: (...xs) => xs.reduce((a, b) => a + b, 0),
  avg: (...xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN),
};

function evalAst(ast: Ast, env: Record<string, number>): number {
  switch (ast.kind) {
    case "num": return ast.value;
    case "var": {
      const v = env[ast.name];
      if (v === undefined) throw new Error(`Unknown variable '${ast.name}'`);
      return v;
    }
    case "neg": return -evalAst(ast.arg, env);
    case "bin": {
      const l = evalAst(ast.lhs, env);
      const r = evalAst(ast.rhs, env);
      switch (ast.op) {
        case "+": return l + r;
        case "-": return l - r;
        case "*": return l * r;
        case "/": return r === 0 ? NaN : l / r;
      }
      return NaN;
    }
    case "call": {
      const fn = FUNCS[ast.name];
      if (!fn) throw new Error(`Unknown function '${ast.name}'`);
      return fn(...ast.args.map((a) => evalAst(a, env)));
    }
  }
}

export function compileFormula(src: string): { eval: (env: Record<string, number>) => number; vars: string[] } {
  const ast = new Parser(tokenize(src)).parse();
  const vars = new Set<string>();
  const collect = (n: Ast) => {
    if (n.kind === "var") vars.add(n.name);
    else if (n.kind === "neg") collect(n.arg);
    else if (n.kind === "bin") { collect(n.lhs); collect(n.rhs); }
    else if (n.kind === "call") n.args.forEach(collect);
  };
  collect(ast);
  return {
    eval: (env) => evalAst(ast, env),
    vars: [...vars].sort(),
  };
}

export type Series = Array<[number | string, number]>;

/**
 * Apply a compiled formula to a set of named series, aligning them on the
 * union of timestamps. For each timestamp, the most recent observed value
 * for each series (forward-fill) is used. If any required variable has no
 * observed value yet at a given timestamp, the result for that point is
 * skipped.
 */
export function applyFormula(
  compiled: { eval: (env: Record<string, number>) => number; vars: string[] },
  layers: Record<string, Series>,
): Series {
  const required = compiled.vars;
  if (!required.length) return [];

  const tsSet = new Set<number>();
  for (const v of required) {
    const s = layers[v];
    if (!s) continue;
    for (const p of s) tsSet.add(typeof p[0] === "number" ? p[0] : new Date(p[0]).getTime());
  }
  const timestamps = [...tsSet].sort((a, b) => a - b);
  if (!timestamps.length) return [];

  const cursors: Record<string, number> = {};
  const lastValue: Record<string, number | undefined> = {};
  for (const v of required) cursors[v] = 0;

  const out: Series = [];
  for (const ts of timestamps) {
    let ok = true;
    const env: Record<string, number> = {};
    for (const v of required) {
      const s = layers[v];
      if (!s || !s.length) { ok = false; break; }
      let i = cursors[v];
      while (i < s.length) {
        const pt = s[i];
        const ptTs = typeof pt[0] === "number" ? pt[0] : new Date(pt[0]).getTime();
        if (ptTs > ts) break;
        lastValue[v] = pt[1];
        i++;
      }
      cursors[v] = i;
      const lv = lastValue[v];
      if (lv === undefined || !Number.isFinite(lv)) { ok = false; break; }
      env[v] = lv;
    }
    if (!ok) continue;
    let val: number;
    try { val = compiled.eval(env); } catch { continue; }
    if (!Number.isFinite(val)) continue;
    out.push([ts, val]);
  }
  return out;
}
