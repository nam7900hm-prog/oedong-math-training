export type AnswerKind =
  | "integer" | "decimal" | "fraction" | "reduced-fraction" | "radical"
  | "simple-radical" | "power" | "expression" | "equation-roots"
  | "coordinate" | "system" | "inequality" | "interval" | "order" | "set" | "unit" | "text";

export type JudgeRules = {
  kind: AnswerKind;
  equivalent: boolean;
  reducedRequired: boolean;
  simpleRadicalRequired: boolean;
  powerRequired: boolean;
  orderMatters: boolean;
  unit: "required" | "optional" | "separate" | "auto";
  tolerance: number;
  alternate: string[];
  blocked: string[];
};

export type JudgeStatus = "correct" | "equivalent-format" | "format-error" | "incorrect";
export type JudgeResult = { status: JudgeStatus; message: string; original: string; normalized: string; expectedNormalized: string };
export type AttemptStats={submissions:number;wrongAnswers:number;formatCorrections:number;hearts:number};
export function applyAttemptResult(stats:AttemptStats,status:JudgeStatus):AttemptStats{
  if(status==="incorrect")return {...stats,submissions:stats.submissions+1,wrongAnswers:stats.wrongAnswers+1,hearts:Math.max(0,stats.hearts-1)};
  if(status==="format-error"||status==="equivalent-format")return {...stats,submissions:stats.submissions+1,formatCorrections:stats.formatCorrections+1};
  return {...stats,submissions:stats.submissions+1};
}

export const defaultJudgeRules: JudgeRules = {
  kind: "expression", equivalent: true, reducedRequired: false,
  simpleRadicalRequired: false, powerRequired: false, orderMatters: false,
  unit: "optional", tolerance: 0, alternate: [], blocked: [],
};

const SUPER: Record<string, string> = { "⁰":"0", "¹":"1", "²":"2", "³":"3", "⁴":"4", "⁵":"5", "⁶":"6", "⁷":"7", "⁸":"8", "⁹":"9" };
const UNIT_PATTERN = /(mm|cm|km|m|g|kg|L|mL|초|분|시간|도|%)(?:\^?[23]|[²³])?$/;

export function normalizeMath(input: string) {
  return input.trim()
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, value => `^${[...value].map(char => SUPER[char]).join("")}`)
    .replace(/㎠/g,"cm^2").replace(/㎤/g,"cm^3").replace(/[×·]/g, "*").replace(/÷/g, "/").replace(/[−–—]/g, "-")
    .replace(/π/g, "pi").replace(/√\s*\(?\s*([^() +\-*/]+)\s*\)?/g, "sqrt($1)")
    .replace(/\s+/g, "").replace(/^\+/, "").replace(/^(-?)0+(?=\d)/, "$1");
}

function gcd(a: number, b: number): number { return b ? gcd(b, a % b) : Math.abs(a); }
function unitOf(value: string) { return normalizeMath(value).match(UNIT_PATTERN)?.[0] ?? ""; }
function withoutUnit(value: string) { const normalized=normalizeMath(value),unit=unitOf(value); return unit ? normalized.slice(0, -unit.length) : normalized; }

function safeNumber(value: string): number | null {
  const source = normalizeMath(value).replace(/pi/g, String(Math.PI));
  let index = 0;
  const peek = () => source[index];
  const eat = () => source[index++];
  const primary = (): number => {
    if (source.startsWith("sqrt(", index)) { index += 5; const n = expression(); if (eat() !== ")" || n < 0) throw Error(); return Math.sqrt(n); }
    if (peek() === "(") { eat(); const n = expression(); if (eat() !== ")") throw Error(); return n; }
    let token = ""; while (/[\d.]/.test(peek() ?? "")) token += eat();
    if (!token || (token.match(/\./g)?.length ?? 0) > 1) throw Error();
    return Number(token);
  };
  const unary = (): number => peek() === "+" ? (eat(), unary()) : peek() === "-" ? (eat(), -unary()) : primary();
  const power = (): number => { const left = unary(); return peek() === "^" ? (eat(), Math.pow(left, power())) : left; };
  const term = (): number => { let n = power(); while (peek() === "*" || peek() === "/") { const op = eat(), right = power(); if (op === "/" && right === 0) throw Error(); n = op === "*" ? n * right : n / right; } return n; };
  const expression = (): number => { let n = term(); while (peek() === "+" || peek() === "-") { const op = eat(), right = term(); n = op === "+" ? n + right : n - right; } return n; };
  try { const n = expression(); return index === source.length && Number.isFinite(n) ? n : null; } catch { return null; }
}

function fractionIsReduced(value: string) {
  const match = normalizeMath(value).match(/^(-?\d+)\/(\d+)$/);
  return !match || gcd(Number(match[1]), Number(match[2])) === 1;
}

function radicalIsSimple(value: string) {
  const matches = [...normalizeMath(value).matchAll(/sqrt\((\d+)\)/g)];
  return matches.every(match => { const n = Number(match[1]); for (let i = 2; i * i <= n; i++) if (n % (i * i) === 0) return false; return true; });
}

function listValues(value: string) {
  return normalizeMath(value).replace(/^(x=)?/, "").replace(/[{}]/g, "").replace(/또는/g, ",").split(",").filter(Boolean);
}

function invalidInput(value:string,kind:AnswerKind):string|undefined {
  if(value.length>500)return "수식이 너무 깁니다. 500자 이내로 입력해 주세요.";
  if(kind!=="interval"){let depth=0,maxDepth=0;for(const c of value){if(c==="("){depth++;maxDepth=Math.max(maxDepth,depth)}else if(c===")")depth--;if(depth<0)return "괄호가 올바르게 닫혔는지 확인해 주세요."}if(depth!==0)return "괄호가 닫혔는지 확인해 주세요.";if(maxDepth>20)return "수식의 중첩이 너무 깊습니다. 20단계 이내로 입력해 주세요.";}
  if(/\^-?\d{5,}/.test(normalizeMath(value)))return "지수가 너무 큽니다.";
  if(/[□▢]/.test(value)||/\/\s*(?:\)|,|$)/.test(value)||/(?:^|[(,])\s*\//.test(value)||/\^\s*(?:\)|,|$)/.test(value)||/√\s*(?:\(\s*\))?(?:$|[,;)])/.test(value))return "수식의 빈칸을 모두 채워 주세요.";
  if(/[^<>≤≥≠{}=,;|∪∞±√π㎠㎤²³\w\s.+\-*/^()\[\]가-힣]/u.test(value))return "사용할 수 없는 문자가 포함되어 있어요.";
}

function coordinateValues(value:string):string[]|null {
  const compact=normalizeMath(value);const matches=[...compact.matchAll(/\((-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)\)/g)];
  if(!matches.length||matches.map(x=>x[0]).join("")!==compact.replace(/[;|]/g,""))return null;
  return matches.map(x=>`${Number(x[1])},${Number(x[2])}`);
}
function assignments(value:string):Map<string,string>|null {
  const parts=normalizeMath(value).split(",").filter(Boolean), map=new Map<string,string>();if(!parts.length)return null;
  for(const part of parts){const m=part.match(/^([a-zA-Z])=(-?\d+(?:\.\d+)?)$/);if(!m||map.has(m[1]))return null;map.set(m[1],String(Number(m[2])))}return map;
}
function roots(value:string):{values:string[];duplicate:boolean}|null {
  let compact=normalizeMath(value).replace(/^x=/,"").replace(/[{}]/g,"");
  if(/^±\d+(?:\.\d+)?$/.test(compact)){const n=compact.slice(1);compact=`-${n},${n}`}
  const values=compact.split(",").filter(Boolean);if(!values.length||values.some(x=>!/^[-+]?\d+(?:\.\d+)?$/.test(x)))return null;
  const normalized=values.map(x=>String(Number(x)));return {values:normalized,duplicate:new Set(normalized).size!==normalized.length};
}
function inequalityValue(value:string):string|null {
  const s=normalizeMath(value).replace(/≤/g,"<=").replace(/≥/g,">=");let m=s.match(/^x(<=|>=|<|>)(-?\d+(?:\.\d+)?)$/);if(m)return `x${m[1]}${Number(m[2])}`;
  m=s.match(/^(-?\d+(?:\.\d+)?)(<=|>=|<|>)x$/);if(!m)return null;const flip:Record<string,string>={"<":">",">":"<","<=":">=",">=":"<="};return `x${flip[m[2]]}${Number(m[1])}`;
}
function intervalValue(value:string):string|null {
  const s=normalizeMath(value).replace(/∪/g,"U").replace(/∞/g,"inf");const parts=s.split("U");
  if(parts.some(x=>!/^[(\[]-?(?:\d+(?:\.\d+)?|inf),-?(?:\d+(?:\.\d+)?|inf)[)\]]$/.test(x)))return null;return parts.join("U");
}

export function judgeMathAnswer(student: string, expected: string, rules: Partial<JudgeRules> = {}): JudgeResult {
  const rule = { ...defaultJudgeRules, ...rules };
  const normalized = normalizeMath(student), expectedNormalized = normalizeMath(expected);
  const result = (status: JudgeStatus, message: string): JudgeResult => ({ status, message, original: student, normalized, expectedNormalized });
  if (!student.trim()) return result("format-error", "답안이 비어 있어요.");
  const invalid=invalidInput(student,rule.kind);if(invalid)return result("format-error",invalid);
  if (/\/0(?:\D|$)/.test(normalized)) return result("format-error", "분모는 0일 수 없어요.");
  if (rule.blocked.some(value => normalizeMath(value) === normalized)) return result("incorrect", "교사가 인정하지 않도록 설정한 표현입니다.");
  const studentUnit = unitOf(student);
  if (rule.unit === "required" && !studentUnit) {
    const actual=safeNumber(student),target=safeNumber(withoutUnit(expected));
    return result(actual!==null&&target!==null&&Math.abs(actual-target)<=Math.max(rule.tolerance,1e-10)?"equivalent-format":"incorrect",actual!==null&&target!==null&&Math.abs(actual-target)<=Math.max(rule.tolerance,1e-10)?"값은 맞지만 단위를 입력해야 해요.":"값이나 식을 다시 확인해 보세요.");
  }
  if(rule.unit==="required"&&studentUnit&&unitOf(expected)&&studentUnit!==unitOf(expected))return result("incorrect","값은 같아도 단위의 종류나 차원이 달라요.");

  const candidates = [expected, ...rule.alternate];
  let equal = candidates.some(value => normalizeMath(value) === normalized);
  if(rule.kind==="coordinate"){
    const actual=coordinateValues(student);if(!actual)return result("format-error","좌표는 (x,y)처럼 쉼표를 넣어 입력해 주세요.");
    equal=candidates.some(value=>{const target=coordinateValues(value);if(!target)return false;const a=rule.orderMatters?actual:[...actual].sort(),b=rule.orderMatters?target:[...target].sort();return JSON.stringify(a)===JSON.stringify(b)});
  }
  if(rule.kind==="system"){
    const actual=assignments(student);if(!actual)return result("format-error","각 변수는 한 번씩 x=1,y=2처럼 입력해 주세요.");
    equal=candidates.some(value=>{const target=assignments(value);return target!==null&&actual.size===target.size&&[...actual].every(([k,v])=>target.get(k)===v)});
  }
  if(rule.kind==="equation-roots"){
    const actual=roots(student);if(!actual)return result("format-error","해를 쉼표로 구분해 입력해 주세요.");if(actual.duplicate)return result("equivalent-format","같은 해가 중복되어 있어요. 한 번만 입력해 주세요.");
    equal=candidates.some(value=>{const target=roots(value);if(!target)return false;const a=rule.orderMatters?actual.values:[...actual.values].sort(),b=rule.orderMatters?target.values:[...target.values].sort();return JSON.stringify(a)===JSON.stringify(b)});
  }
  if(rule.kind==="inequality"){
    const actual=inequalityValue(student);if(!actual)return result("format-error","부등식의 변수·부등호·경계를 확인해 주세요.");equal=candidates.some(value=>inequalityValue(value)===actual);
  }
  if(rule.kind==="interval"){
    const actual=intervalValue(student);if(!actual)return result("format-error","구간은 (a,b), [a,b]처럼 입력해 주세요.");equal=candidates.some(value=>intervalValue(value)===actual);
  }
  if (!equal && rule.kind === "order") {
    const order = student.trim().match(/^(\d+)\s*(번|번째|째)$/);
    equal = Boolean(order && candidates.some(value => Number(value.match(/\d+/)?.[0]) === Number(order[1])));
  }
  if (!equal && rule.kind === "set" && !rule.orderMatters) {
    equal = candidates.some(value => JSON.stringify(listValues(student).sort()) === JSON.stringify(listValues(value).sort()));
  }
  if (!equal && rule.equivalent) {
    const actual = safeNumber(withoutUnit(student));
    equal = candidates.some(value => { const target = safeNumber(withoutUnit(value)); return actual !== null && target !== null && Math.abs(actual - target) <= Math.max(rule.tolerance, 1e-10); });
  }
  if (!equal) return result("incorrect", "값이나 식을 다시 확인해 보세요.");
  if ((rule.kind === "reduced-fraction" || rule.reducedRequired) && !fractionIsReduced(student)) return result("equivalent-format", "값은 맞아요. 분자와 분모를 더 약분할 수 있는지 확인해 보세요.");
  if ((rule.kind === "simple-radical" || rule.simpleRadicalRequired) && !radicalIsSimple(student)) return result("equivalent-format", "값은 같아요. 근호 안의 제곱수를 밖으로 꺼내 보세요.");
  if ((rule.kind === "power" || rule.powerRequired) && !/[\^⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(student)) return result("equivalent-format", "값은 맞지만 거듭제곱 꼴로 나타내야 해요.");
  return result("correct", "정답이에요!");
}
