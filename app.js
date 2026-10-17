/* Remote Job Safety Review — original browser-side rules, 2026 Daylise Baber */
(() => {
  const $ = (id) => document.getElementById(id);
  const form = $('reviewForm');
  if (!form) return;

  const sourceLinks = {
    ftc2026: { label: 'FTC (2026)', url: 'https://consumer.ftc.gov/consumer-alerts/2026/04/job-offer-text-probably-scam' },
    ftc2025: { label: 'FTC (2025)', url: 'https://consumer.ftc.gov/consumer-alerts/2025/06/how-avoid-work-home-job-scams' },
    ftcTask: { label: 'FTC Data Spotlight (2024)', url: 'https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/12/paying-get-paid-gamified-job-scams-drive-record-losses' },
    fbi2024: { label: 'FBI/IC3 (2024)', url: 'https://www.ic3.gov/PSA/2024/PSA240604' },
    ftc2024: { label: 'FTC (2024)', url: 'https://consumer.ftc.gov/consumer-alerts/2024/07/looking-job-spot-scams' },
    ftcSide2026: { label: 'FTC (2026, side-hustle guidance)', url: 'https://consumer.ftc.gov/consumer-alerts/2026/02/how-avoid-side-hustle-scam' },
    ftcReship2025: { label: 'FTC (2025, reshipping)', url: 'https://consumer.ftc.gov/consumer-alerts/2025/12/can-you-unbox-signs-reshipping-scam' }
  };

  const freeMail = new Set(['gmail.com','yahoo.com','outlook.com','hotmail.com','aol.com','icloud.com','proton.me','protonmail.com']);
  const patterns = [
    {key:'payment', weight:5, severity:'high', title:'Request to pay money in connection with the job', detail:'The text appears to mention paying a fee, deposit, training cost, equipment cost, money transfer, or similar payment request.', re:/(pay|send|transfer|wire|deposit).{0,35}(fee|money|funds|deposit|training|equipment|registration|application)|(?:application|registration|training|equipment) fee|send us money|pay to start|pay to unlock/i, sources:['ftc2025','ftc2024']},
    {key:'crypto', weight:5, severity:'high', title:'Cryptocurrency or wallet payment language', detail:'The text appears to mention cryptocurrency or a crypto wallet in the job/payment process.', re:/\b(?:crypto(?:currency)?|bitcoin|ethereum|usdt|tether|wallet address|coinbase|binance)\b/i, sources:['ftcTask','fbi2024']},
    {key:'check', weight:5, severity:'high', title:'Check-and-purchase pattern', detail:'The text appears to connect a check/deposit with equipment, a vendor, sending money, or buying something.', re:/(?:check|cheque).{0,80}(?:equipment|vendor|purchase|buy|send|transfer)|(?:deposit|mobile deposit).{0,55}(?:check|cheque)|(?:buy|purchase).{0,50}equipment.{0,50}(?:check|cheque)/i, sources:['ftc2025','ftc2024']},
    {key:'task', weight:4, severity:'high', title:'Task-scam style work language', detail:'The text appears to describe rating, liking, boosting, optimizing, or repetitive online tasks tied to earnings.', re:/product boost|boosting products|app optimization|optimization task|rate.{0,20}(?:product|restaurant|image)|like.{0,20}(?:video|post|product)|complete.{0,20}tasks?|task set|unlock.{0,20}tasks?/i, sources:['ftcTask','fbi2024']},
    {key:'giftcard', weight:5, severity:'high', title:'Gift-card payment language', detail:'Gift cards appear in the job or payment instructions.', re:/gift\s*cards?/i, sources:['ftc2025']},
    {key:'reship', weight:5, severity:'high', title:'Package reshipping language', detail:'The work appears to involve receiving, repackaging, inspecting, or forwarding packages from home.', re:/receive.{0,30}packages?|repackag|reship|shipping inspector|package inspector|forward.{0,25}packages?/i, sources:['ftcReship2025']},
    {key:'sensitive', weight:3, severity:'medium', title:'Sensitive identity or financial data appears in the request', detail:'The text mentions high-risk personal or financial information. Legitimate onboarding can require some data later, but verify the employer and process first.', re:/social security|\bssn\b|bank account|routing number|driver'?s licen[cs]e|passport|one[- ]time (?:password|code)|\botp\b/i, sources:['fbi2024']},
    {key:'messaging', weight:2, severity:'medium', title:'WhatsApp or Telegram appears in the recruiting process', detail:'Unexpected job outreach through messaging platforms is a reason to independently verify the employer and role.', re:/\bwhats\s*app\b|\btelegram\b/i, sources:['ftc2026','ftcTask']},
    {key:'instant', weight:2, severity:'medium', title:'Little or no interview process', detail:'The text appears to suggest instant hiring or an offer without a meaningful interview process.', re:/no interview|instant hire|hired immediately|you are hired|offer you the position immediately|selected without interview/i, sources:['fbi2024']},
    {key:'pressure', weight:1, severity:'medium', title:'Urgency or pressure language', detail:'The message appears to push an immediate response or very short deadline. Pressure alone does not prove fraud, but it can reduce time to verify.', re:/act now|reply immediately|respond immediately|urgent response|today only|within \d{1,2} hours?|right away|do not tell anyone|keep (?:this|it) confidential/i, sources:['ftcSide2026']}
  ];

  function normalizeDomain(value) {
    if (!value) return '';
    let v = value.trim().toLowerCase();
    try {
      if (!/^https?:\/\//.test(v)) v = 'https://' + v;
      const h = new URL(v).hostname.replace(/^www\./,'');
      return h;
    } catch { return ''; }
  }
  function emailDomain(value) {
    const m=(value||'').trim().toLowerCase().match(/@([^\s>]+)$/); return m ? m[1].replace(/^www\./,'') : '';
  }
  function registrableish(domain) {
    const parts=domain.split('.').filter(Boolean); return parts.length<=2?domain:parts.slice(-2).join('.');
  }
  function domainsMatch(a,b){ return a && b && (a===b || a.endsWith('.'+b) || b.endsWith('.'+a) || registrableish(a)===registrableish(b)); }
  function addSignal(map, sig){
    const prev=map.get(sig.key);
    if(!prev || sig.weight>prev.weight) map.set(sig.key,sig);
  }
  function sourceHtml(keys){
    return keys.map(k=>sourceLinks[k]).filter(Boolean).map(s=>`<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>`).join(' · ');
  }

  function buildReview(){
    const text=$('jobText').value.trim();
    const signals=new Map();
    patterns.forEach(p=>{ if(text && p.re.test(text)) addSignal(signals,{...p}); });

    const contact=$('contactChannel').value;
    if(['text','whatsapp','telegram'].includes(contact)) addSignal(signals,{key:'unsolicited-contact',weight:3,severity:'medium',title:'Unexpected direct-message recruiting',detail:'You indicated the opportunity began with an unexpected '+(contact==='text'?'text/SMS':contact.charAt(0).toUpperCase()+contact.slice(1))+' message. Independent verification is especially important.',sources:['ftc2026','ftcTask']});
    else if(['email','social'].includes(contact)) addSignal(signals,{key:'unsolicited-contact',weight:1,severity:'medium',title:'Unexpected recruiting contact',detail:'Unexpected recruiting can be legitimate, but you should independently verify the company, role, and sender before sharing sensitive information.',sources:['ftc2025','fbi2024']});

    const official=$('officialListing').value;
    if(official==='no') addSignal(signals,{key:'official-listing',weight:3,severity:'medium',title:'Role not found on the official careers page',detail:'You indicated that you could not find this role on the employer’s official careers page. That is a reason to verify directly with the company before continuing.',sources:['ftc2025','ftc2024']});
    if($('equipmentClarity').value==='check') addSignal(signals,{key:'check',weight:5,severity:'high',title:'Check-and-equipment purchase request',detail:'You indicated that a check is being used to fund equipment or a purchase. FTC guidance warns against check-forwarding and check-funded purchase schemes.',sources:['ftc2025','ftc2024']});
    if($('equipmentClarity').value==='buy') addSignal(signals,{key:'equipment-buy',weight:3,severity:'medium',title:'Up-front equipment purchase request',detail:'You indicated that you are being asked to purchase equipment before a normal verified onboarding process. Verify the employer and payment arrangement independently.',sources:['ftc2025']});
    if($('payClarity').value==='tooEasy') addSignal(signals,{key:'easy-money',weight:2,severity:'medium',title:'Large earnings promised for very simple work',detail:'High earnings paired with unusually simple remote work deserve extra scrutiny, especially when combined with payment or task-based signals.',sources:['ftcTask','fbi2024','ftcSide2026']});
    if($('classification').value==='commission') addSignal(signals,{key:'classification',weight:1,severity:'info',title:'Compensation or work classification is unclear',detail:'Commission-only, contractor, employee, and gig arrangements can be legitimate, but the terms should be understandable before you invest significant time.',sources:[]});
    if($('classification').value==='conflict' || $('payClarity').value==='conflict' || $('hoursClarity').value==='conflict' || $('locationRule').value==='conflict') addSignal(signals,{key:'contradiction',weight:2,severity:'medium',title:'Important job terms conflict',detail:'You indicated that one or more core job terms conflict across messages or documents. Ask for clarification in writing before relying on the offer.',sources:[]});

    if($('manualPay').checked) addSignal(signals,{key:'payment',weight:5,severity:'high',title:'You reported a payment request',detail:'You indicated that the opportunity requires a fee, deposit, training payment, or other money to get the job.',sources:['ftc2025','ftc2024']});
    if($('manualCrypto').checked) addSignal(signals,{key:'crypto',weight:5,severity:'high',title:'You reported a cryptocurrency request',detail:'You indicated that cryptocurrency or a wallet transfer is part of the work or payment process.',sources:['ftcTask','fbi2024']});
    if($('manualTask').checked) addSignal(signals,{key:'task',weight:4,severity:'high',title:'You reported task-style work',detail:'You indicated that the work centers on rating, liking, boosting, or optimizing simple online tasks.',sources:['ftcTask','fbi2024']});
    if($('manualSensitive').checked) addSignal(signals,{key:'sensitive',weight:3,severity:'medium',title:'You reported an early request for sensitive data',detail:'Verify the employer and onboarding process before sending banking or identity information.',sources:['fbi2024']});
    if($('manualNoInterview').checked) addSignal(signals,{key:'instant',weight:2,severity:'medium',title:'You reported no meaningful interview process',detail:'A job offer without a normal interview or reference process is a reason for additional verification.',sources:['fbi2024']});
    if($('manualUrgency').checked) addSignal(signals,{key:'pressure',weight:1,severity:'medium',title:'You reported strong urgency or secrecy pressure',detail:'Slow down and independently verify the opportunity before acting.',sources:['ftcSide2026']});

    const eDomain=emailDomain($('recruiterEmail').value); const wDomain=normalizeDomain($('officialWebsite').value);
    if(eDomain && freeMail.has(eDomain)) addSignal(signals,{key:'free-email',weight:1,severity:'info',title:'Recruiter is using a consumer email domain',detail:'A free email address is not proof of fraud—small businesses and independent recruiters may use one—but it is worth confirming the sender through an independently found company channel.',sources:['ftc2025']});
    if(eDomain && wDomain && !freeMail.has(eDomain) && !domainsMatch(eDomain,wDomain)) addSignal(signals,{key:'domain-mismatch',weight:2,severity:'medium',title:'Recruiter email domain does not match the company website domain you entered',detail:`The email domain (${escapeHtml(eDomain)}) does not appear to match the website domain (${escapeHtml(wDomain)}). This simple comparison cannot detect every legitimate recruiting vendor or every lookalike domain, so verify independently.`,sources:['ftc2025','ftc2024']});

    const arr=[...signals.values()];
    const safetyPoints=arr.reduce((s,x)=>s+x.weight,0);
    let safetyLabel,safetyClass,safetyNote;
    if(safetyPoints>=9){safetyLabel='High-concern signals';safetyClass='status-high';safetyNote='Multiple or severe warning signals deserve independent verification before you continue.';}
    else if(safetyPoints>=3){safetyLabel='Verify before continuing';safetyClass='status-mid';safetyNote='One or more signals need additional checking. This is not a fraud determination.';}
    else{safetyLabel='No major listed signals';safetyClass='status-low';safetyNote='The review did not find major listed signals, but that does not prove the opportunity is legitimate.';}

    const clarityFields=[$('locationRule').value,$('classification').value,$('payClarity').value,$('hoursClarity').value,$('equipmentClarity').value];
    const clearCount=clarityFields.filter(v=>v==='clear').length;
    const conflicts=clarityFields.filter(v=>['conflict','check','buy','tooEasy','commission'].includes(v)).length;
    let clarityLabel,clarityClass,clarityNote;
    if(clearCount>=4 && conflicts===0){clarityLabel='Clear';clarityClass='status-low';clarityNote='Most core remote-work terms you reviewed are clearly stated.';}
    else if(clearCount>=2 && conflicts<=1){clarityLabel='Mixed';clarityClass='status-mid';clarityNote='Some core terms are clear, while others are missing or need clarification.';}
    else{clarityLabel='Unclear';clarityClass='status-mid';clarityNote='Several core remote-work terms are missing, uncertain, or conflicting.';}

    let moveLabel,moveClass,moveNote;
    if(safetyPoints>=9 || arr.some(s=>['payment','crypto','check','giftcard','reship'].includes(s.key))){moveLabel='Pause and verify';moveClass='status-high';moveNote='Do not send money or sensitive data. Verify through independent official channels first.';}
    else if(official==='no' || safetyPoints>=3 || clarityLabel!=='Clear'){moveLabel='Verify first';moveClass='status-mid';moveNote='Confirm the employer, listing, and unclear terms before investing more time.';}
    else if(official==='yes'){moveLabel='Proceed with normal caution';moveClass='status-low';moveNote='No tool can guarantee legitimacy. Continue normal independent verification.';}
    else{moveLabel='Check the official listing';moveClass='status-mid';moveNote='Confirm the role on the employer’s independently located careers page before proceeding.';}

    render({arr,safetyPoints,safetyLabel,safetyClass,safetyNote,clarityLabel,clarityClass,clarityNote,moveLabel,moveClass,moveNote,official});
  }

  function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function render(r){
    const set=(id,label,cls,note)=>{ const el=$(id); el.textContent=label; el.className='score-value '+cls; $(id.replace('Value','Note')).textContent=note; };
    set('safetyValue',r.safetyLabel,r.safetyClass,r.safetyNote); set('clarityValue',r.clarityLabel,r.clarityClass,r.clarityNote); set('moveValue',r.moveLabel,r.moveClass,r.moveNote);
    const list=$('signalList');
    if(!r.arr.length){list.innerHTML='<div class="signal"><div class="signal-top"><strong>No listed warning signal was triggered by the information entered.</strong><span class="severity info">Limit</span></div><div class="tiny">This does not verify the employer, recruiter, domain, job listing, or offer. Continue normal independent checks.</div></div>';}
    else list.innerHTML=r.arr.sort((a,b)=>b.weight-a.weight).map(s=>`<div class="signal"><div class="signal-top"><strong>${escapeHtml(s.title)}</strong><span class="severity ${s.severity}">${s.severity==='high'?'High concern':s.severity==='medium'?'Verify':'Info'}</span></div><div>${s.detail}</div>${s.sources.length?`<div class="source-tag">Sources: ${sourceHtml(s.sources)}</div>`:''}</div>`).join('');

    const steps=[];
    steps.push('Find the employer’s official website independently and confirm that the role, company contact information, and recruiting process are consistent.');
    if(r.official!=='yes') steps.push('Search the employer’s official careers page for the exact role. If it is missing, contact the company using independently found contact information.');
    if(r.safetyPoints>=3) steps.push('Do not send money, cryptocurrency, gift cards, or funds from a deposited check while you verify the opportunity.');
    if(r.arr.some(s=>s.key==='sensitive')) steps.push('Do not send sensitive identity or banking data until you have independently verified the employer and reached a legitimate onboarding stage.');
    if(r.clarityLabel!=='Clear') steps.push('Ask for unclear remote-work terms in writing: eligible location, employee/contractor status, pay structure, working hours/time zone, and equipment policy.');
    steps.push('Search the company or recruiter name with terms such as “scam,” “review,” or “complaint,” and evaluate the sources rather than relying on one review.');
    if(r.safetyPoints>=3) steps.push('If you believe the offer is fraudulent, keep useful evidence and consider reporting it to ReportFraud.ftc.gov and/or IC3.gov.');
    $('nextSteps').innerHTML=steps.map(s=>`<li>${escapeHtml(s)}</li>`).join('');
    $('results').classList.add('show'); $('results').scrollIntoView({behavior:'smooth',block:'start'});
    window.__lastReview={safety:r.safetyLabel,clarity:r.clarityLabel,move:r.moveLabel,count:r.arr.length};
  }

  function summary(){const r=window.__lastReview;if(!r)return '';return `Remote Job Safety Review\nSafety signals: ${r.safety}\nRemote-job clarity: ${r.clarity}\nSuggested next move: ${r.move}\nSignals flagged: ${r.count}\n\nThis is an educational review, not proof that a job is legitimate or fraudulent.`;}
  form.addEventListener('submit',e=>{e.preventDefault();buildReview();});
  $('clearForm').addEventListener('click',()=>{form.reset();$('results').classList.remove('show');window.__lastReview=null;$('shareStatus').textContent='';});
  $('loadExample').addEventListener('click',()=>{
    $('jobText').value='Hello! We found your profile for a remote Product Optimization Assistant role. Earn $800 per day by completing simple product boosting tasks. No interview is needed. We will train you on Telegram. To unlock the next task set, deposit USDT to your work wallet. Reply immediately to begin.';
    $('contactChannel').value='telegram';$('officialListing').value='unknown';$('locationRule').value='unknown';$('classification').value='unknown';$('payClarity').value='tooEasy';$('hoursClarity').value='unknown';$('equipmentClarity').value='unknown';
  });
  $('copyResult').addEventListener('click',async()=>{const s=summary();if(!s)return;try{await navigator.clipboard.writeText(s);$('shareStatus').textContent='Summary copied.';}catch{$('shareStatus').textContent='Copy was unavailable in this browser.';}});
  $('shareResult').addEventListener('click',async()=>{const s=summary();if(!s)return;if(navigator.share){try{await navigator.share({title:'Remote Job Safety Review',text:s});$('shareStatus').textContent='Share sheet opened.';}catch(e){if(e.name!=='AbortError')$('shareStatus').textContent='Sharing was unavailable.';}}else{try{await navigator.clipboard.writeText(s);$('shareStatus').textContent='Sharing is not supported here, so the summary was copied instead.';}catch{$('shareStatus').textContent='Sharing is not supported in this browser.';}}});
  $('downloadCard').addEventListener('click',()=>{
    const r=window.__lastReview;if(!r)return;const c=document.createElement('canvas');c.width=1200;c.height=675;const x=c.getContext('2d');
    x.fillStyle='#07111f';x.fillRect(0,0,c.width,c.height);x.fillStyle='#102440';x.fillRect(58,58,1084,559);x.strokeStyle='#65d6c5';x.lineWidth=3;x.strokeRect(58,58,1084,559);
    x.fillStyle='#65d6c5';x.font='700 28px system-ui, sans-serif';x.fillText('REMOTE JOB SAFETY REVIEW',100,125);
    x.fillStyle='#f4f7fb';x.font='800 58px system-ui, sans-serif';x.fillText('Verify before you trust the offer.',100,205);
    const rows=[['Safety signals',r.safety],['Remote-job clarity',r.clarity],['Suggested next move',r.move],['Signals flagged',String(r.count)]];
    let y=300;rows.forEach(([a,b])=>{x.fillStyle='#b7c4d6';x.font='600 25px system-ui, sans-serif';x.fillText(a,100,y);x.fillStyle='#f4f7fb';x.font='800 31px system-ui, sans-serif';x.fillText(b,430,y);y+=66;});
    x.fillStyle='#b7c4d6';x.font='500 20px system-ui, sans-serif';x.fillText('Educational review • No pasted job text or personal details included',100,570);
    const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='remote-job-safety-review-card.png';a.click();$('shareStatus').textContent='Safety card created in your browser.';
  });
})();
