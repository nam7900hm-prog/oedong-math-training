"use client";
import {useId,useRef,useState} from "react";
import "./math-input.css";
import {useMathKeyboard} from "./math-keyboard";

type Props={value:string;onChange:(value:string)=>void;label?:string;compact?:boolean;unit?:string;coachText?:string;coachTranslation?:string;successText?:string;successTranslation?:string;purpose?:string;preferredTab?:string};

export function MathInput({value,onChange,label="답을 입력하세요",unit,coachText,coachTranslation,successText,successTranslation,purpose,preferredTab}:Props){
  const ref=useRef<HTMLInputElement>(null),id=useId();
  const keyboard=useMathKeyboard();
  const [coachOpen,setCoachOpen]=useState(false);
  const target=()=>({id,value,onChange,inputRef:ref,purpose:purpose??label,preferredTab});
  const coach=coachText??(value.includes("□")?"식의 빈칸이 남아 있어요. 네모 칸을 앞에서부터 하나씩 채워 보세요.":value.trim()?"좋아요. 이제 부호, 괄호, 단위를 한 번만 천천히 확인해 보세요.":"괜찮아. 어디서 시작할지만 함께 찾아보자. 문제에서 구하는 값과 주어진 수를 먼저 찾아보세요.");
  return <div className={`mathInput ${keyboard.isActive(id)?"active":""}`}>
    <div className="mathEntry"><label><span>{label}</span><input ref={ref} value={value} onFocus={()=>keyboard.activate(target())} onClick={()=>keyboard.activate(target())} onChange={event=>{onChange(event.target.value);keyboard.activate({...target(),value:event.target.value})}} aria-label={label} placeholder="키보드로 입력하거나 수식판을 여세요"/></label>{unit&&<span className="fixedUnit">{unit}</span>}<button type="button" className="keypadToggle" onClick={()=>keyboard.activate(target(),true)} aria-expanded={keyboard.isOpen&&keyboard.isActive(id)}>＋ 수식판 열기</button></div>
    {successText?<div className="mathSuccess" role="status"><b>{successText}</b>{successTranslation&&<small>{successTranslation}</small>}</div>:<div className="mathCoach"><button type="button" onClick={()=>setCoachOpen(current=>!current)} aria-expanded={coachOpen}><span>💡</span><b>풀이 실마리</b><small>{coachOpen?"접기":"막막하면 보기 · 감점 없음"}</small></button>{coachOpen&&<div><b>선생님의 풀이 실마리</b><p>{coach}</p>{coachTranslation&&<p className="coachTranslation">{coachTranslation}</p>}</div>}</div>}
  </div>;
}
