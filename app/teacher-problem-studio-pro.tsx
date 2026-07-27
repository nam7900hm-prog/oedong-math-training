"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "./teacher-problem-studio-pro.css";

type Curriculum = Record<string, Record<string, Record<string, string[]>>>;
type PieceDraft = { id:string; tag:string; question:string; answer:string; wrong1:string; wrong2:string; hint:string };
type BankProblem = {
  id:string; checked:boolean; number:string; title:string; source:string; sourceType:"capture"|"pdf";
  image?:string; answer:string; explanation:string; status:"검수 필요"|"보관 완료"|"조각 작업 중"|"탑재 준비";
  term:string; major:string; middle:string; minor:string; pieces:PieceDraft[]; createdAt:number;
};
type PdfItem = { id:string; name:string; size:number; checked:boolean; pages:number; problemCount:number; status:string; url:string };

const BANK_KEY="oedong-problem-bank-pro-v1";
const makeId=()=>`${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const emptyPiece=(index:number):PieceDraft=>({id:makeId(),tag:`${index+1}단계`,question:"이 단계에서 먼저 확인할 것은 무엇일까요?",answer:"",wrong1:"",wrong2:"",hint:"원문 해설의 풀이 순서를 참고하세요."});
const formulaSymbols=["²","³","√","±","×","÷","=","≠","≤","≥","π","∠","△","○","𝑥","𝑦","𝑧","( )","□/□"];

function FormulaAnswer({value,onChange,placeholder="정답을 입력하세요"}:{value:string;onChange:(value:string)=>void;placeholder?:string}){
  const inputRef=useRef<HTMLInputElement>(null);
  const insert=(symbol:string)=>{const input=inputRef.current,start=input?.selectionStart??value.length,end=input?.selectionEnd??value.length;const text=symbol==="□/□"?"(분자)/(분모)":symbol;onChange(value.slice(0,start)+text+value.slice(end));requestAnimationFrame(()=>inputRef.current?.focus())};
  return <div className="formulaAnswer"><input ref={inputRef} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/><div className="formulaPad" aria-label="수학 수식판">{formulaSymbols.map(symbol=><button type="button" key={symbol} onClick={()=>insert(symbol)}>{symbol}</button>)}</div><small>제곱·근호·분수·교과서형 𝑥, 𝑦, 𝑧를 눌러 입력할 수 있습니다.</small></div>;
}

export default function TeacherProblemStudioPro({curriculum}:{curriculum:Curriculum}){
  const pdfInput=useRef<HTMLInputElement>(null);
  const imageInput=useRef<HTMLInputElement>(null);
  const pasteZone=useRef<HTMLDivElement>(null);
  const [mode,setMode]=useState<"register"|"bank"|"pieces">("register");
  const [problems,setProblems]=useState<BankProblem[]>([]);
  const [pdfs,setPdfs]=useState<PdfItem[]>([]);
  const [activePdf,setActivePdf]=useState<string>("");
  const [capture,setCapture]=useState<string>("");
  const [number,setNumber]=useState("1");
  const [answer,setAnswer]=useState("");
  const [explanation,setExplanation]=useState("");
  const [notice,setNotice]=useState("");
  const [materialType,setMaterialType]=useState("문제지 PDF");
  const [activeId,setActiveId]=useState("");
  const [search,setSearch]=useState("");

  useEffect(()=>{try{const saved=localStorage.getItem(BANK_KEY);if(saved)setProblems(JSON.parse(saved))}catch{}},[]);
  const persist=(next:BankProblem[])=>{setProblems(next);try{localStorage.setItem(BANK_KEY,JSON.stringify(next))}catch{setNotice("이미지가 많아 브라우저 저장 한도에 도달했습니다. 완성된 문제를 ZIP으로 백업해 주세요.")}};

  const termOptions=Object.keys(curriculum);
  const firstTerm=termOptions[0]??"중1 · 1학기";
  const firstMajor=Object.keys(curriculum[firstTerm]??{})[0]??"미분류";
  const firstMiddle=Object.keys(curriculum[firstTerm]?.[firstMajor]??{})[0]??"미분류";
  const firstMinor=curriculum[firstTerm]?.[firstMajor]?.[firstMiddle]?.[0]??"미분류";

  const readImage=(file:File)=>{const reader=new FileReader();reader.onload=()=>{setCapture(String(reader.result));setNotice("문제 이미지가 준비되었습니다. 정답과 해설을 확인한 뒤 저장하세요.")};reader.readAsDataURL(file)};
  const onPaste=(event:React.ClipboardEvent)=>{const file=Array.from(event.clipboardData.items).find(item=>item.type.startsWith("image/"))?.getAsFile();if(!file){setNotice("클립보드에 이미지가 없습니다. Shift+Win+S로 캡처한 뒤 Ctrl+V를 눌러 주세요.");return}event.preventDefault();readImage(file)};
  const onPdfFiles=(files:FileList|null)=>{if(!files)return;const next=Array.from(files).map((file,index)=>({id:makeId(),name:file.name,size:file.size,checked:true,pages:0,problemCount:10,status:"자동 자르기 대기",url:URL.createObjectURL(file)}));setPdfs(items=>[...items,...next]);if(next[0])setActivePdf(next[0].id);setNotice(`${next.length}개 PDF를 작업 대기열에 등록했습니다.`)};
  const addCapture=()=>{if(!capture){setNotice("먼저 캡처 이미지를 붙여 넣어 주세요.");return}const target=problems.find(item=>item.id===activeId&&!item.image);if(target){updateProblem(target.id,{image:capture,answer:answer||target.answer,explanation:explanation||target.explanation,status:(answer||target.answer)?"보관 완료":"검수 필요"});setNotice(`${target.title}에 원문 캡처를 연결했습니다.`);setActiveId("")}else{const item:BankProblem={id:makeId(),checked:true,number:number||String(problems.length+1),title:`${number||problems.length+1}번 문제`,source:"화면 캡처",sourceType:"capture",image:capture,answer,explanation,status:answer?"보관 완료":"검수 필요",term:firstTerm,major:firstMajor,middle:firstMiddle,minor:firstMinor,pieces:[],createdAt:Date.now()};persist([item,...problems]);setNotice(`${item.title}를 1차 문제보관함에 저장했습니다.`)}setCapture("");setAnswer("");setExplanation("");setNumber(String(Number(number||0)+1))};
  const createPdfSlots=(pdf:PdfItem)=>{const slots=Array.from({length:Math.max(1,pdf.problemCount)},(_,i):BankProblem=>({id:makeId(),checked:true,number:String(i+1),title:`${i+1}번 문제`,source:pdf.name,sourceType:"pdf",answer:"",explanation:"",status:"검수 필요",term:firstTerm,major:firstMajor,middle:firstMiddle,minor:firstMinor,pieces:[],createdAt:Date.now()}));persist([...slots,...problems]);setPdfs(items=>items.map(x=>x.id===pdf.id?{...x,status:`${slots.length}문항 검수칸 생성`}:x));setMode("bank");setNotice("PDF 원문을 보면서 자동 생성된 문항 칸에 캡처·정답·해설을 붙여 넣으세요.")};
  const updateProblem=(id:string,patch:Partial<BankProblem>)=>persist(problems.map(item=>item.id===id?{...item,...patch}:item));
  const activeProblem=problems.find(item=>item.id===activeId)??problems[0];
  const openPieces=(item:BankProblem)=>{const pieces=item.pieces.length?item.pieces:Array.from({length:6},(_,i)=>emptyPiece(i));updateProblem(item.id,{pieces,status:"조각 작업 중"});setActiveId(item.id);setMode("pieces")};
  const filtered=problems.filter(item=>`${item.title} ${item.source} ${item.answer} ${item.term} ${item.minor}`.toLowerCase().includes(search.toLowerCase()));
  const selectedCount=problems.filter(item=>item.checked).length;

  const renderSelectors=(item:BankProblem)=><div className="proSelectors">
    <label>학년·학기<select value={item.term} onChange={e=>{const term=e.target.value,major=Object.keys(curriculum[term])[0],middle=Object.keys(curriculum[term][major])[0];updateProblem(item.id,{term,major,middle,minor:curriculum[term][major][middle][0]})}}>{termOptions.map(x=><option key={x}>{x}</option>)}</select></label>
    <label>대단원<select value={item.major} onChange={e=>{const major=e.target.value,middle=Object.keys(curriculum[item.term][major])[0];updateProblem(item.id,{major,middle,minor:curriculum[item.term][major][middle][0]})}}>{Object.keys(curriculum[item.term]??{}).map(x=><option key={x}>{x}</option>)}</select></label>
    <label>중단원<select value={item.middle} onChange={e=>updateProblem(item.id,{middle:e.target.value,minor:curriculum[item.term][item.major][e.target.value][0]})}>{Object.keys(curriculum[item.term]?.[item.major]??{}).map(x=><option key={x}>{x}</option>)}</select></label>
    <label>소단원<select value={item.minor} onChange={e=>updateProblem(item.id,{minor:e.target.value})}>{(curriculum[item.term]?.[item.major]?.[item.middle]??[]).map(x=><option key={x}>{x}</option>)}</select></label>
  </div>;

  return <section className="problemStudioPro">
    <header className="proHero"><div><span>교사 문제 제작 센터</span><h1>원문은 그대로, 조각 작업은 더 크게</h1><p>캡처와 PDF를 등록하고 정답·해설을 연결한 뒤 문제보관함에서 조각을 제작하세요.</p></div><div className="proStats"><b>{problems.length}<small>보관 문제</small></b><b>{selectedCount}<small>선택 문제</small></b><b>{problems.filter(x=>x.status==="탑재 준비").length}<small>탑재 준비</small></b></div></header>
    <nav className="proTabs"><button className={mode==="register"?"active":""} onClick={()=>setMode("register")}>1. 문제 등록</button><button className={mode==="bank"?"active":""} onClick={()=>setMode("bank")}>2. 1차 문제보관함</button><button className={mode==="pieces"?"active":""} onClick={()=>setMode("pieces")} disabled={!activeProblem}>3. 큰 조각 작업실</button></nav>
    {notice&&<div className="proNotice">{notice}<button onClick={()=>setNotice("")}>×</button></div>}

    {mode==="register"&&<div className="registerLayout">
      <section className="capturePanel"><div className="panelTitle"><b>캡처 문제 1건 추가</b><span>Shift+Win+S → Ctrl+V</span></div><div ref={pasteZone} tabIndex={0} className={`pasteZone ${capture?"hasImage":""}`} onPaste={onPaste} onClick={()=>pasteZone.current?.focus()}>{capture?<img src={capture} alt="붙여 넣은 문제 캡처"/>:<><strong>여기를 클릭하고 Ctrl+V</strong><p>PDF 자동분류에서 빠진 문제나 도형·그래프를 보완합니다.</p><button type="button" onClick={e=>{e.stopPropagation();imageInput.current?.click()}}>이미지 파일 선택</button></>}<input ref={imageInput} hidden type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&readImage(e.target.files[0])}/></div><div className="captureFields"><label>문제 번호<input value={number} onChange={e=>setNumber(e.target.value)} placeholder="예: 12"/></label><label className="formulaLabel">정답<FormulaAnswer value={answer} onChange={setAnswer} placeholder="예: ③, 𝑥=4, √3"/></label><label className="wide">정답·해설<textarea value={explanation} onChange={e=>setExplanation(e.target.value)} placeholder="해설을 직접 입력하거나 해설 캡처 내용을 기록하세요."/></label></div><div className="captureActions"><button className="secondary" onClick={()=>{setCapture("");setNotice("캡처를 비웠습니다.")}}>다시 캡처</button><button onClick={addCapture}>검수 완료·보관함 저장 →</button></div></section>
      <section className="pdfPanel"><div className="panelTitle"><b>PDF 자동 분류</b><span>문제·정답·해설 자동 연결</span></div><label className="materialType">어떤 자료를 등록하시나요?<select value={materialType} onChange={e=>setMaterialType(e.target.value)}><option>문제지 PDF</option><option>정답·해설지 PDF</option><option>문제와 해설이 함께 있는 PDF</option></select></label><input ref={pdfInput} hidden type="file" accept="application/pdf" multiple onChange={e=>onPdfFiles(e.target.files)}/><button className="pdfDrop" onClick={()=>pdfInput.current?.click()}><strong>＋ {materialType} 선택</strong><span>여러 파일을 한꺼번에 선택할 수 있습니다.</span></button>{pdfs.length?<><div className="pdfQueue">{pdfs.map(pdf=><article key={pdf.id} className={activePdf===pdf.id?"active":""} onClick={()=>setActivePdf(pdf.id)}><input type="checkbox" checked={pdf.checked} onChange={e=>setPdfs(items=>items.map(x=>x.id===pdf.id?{...x,checked:e.target.checked}:x))}/><div><b>{pdf.name}</b><small>{(pdf.size/1024/1024).toFixed(1)}MB · {pdf.status}</small></div></article>)}</div><button className="analyzeAll" onClick={()=>setNotice("PDF 등록이 완료되었습니다. 자동 자르기·정답·해설 연결은 Vercel AI 분석 키와 저장소 연결 후 실행됩니다.")}>AI 자동 분석 시작 →</button></>:<div className="emptyQueue">자료 종류를 선택하고 PDF를 등록하세요.</div>}{activePdf&&pdfs.find(x=>x.id===activePdf)&&<div className="pdfPreview"><iframe title="선택한 PDF 미리보기" src={pdfs.find(x=>x.id===activePdf)!.url}/><p>AI 분석 후 문제별 원문·정답·해설을 연결하여 교사 검수 화면에 표시합니다.</p></div>}</section>
    </div>}

    {mode==="bank"&&<section className="bankPanel"><div className="bankToolbar"><div><b>1차 문제보관함</b><span>조각을 만들기 전 원문·정답·해설을 검수합니다.</span></div><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="문제·파일·단원 검색"/><button onClick={()=>persist(problems.map(x=>({...x,checked:true})))}>전체 선택</button></div>{filtered.length?<div className="bankGrid">{filtered.map(item=><article key={item.id} className="bankCard"><div className="bankCardTop"><label><input type="checkbox" checked={item.checked} onChange={e=>updateProblem(item.id,{checked:e.target.checked})}/><b>{item.title}</b></label><span className={item.status.replaceAll(" ","")}>{item.status}</span></div><div className="bankSource">{item.image?<img src={item.image} alt={`${item.title} 원문`}/>:<div className="pdfPlaceholder"><b>PDF 원문 연결 대기</b><small>{item.source}</small><button onClick={()=>{setActiveId(item.id);setMode("register")}}>캡처 붙이기</button></div>}</div><div className="bankAnswers"><label>정답<FormulaAnswer value={item.answer} onChange={value=>updateProblem(item.id,{answer:value,status:value?"보관 완료":"검수 필요"})}/></label><label>해설<textarea value={item.explanation} onChange={e=>updateProblem(item.id,{explanation:e.target.value})} placeholder="풀이 과정·교사 메모"/></label></div>{renderSelectors(item)}<div className="bankActions"><button className="danger" onClick={()=>{if(confirm("이 문제를 보관함에서 삭제할까요?"))persist(problems.filter(x=>x.id!==item.id))}}>이 문제 삭제</button><button onClick={()=>openPieces(item)}>문제·정답·해설 보며 조각 만들기 →</button></div></article>)}</div>:<div className="bankEmpty"><b>아직 보관된 문제가 없습니다.</b><p>PDF 자동분류 결과를 검수·저장하거나 캡처 문제를 추가하세요.</p><button onClick={()=>setMode("register")}>문제 등록으로 이동</button></div>}</section>}

    {mode==="pieces"&&activeProblem&&<section className="pieceWorkbench"><div className="workbenchTop"><div><button onClick={()=>setMode("bank")}>← 보관함</button><span>{activeProblem.source}</span><h2>{activeProblem.title} 조각 제작</h2></div><div><button className="secondary" onClick={()=>updateProblem(activeProblem.id,{status:"조각 작업 중"})}>임시저장</button><button onClick={()=>updateProblem(activeProblem.id,{status:"탑재 준비"})}>조각 완료·탑재 준비</button></div></div><div className="referenceGrid"><article><span>원문 문제</span>{activeProblem.image?<img src={activeProblem.image} alt="원문 문제"/>:<div className="missingOriginal">PDF에서 문제를 캡처하여 원문 이미지를 연결하세요.</div>}</article><article><span>정답·원문 해설</span><div className="answerBadge">정답 <b>{activeProblem.answer||"미입력"}</b></div><textarea value={activeProblem.explanation} onChange={e=>updateProblem(activeProblem.id,{explanation:e.target.value})} placeholder="정답 해설과 풀이 과정을 기록하세요."/></article></div><div className="piecesEditor"><div className="piecesHead"><div><b>학습 조각 편집</b><span>원문과 해설을 보면서 질문·정답·오답·힌트를 만듭니다.</span></div><button onClick={()=>updateProblem(activeProblem.id,{pieces:[...activeProblem.pieces,emptyPiece(activeProblem.pieces.length)]})}>＋ 조각 추가</button></div>{activeProblem.pieces.map((piece,index)=><article key={piece.id}><span className="pieceNumber">{index+1}</span><div className="pieceFields"><label>조각 이름<input value={piece.tag} onChange={e=>updateProblem(activeProblem.id,{pieces:activeProblem.pieces.map(x=>x.id===piece.id?{...x,tag:e.target.value}:x)})}/></label><label className="wide">질문<input value={piece.question} onChange={e=>updateProblem(activeProblem.id,{pieces:activeProblem.pieces.map(x=>x.id===piece.id?{...x,question:e.target.value}:x)})}/></label><label>정답<input value={piece.answer} onChange={e=>updateProblem(activeProblem.id,{pieces:activeProblem.pieces.map(x=>x.id===piece.id?{...x,answer:e.target.value}:x)})}/></label><label>오답 1<input value={piece.wrong1} onChange={e=>updateProblem(activeProblem.id,{pieces:activeProblem.pieces.map(x=>x.id===piece.id?{...x,wrong1:e.target.value}:x)})}/></label><label>오답 2<input value={piece.wrong2} onChange={e=>updateProblem(activeProblem.id,{pieces:activeProblem.pieces.map(x=>x.id===piece.id?{...x,wrong2:e.target.value}:x)})}/></label><label className="wide">교사 힌트<input value={piece.hint} onChange={e=>updateProblem(activeProblem.id,{pieces:activeProblem.pieces.map(x=>x.id===piece.id?{...x,hint:e.target.value}:x)})}/></label></div><button className="pieceDelete" onClick={()=>updateProblem(activeProblem.id,{pieces:activeProblem.pieces.filter(x=>x.id!==piece.id)})}>삭제</button></article>)}</div><div className="workbenchTarget">{renderSelectors(activeProblem)}<button onClick={()=>{updateProblem(activeProblem.id,{status:"탑재 준비"});setNotice(`${activeProblem.title}가 ${activeProblem.term} · ${activeProblem.minor} 탑재 준비 상태로 저장되었습니다.`)}}>선택한 단원에 탑재 준비</button></div></section>}
  </section>;
}
