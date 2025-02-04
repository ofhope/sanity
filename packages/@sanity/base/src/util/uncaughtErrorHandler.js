const FONT_SANS_SERIF = `-apple-system, BlinkMacSystemFont, \\'Segoe UI\\', Roboto, \\'Helvetica Neue\\', Helvetica, Arial, system-ui, sans-serif`
const FONT_MONOSPACE = `-apple-system-ui-monospace, \\'SF Mono\\', Menlo, Monaco, Consolas, monospace`

const uncaughtErrorHandler = () =>
  // prettier-ignore
  [
    `window.onerror = function(m,u,l,c,e) {`,
      `var p=window.location.port;`,
      `var h=window.location.protocol+'//'+window.location.hostname+(p?':'+p:'');`,
      `var r=document.getElementById('sanity');`,
      `while(r.firstChild){r.removeChild(r.firstChild);}`,
      `var s=document.createElement('style');`,
      `s.appendChild(document.createTextNode('`,
        `html,body,#sanityBody,#sanity,#sanityError{height:100%;}`,
        `body{-webkit-font-smoothing:antialiased;margin:0;}`,
        `#sanityError{background-color:#fff;color:#121923;font-family:${FONT_SANS_SERIF};font-size:16px;line-height:21px;min-height:100%;}`,
        `#sanityError>div{background-color:#fff;max-width:960px;margin:0 auto;padding:47px 32px 52px;}`,
        `@media(min-width:600px){`,
          `#sanityError>div{`,
            `padding:47px 84px;`,
          `}`,
        `}`,
        `#sanityError button{-webkit-font-smoothing:inherit;font:inherit;font-weight:500;background-color:#2276FC;color:#fff;padding:7px 12px;border-radius:3px;border:0;}`,
        `#sanityError button:hover{background-color:#1E63D0;}`,
        `#sanityError button:active{background-color:#1B50A5;}`,
      `'));`,
      `document.head.appendChild(s);`,
      `var f=document.createElement('div');`,
      `f.id='sanityError';`,
      `f.innerHTML='`,
        `<div>`,
          `<h1 style="font-size:21px;line-height:27px;margin: 0 0 10px;">Unhandled error</h1>`,
          `<p style="color:#66758D;margin:10px 0 14px;">Encountered an unhandled error in this Studio.</p>`,
          `<button class="sanity-error-handler__reload-btn" type="button">Reload page</button>`,
          `<pre style="background-color:#FDEBEA;color:#C3362C;font-size:13px;line-height:17px;padding:16px 20px;border-radius:6px;margin:32px 0 0;overflow:auto;">`,
            `<code style="font-family:${FONT_MONOSPACE};">`,
              `'+e.stack.replaceAll(h,'')+'`,
            `</code>`,
          `</pre>`,
        `</div>`,
      `';`,
      `var b=f.querySelector('.sanity-error-handler__reload-btn');`,
      `if(b){`,
        `b.onclick=function() {`,
          `window.location.reload();`,
        `}`,
      `};`,
      `r.appendChild(f);`,
    `};`,
  ].join('')

export default uncaughtErrorHandler
