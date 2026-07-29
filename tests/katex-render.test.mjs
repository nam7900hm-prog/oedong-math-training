import assert from "node:assert/strict";
import test from "node:test";
import katex from "katex";

const formulas=["\\frac{x}{4}+7=10","\\frac{3}{4}","-\\frac{3}{4}","1\\frac{2}{3}","\\frac{x+1}{2}","\\frac{\\frac{x}{2}+1}{3}","\\sqrt{12}","2\\sqrt{3}","x^2","a_n","|x-3|","x\\leq 4","A\\cap B","\\triangle ABC","10\\text{ cm}^2"];

test("대표 수식 15개를 HTML과 MathML로 안전하게 렌더링한다",()=>{
  for(const formula of formulas){
    const html=katex.renderToString(formula,{displayMode:false,throwOnError:false,trust:false,output:"htmlAndMathml"});
    assert.match(html,/class="katex"/);
    assert.match(html,/<math/);
    assert.doesNotMatch(html,/katex-error/);
  }
});
