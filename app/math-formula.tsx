import katex from "katex";

type FormulaProps={latex:string;display?:boolean;label?:string};

export function MathFormula({latex,display=false,label}:FormulaProps){
  let html="";
  try{html=katex.renderToString(latex,{displayMode:display,throwOnError:false,trust:false,output:"htmlAndMathml",strict:"warn"})}catch{return <span className="mathFormulaFallback">{latex}</span>}
  return <span className={display?"mathFormula blockMath":"mathFormula inlineMath"} aria-label={label} dangerouslySetInnerHTML={{__html:html}}/>;
}

export function MathText({parts,className=""}:{parts:Array<string|{latex:string;display?:boolean;label?:string}>;className?:string}){
  return <span className={`katexMathText ${className}`.trim()}>{parts.map((part,index)=>typeof part==="string"?<span className="plainMathText" key={index}>{part}</span>:<MathFormula key={index} {...part}/>)}</span>;
}

export const pilotMathParts=(value:string):Array<string|{latex:string;label?:string}>=>{
  const exact:Record<string,Array<string|{latex:string;label?:string}>>={
    "잘못 계산한 전체 과정을 식으로 나타내면?": ["잘못 계산한 전체 과정을 식으로 나타내면?"],
    "x/4": [{latex:"\\frac{x}{4}",label:"x를 4로 나눈 값"}],
    "x/4+7=10": [{latex:"\\frac{x}{4}+7=10",label:"x를 4로 나눈 값에 7을 더하면 10"}],
    "4x-7=10": [{latex:"4x-7=10"}],
    "x/(4+7)=10": [{latex:"\\frac{x}{4+7}=10"}],
    "x/4+7=10에서 x/4의 값은?": [{latex:"\\frac{x}{4}+7=10"},"에서 ",{latex:"\\frac{x}{4}"},"의 값은?"],
    "3/4": [{latex:"\\frac{3}{4}"}],
    "x/4=3에서 원래 어떤 수 x는?": [{latex:"\\frac{x}{4}=3"},"에서 원래 어떤 수 ",{latex:"x"},"는?"],
    "x/4+7": [{latex:"\\frac{x}{4}+7"}],
    "4(x-7)": [{latex:"4(x-7)"}],
    "4x-7": [{latex:"4x-7"}],
  };
  return exact[value]??[value];
};
