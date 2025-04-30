/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */var f,e;function t(){if(e)return f;e=1,f=function(r){return r!=null&&(u(r)||n(r)||!!r._isBuffer)};function u(r){return!!r.constructor&&typeof r.constructor.isBuffer=="function"&&r.constructor.isBuffer(r)}function n(r){return typeof r.readFloatLE=="function"&&typeof r.slice=="function"&&u(r.slice(0,0))}return f}export{t as r};
