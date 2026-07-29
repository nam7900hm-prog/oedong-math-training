import assert from "node:assert/strict";
import test from "node:test";
import { applyAttemptResult, judgeMathAnswer, normalizeMath, type JudgeRules, type JudgeStatus } from "../app/math-engine.ts";

type Case={name:string;student:string;expected:string;status:JudgeStatus;rules?:Partial<JudgeRules>};
const cases:Case[]=[
 {name:"정수 앞의 +",student:"+02",expected:"2",status:"correct"},
 {name:"소수와 분수",student:"0.5",expected:"1/2",status:"correct"},
 {name:"동치 분수",student:"2/4",expected:"1/2",status:"correct",rules:{kind:"fraction"}},
 {name:"기약분수 형식",student:"2/4",expected:"1/2",status:"equivalent-format",rules:{kind:"reduced-fraction"}},
 {name:"동치 근호",student:"√8",expected:"2*√2",status:"correct"},
 {name:"간단한 근호 형식",student:"√8",expected:"2*√2",status:"equivalent-format",rules:{kind:"simple-radical"}},
 {name:"거듭제곱 값",student:"32",expected:"2^5",status:"correct"},
 {name:"거듭제곱 형식",student:"32",expected:"2^5",status:"equivalent-format",rules:{kind:"power"}},
 {name:"좌표 일치",student:"(1,2)",expected:"(1,2)",status:"correct",rules:{kind:"coordinate"}},
 {name:"좌표 순서 오류",student:"(2,1)",expected:"(1,2)",status:"incorrect",rules:{kind:"coordinate"}},
 {name:"좌표 쉼표 누락",student:"(1 2)",expected:"(1,2)",status:"format-error",rules:{kind:"coordinate"}},
 {name:"좌표 음수",student:"(-1, 2)",expected:"(-1,2)",status:"correct",rules:{kind:"coordinate"}},
 {name:"여러 좌표 순서 무관",student:"(3,4);(1,2)",expected:"(1,2);(3,4)",status:"correct",rules:{kind:"coordinate",orderMatters:false}},
 {name:"여러 좌표 순서 중요",student:"(3,4);(1,2)",expected:"(1,2);(3,4)",status:"incorrect",rules:{kind:"coordinate",orderMatters:true}},
 {name:"연립 해 변수 순서 무관",student:"y=2,x=1",expected:"x=1,y=2",status:"correct",rules:{kind:"system"}},
 {name:"연립 값 교환 오답",student:"x=2,y=1",expected:"x=1,y=2",status:"incorrect",rules:{kind:"system"}},
 {name:"연립 해 일부 누락",student:"x=1",expected:"x=1,y=2",status:"incorrect",rules:{kind:"system"}},
 {name:"연립 변수 이름 오류",student:"a=1,y=2",expected:"x=1,y=2",status:"incorrect",rules:{kind:"system"}},
 {name:"연립 변수 중복",student:"x=1,x=2",expected:"x=1,y=2",status:"format-error",rules:{kind:"system"}},
 {name:"복수 해 순서 무관",student:"x=3,2",expected:"x=2,3",status:"correct",rules:{kind:"equation-roots"}},
 {name:"플러스마이너스 해",student:"x=±2",expected:"x=-2,2",status:"correct",rules:{kind:"equation-roots"}},
 {name:"복수 해 누락",student:"x=2",expected:"x=2,3",status:"incorrect",rules:{kind:"equation-roots"}},
 {name:"불필요한 해 추가",student:"x=2,3,4",expected:"x=2,3",status:"incorrect",rules:{kind:"equation-roots"}},
 {name:"해 중복",student:"x=2,2,3",expected:"x=2,3",status:"equivalent-format",rules:{kind:"equation-roots"}},
 {name:"복수 해 순서 중요",student:"x=3,2",expected:"x=2,3",status:"incorrect",rules:{kind:"equation-roots",orderMatters:true}},
 {name:"부등식 방향 동치",student:"2<x",expected:"x>2",status:"correct",rules:{kind:"inequality"}},
 {name:"부등호 경계 구분",student:"x>=2",expected:"x>2",status:"incorrect",rules:{kind:"inequality"}},
 {name:"부등호 한글 기호",student:"x≤2",expected:"x<=2",status:"correct",rules:{kind:"inequality"}},
 {name:"부등식 변수 누락",student:">2",expected:"x>2",status:"format-error",rules:{kind:"inequality"}},
 {name:"열린 구간",student:"(1,2)",expected:"(1,2)",status:"correct",rules:{kind:"interval"}},
 {name:"열림 닫힘 구분",student:"[1,2)",expected:"(1,2)",status:"incorrect",rules:{kind:"interval"}},
 {name:"닫힌 구간",student:"[1,2]",expected:"[1,2]",status:"correct",rules:{kind:"interval"}},
 {name:"합집합 구간",student:"(-∞,0)∪[2,∞)",expected:"(-∞,0)∪[2,∞)",status:"correct",rules:{kind:"interval"}},
 {name:"합집합 구간 누락",student:"(-∞,0)",expected:"(-∞,0)∪[2,∞)",status:"incorrect",rules:{kind:"interval"}},
 {name:"무한대 구간",student:"(2,∞)",expected:"(2,∞)",status:"correct",rules:{kind:"interval"}},
 {name:"제곱센티미터 기호",student:"150 ㎠",expected:"150 cm²",status:"correct",rules:{kind:"unit",unit:"required"}},
 {name:"길이와 넓이 단위 구분",student:"150cm",expected:"150cm²",status:"incorrect",rules:{kind:"unit",unit:"required"}},
 {name:"단위 누락은 표현 수정",student:"150",expected:"150cm²",status:"equivalent-format",rules:{kind:"unit",unit:"required"}},
 {name:"값 오답 단위 정답",student:"151cm²",expected:"150cm²",status:"incorrect",rules:{kind:"unit",unit:"required"}},
 {name:"분모 0",student:"1/0",expected:"1",status:"format-error"},
 {name:"빈 분자",student:"/2",expected:"1/2",status:"format-error"},
 {name:"빈 분모",student:"1/",expected:"1/2",status:"format-error"},
 {name:"빈 지수",student:"2^",expected:"4",status:"format-error"},
 {name:"빈 근호",student:"√()",expected:"2",status:"format-error"},
 {name:"닫히지 않은 괄호",student:"(1+2",expected:"3",status:"format-error"},
 {name:"너무 긴 수식",student:"1".repeat(501),expected:"1",status:"format-error"},
 {name:"큰 지수",student:"2^10001",expected:"2",status:"format-error"},
 {name:"깊은 중첩",student:"(".repeat(21)+"1"+")".repeat(21),expected:"1",status:"format-error"},
 {name:"허용하지 않는 문자",student:"2@3",expected:"6",status:"format-error"},
 {name:"빈 답",student:"",expected:"2",status:"format-error"},
 {name:"허용 오차 안",student:"0.333",expected:"1/3",status:"correct",rules:{kind:"decimal",tolerance:.001}},
 {name:"허용 오차 밖",student:"0.33",expected:"1/3",status:"incorrect",rules:{kind:"decimal",tolerance:.001}},
 {name:"번호 표현",student:"2번째",expected:"2",status:"correct",rules:{kind:"order"}},
 {name:"금지 답안",student:"2",expected:"2",status:"incorrect",rules:{blocked:["2"]}},
 {name:"괄호 음수",student:"(-2)",expected:"-2",status:"correct"},
];

test("2차 자동 판정 독립 사례가 50개 이상이다",()=>assert.ok(cases.length>=50));
for(const item of cases)test(item.name,()=>assert.equal(judgeMathAnswer(item.student,item.expected,item.rules).status,item.status));
test("연속 1,000회 제출에도 안정적이다",()=>{for(let i=0;i<1000;i++)assert.equal(judgeMathAnswer(i%2?"1/2":"0.5","0.5").status,"correct")});
test("기호 표준화",()=>assert.equal(normalizeMath("2×3² + √8"),"2*3^2+sqrt(8)"));
test("표현 수정은 오답과 하트를 바꾸지 않는다",()=>assert.deepEqual(applyAttemptResult({submissions:0,wrongAnswers:0,formatCorrections:0,hearts:3},"equivalent-format"),{submissions:1,wrongAnswers:0,formatCorrections:1,hearts:3}));
test("입력 형식 오류는 오답과 하트를 바꾸지 않는다",()=>assert.deepEqual(applyAttemptResult({submissions:0,wrongAnswers:0,formatCorrections:0,hearts:3},"format-error"),{submissions:1,wrongAnswers:0,formatCorrections:1,hearts:3}));
test("실제 오답만 오답 횟수와 하트를 바꾼다",()=>assert.deepEqual(applyAttemptResult({submissions:0,wrongAnswers:0,formatCorrections:0,hearts:3},"incorrect"),{submissions:1,wrongAnswers:1,formatCorrections:0,hearts:2}));
