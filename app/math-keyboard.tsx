"use client";
import {createContext,useContext,useEffect,useRef,useState,type ReactNode,type RefObject} from "react";
import "./math-keyboard.css";

export type KeyboardTarget={id:string;value:string;onChange:(value:string)=>void;inputRef:RefObject<HTMLInputElement|null>;purpose?:string;preferredTab?:string};
type KeyboardApi={activate:(target:KeyboardTarget,open?:boolean)=>void;close:()=>void;isActive:(id:string)=>boolean;isOpen:boolean};
const KeyboardContext=createContext<KeyboardApi|null>(null);
const tabs={
  "기본":[".","+","−","×","÷","=","(",")",",","%","±"],
  "분수·수식":["분수","대분수","근호","계수근호","x²","xⁿ","아래첨자","절댓값","π","∞"],
  "문자·관계":["x","y","z","a","b","≠","<",">","≤","≥"],
  "도형·집합":["△","∠","⊥","∥","≡","∼","°","㎠","㎥","∈","∉","∩","∪","{","}"],
  "고등부":["sin(","cos(","tan(","log(","ln(","Σ","lim","dy/dx","f'(x)","√","i","e","nCr","nPr","!"]
};
const template=(key:string)=>({"분수":"(□)/(□)","대분수":"□ (□)/(□)","근호":"√(□)","계수근호":"□√(□)","x²":"□²","xⁿ":"□^(□)","아래첨자":"□_(□)","절댓값":"|□|"}[key]??key);
const keyFace=(key:string)=>({"분수":"□/□","대분수":"□ □/□","근호":"√□","계수근호":"□√□","xⁿ":"xⁿ","아래첨자":"aₙ","절댓값":"|x|"}[key]??key);

export function MathKeyboardProvider({children}:{children:ReactNode}){
  const [active,setActive]=useState<KeyboardTarget|null>(null),[open,setOpen]=useState(false),[tab,setTab]=useState("기본"),[history,setHistory]=useState<Record<string,string[]>>({}),[future,setFuture]=useState<Record<string,string[]>>({});
  const activeRef=useRef(active);
  useEffect(()=>{activeRef.current=active},[active]);
  const keepInputVisible=(target:KeyboardTarget)=>requestAnimationFrame(()=>requestAnimationFrame(()=>target.inputRef.current?.scrollIntoView({block:"center",behavior:"smooth"})));
  const close=()=>{setOpen(false);requestAnimationFrame(()=>activeRef.current?.inputRef.current?.focus())};
  useEffect(()=>{const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape"&&open){event.preventDefault();close()}};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[open]);
  const activate=(target:KeyboardTarget,shouldOpen=false)=>{setActive(target);if(target.preferredTab&&tabs[target.preferredTab as keyof typeof tabs])setTab(target.preferredTab);if(shouldOpen){setOpen(true);keepInputVisible(target)}};
  const change=(next:string,remember=true)=>{if(!active)return;if(remember)setHistory(items=>({...items,[active.id]:[...(items[active.id]??[]).slice(-19),active.value]}));setFuture(items=>({...items,[active.id]:[]}));active.onChange(next);setActive({...active,value:next})};
  const put=(key:string)=>{if(!active)return;const input=active.inputRef.current,start=input?.selectionStart??active.value.length,end=input?.selectionEnd??active.value.length,inserted=template(key),next=active.value.slice(0,start)+inserted+active.value.slice(end);change(next);requestAnimationFrame(()=>{input?.focus();const blank=inserted.indexOf("□"),position=start+(blank<0?inserted.length:blank);input?.setSelectionRange(position,position+(blank<0?0:1))})};
  const undo=()=>{if(!active)return;const stack=history[active.id]??[],previous=stack.at(-1);if(previous===undefined)return;setFuture(items=>({...items,[active.id]:[active.value,...(items[active.id]??[])]}));setHistory(items=>({...items,[active.id]:stack.slice(0,-1)}));active.onChange(previous);setActive({...active,value:previous})};
  const redo=()=>{if(!active)return;const stack=future[active.id]??[],next=stack[0];if(next===undefined)return;setHistory(items=>({...items,[active.id]:[...(items[active.id]??[]),active.value]}));setFuture(items=>({...items,[active.id]:stack.slice(1)}));active.onChange(next);setActive({...active,value:next})};
  return <KeyboardContext.Provider value={{activate,close,isActive:id=>active?.id===id,isOpen:open}}>{children}<aside className={`globalMathKeyboard ${open?"open":""}`} aria-hidden={!open} aria-label="공용 수식판"><div className="keyboardGrip"/><header><div><b>공용 수식판</b><small>{active?.purpose??"활성 답안칸에 입력합니다"}</small></div><button type="button" onClick={close} aria-label="수식판 닫기">수식판 닫기 ↓</button></header><nav>{Object.keys(tabs).map(name=><button type="button" className={tab===name?"active":""} onClick={()=>setTab(name)} key={name}>{name}</button>)}</nav><div className="globalMathKeys">{tabs[tab as keyof typeof tabs].map(key=><button type="button" key={key} onClick={()=>put(key)} aria-label={`${key} 입력`}>{keyFace(key)}</button>)}</div><footer><button type="button" onClick={()=>{if(!active)return;const input=active.inputRef.current,start=input?.selectionStart??active.value.length,end=input?.selectionEnd??start;if(start>0)change(active.value.slice(0,start-1)+active.value.slice(end))}}>한 글자 지우기</button><button type="button" onClick={()=>change("")}>전체 지우기</button><button type="button" disabled={!active||(history[active.id]?.length??0)===0} onClick={undo}>↶ 실행 취소</button><button type="button" disabled={!active||(future[active.id]?.length??0)===0} onClick={redo}>↷ 다시 실행</button></footer></aside></KeyboardContext.Provider>;
}
export function useMathKeyboard(){const value=useContext(KeyboardContext);if(!value)throw new Error("MathKeyboardProvider가 필요합니다");return value}
