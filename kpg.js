/* Klaus Property Group: shared page scripts (copy buttons, mobile menu, AI assistant chat). */
(function(){
  function fallback(btn,t){var r=document.createRange();r.selectNodeContents(t);var s=getSelection();s.removeAllRanges();s.addRange(r);btn.textContent="Selected — press Copy";}
  document.querySelectorAll("[data-copy-target]").forEach(function(btn){
    btn.addEventListener("click",function(){
      var t=document.getElementById(btn.dataset.copyTarget),o=btn.textContent;
      try{navigator.clipboard.writeText(t.textContent.trim()).then(function(){btn.textContent="Copied";setTimeout(function(){btn.textContent=o},1500)},function(){fallback(btn,t)})}catch(e){fallback(btn,t)}
    });
  });
  // Close the mobile menu after a tap
  document.querySelectorAll(".mnav .panel a").forEach(function(a){a.addEventListener("click",function(){var d=a.closest("details");if(d)d.open=false})});
  document.addEventListener("click",function(e){var d=document.querySelector(".mnav[open]");if(d&&!d.contains(e.target))d.open=false});
})();
(function(){
  var API="https://kpg-assistant.klauspropertymgmt.workers.dev/";
  var GREETING="Hi! I'm KPG's virtual assistant. I can answer questions about our property management, give you a quick rent range for your home, help renters, or log a maintenance request. What can I help with?";
  var CHIPS=["What could my home rent for?","Tell me about your management services","I'm looking for a rental","I need to report a maintenance issue"];
  var btn=document.getElementById("kchat-open"),box=document.getElementById("kchat"),log=document.getElementById("kchat-log"),form=document.getElementById("kchat-form"),input=document.getElementById("kchat-input"),send=document.getElementById("kchat-send");
  var history=[],busy=false,started=false;
  try{var saved=JSON.parse(sessionStorage.getItem("kpg-chat")||"null");if(Array.isArray(saved))history=saved;}catch(e){}
  function save(){try{sessionStorage.setItem("kpg-chat",JSON.stringify(history.slice(-30)))}catch(e){}}
  function esc(s){return s.replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
  function linkify(s){return esc(s).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/(\b337-794-9971\b)/g,'<a href="tel:+13377949971">$1</a>').replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g,'<a href="mailto:$1">$1</a>')}
  function add(role,text){var d=document.createElement("div");d.className="kmsg "+(role==="user"?"me":"bot");d.innerHTML=linkify(text);log.appendChild(d);log.scrollTop=log.scrollHeight;return d}
  function chips(){var w=document.createElement("div");w.className="kchips";CHIPS.forEach(function(c){var b=document.createElement("button");b.type="button";b.textContent=c;b.onclick=function(){w.remove();ask(c)};w.appendChild(b)});log.appendChild(w)}
  function render(){log.innerHTML="";add("assistant",GREETING);history.forEach(function(m){add(m.role,m.content)});if(!history.length)chips()}
  function typing(on){var t=document.getElementById("ktyping");if(on&&!t){t=document.createElement("div");t.id="ktyping";t.className="kmsg bot ktyping";t.innerHTML="<i></i><i></i><i></i>";log.appendChild(t);log.scrollTop=log.scrollHeight}if(!on&&t)t.remove()}
  function ask(text){
    text=text.trim();if(!text||busy)return;
    var c=log.querySelector(".kchips");if(c)c.remove();
    history.push({role:"user",content:text});save();add("user",text);
    busy=true;send.disabled=true;typing(true);
    fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:history})})
      .then(function(r){return r.json()})
      .then(function(j){var reply=(j&&j.reply)||"Sorry, something went wrong. Please call or text 337-794-9971.";history.push({role:"assistant",content:reply});save();typing(false);add("assistant",reply)})
      .catch(function(){typing(false);add("assistant","I can't connect right now. Please call or text Kohl at 337-794-9971 or email klauspropertymgmt@gmail.com.")})
      .then(function(){busy=false;send.disabled=false;input.focus()});
  }
  function open(){box.hidden=false;btn.hidden=true;if(!started){render();started=true}input.focus()}
  function close(){box.hidden=true;btn.hidden=false;btn.focus()}
  btn.addEventListener("click",open);
  document.getElementById("kchat-close").addEventListener("click",close);
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!box.hidden)close()});
  form.addEventListener("submit",function(e){e.preventDefault();var v=input.value;input.value="";input.style.height="";ask(v)});
  input.addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});
  input.addEventListener("input",function(){input.style.height="auto";input.style.height=Math.min(input.scrollHeight,120)+"px"});
})();
