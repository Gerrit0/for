!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t){const n=[["Unique","Enter lines",e=>Array.from(new Set(e.split("\n"))).join("\n")]];let r=n[0][2];const o=document.querySelector("select"),u=document.querySelector(".left textarea"),i=document.querySelector(".right"),c=document.querySelector("button");o.addEventListener("input",()=>{r=n.find(e=>e[0]===o.textContent)[2],l()}),u.addEventListener("input",l),c.addEventListener("click",()=>{navigator.clipboard.writeText(i.innerText).catch(console.error),c.textContent="Copied!",setTimeout(()=>c.textContent="Copy",750)});for(const e of n){o.appendChild(document.createElement("option")).textContent=e[0],u.placeholder=e[1]}function l(){try{i.innerText=r(u.value)}catch(e){i.innerText="Error: "+e.message}}}]);