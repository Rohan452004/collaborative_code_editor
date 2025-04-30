import{r as c,$ as w}from"./react-C0JOplFJ.js";import"./react-dom-CqXdU6rh.js";import{R as T,u as v,a as U}from"./react-router-veBPla2P.js";import{c as y}from"./@remix-run-DaH1AUis.js";/**
 * React Router DOM v6.22.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function f(e){return e===void 0&&(e=""),new URLSearchParams(typeof e=="string"||Array.isArray(e)||e instanceof URLSearchParams?e:Object.keys(e).reduce((s,r)=>{let a=e[r];return s.concat(Array.isArray(a)?a.map(t=>[r,t]):[[r,a]])},[]))}function A(e,s){let r=f(e);return s&&s.forEach((a,t)=>{r.has(t)||s.getAll(t).forEach(o=>{r.append(t,o)})}),r}const F="6";try{window.__reactRouterVersion=F}catch{}const P="startTransition",S=w[P];function _(e){let{basename:s,children:r,future:a,window:t}=e,o=c.useRef();o.current==null&&(o.current=y({window:t,v5Compat:!0}));let n=o.current,[u,i]=c.useState({action:n.action,location:n.location}),{v7_startTransition:l}=a||{},h=c.useCallback(m=>{l&&S?S(()=>i(m)):i(m)},[i,l]);return c.useLayoutEffect(()=>n.listen(h),[n,h]),c.createElement(T,{basename:s,children:r,location:u.location,navigationType:u.action,navigator:n,future:a})}var R;(function(e){e.UseScrollRestoration="useScrollRestoration",e.UseSubmit="useSubmit",e.UseSubmitFetcher="useSubmitFetcher",e.UseFetcher="useFetcher",e.useViewTransitionState="useViewTransitionState"})(R||(R={}));var p;(function(e){e.UseFetcher="useFetcher",e.UseFetchers="useFetchers",e.UseScrollRestoration="useScrollRestoration"})(p||(p={}));function L(e){let s=c.useRef(f(e)),r=c.useRef(!1),a=v(),t=c.useMemo(()=>A(a.search,r.current?null:s.current),[a.search]),o=U(),n=c.useCallback((u,i)=>{const l=f(typeof u=="function"?u(t):u);r.current=!0,o("?"+l,i)},[o,t]);return[t,n]}export{_ as B,L as u};
