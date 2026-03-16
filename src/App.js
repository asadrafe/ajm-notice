import { useState, useRef, useCallback, useEffect } from "react";

// ─── Persist to localStorage ──────────────────────────────────────────────────
function usePersisted(key, defaultValue) {
  const [state, setState] = useState(() => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : defaultValue; }
    catch { return defaultValue; }
  });
  const set = useCallback((val) => {
    setState(val);
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key]);
  return [state, set];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ISSUERS = [
  { value: "management", label: "School Management",     designation: "School Management",    signLabel: "On Behalf of Management",             canUploadSig: false },
  { value: "director",   label: "Director",              designation: "Director",             signLabel: "Director, A.J.M. Academy",             canUploadSig: true  },
  { value: "principal",  label: "Principal (In-Charge)", designation: "Principal (In-Charge)",signLabel: "Rukiya Bashir\nPrincipal (In-Charge)", canUploadSig: true  },
];

const NOTICE_TYPES = [
  { value: "general", label: "General Announcement" },
  { value: "holiday", label: "Holiday / School Closure" },
  { value: "ptm",     label: "Parent-Teacher Meeting (PTM)" },
  { value: "exam",    label: "Exam Schedule" },
  { value: "fee",     label: "Fee Reminder" },
];

const TEMPLATES = {
  general: {
    subject: "Important Notice",
    body: "यह सूचित किया जाता है कि विद्यालय प्रशासन की ओर से सभी अभिभावकों एवं छात्रों को सूचित किया जाता है कि\n\n[यहाँ अपना संदेश लिखें]\n\nसभी से अनुरोध है कि इस सूचना का पालन करें।\n\nधन्यवाद।",
    addressedTo: "All Students & Parents",
  },
  holiday: {
    subject: "School Holiday Notice",
    body: "यह सूचित किया जाता है कि दिनांक __________ को __________ के अवसर पर विद्यालय में अवकाश रहेगा।\n\nAll students and parents are informed that the school will remain closed on __________ on account of __________.\n\nविद्यालय दिनांक __________ को पूर्ववत प्रारम्भ होगा।\nSchool will reopen on __________.\n\nसभी का सहयोग अपेक्षित है।",
    addressedTo: "All Students & Parents",
  },
  ptm: {
    subject: "Parent-Teacher Meeting (PTM) Notice",
    body: "यह सूचित किया जाता है कि दिनांक __________ को प्रातः __________ बजे से अपरान्ह __________ बजे तक अभिभावक-शिक्षक बैठक (PTM) का आयोजन किया जाएगा।\n\nAll parents are cordially invited to attend the Parent-Teacher Meeting (PTM) scheduled on __________ from __________ to __________.\n\nअपने वार्ड की प्रगति के बारे में जानकारी प्राप्त करने का यह सुनहरा अवसर है। कृपया अपनी उपस्थिति अवश्य सुनिश्चित करें।\n\nNote: Please bring your ward's diary and fee receipt.",
    addressedTo: "Parents / Guardians of All Students",
  },
  exam: {
    subject: "Examination Schedule Notice",
    body: "यह सूचित किया जाता है कि आगामी परीक्षा का कार्यक्रम निम्नानुसार है:\n\nAll students are informed that the upcoming examination schedule is as follows:\n\nDate: __________\nClass: __________\nSubject: __________\nTime: __________\n\nछात्रों से अनुरोध है कि वे परीक्षा की तैयारी समय पर पूर्ण करें तथा परीक्षा के दिन विद्यालय में समय पर उपस्थित हों।\n\nStudents are advised to complete their preparation and arrive on time on examination day.",
    addressedTo: "All Students (Class Nursery to Class V)",
  },
  fee: {
    subject: "Fee Reminder Notice",
    body: "यह सूचित किया जाता है कि जिन छात्र-छात्राओं की मासिक / वार्षिक शुल्क अभी तक जमा नहीं हुई है, वे कृपया दिनांक __________ तक अपनी शुल्क अवश्य जमा करें।\n\nAll parents are requested to clear the pending school fee for their ward on or before __________.\n\nनिर्धारित तिथि के बाद विलम्ब शुल्क लागू होगा।\nLate fee will be charged after the due date.\n\nकृपया विद्यालय कार्यालय में संपर्क करें।\nFor queries, please contact the school office.",
    addressedTo: "Parents / Guardians of All Students",
  },
};

// ─── Design tokens (AJM Academy style) ───────────────────────────────────────
const C = {
  bg:         "#0f1117",
  sidebar:    "#1a1d27",
  card:       "#1e2130",
  cardBorder: "#2a2d3e",
  input:      "#252838",
  inputBorder:"#363a52",
  accent:     "#4ade80",
  accentDim:  "#14532d",
  accentHover:"#22c55e",
  text:       "#e2e8f0",
  textMuted:  "#94a3b8",
  textDim:    "#475569",
  danger:     "#f87171",
  dangerDim:  "#2d1515",
  dangerBorder:"#5a2020",
};

// ─── SVG Placeholder Seal ─────────────────────────────────────────────────────
function SchoolSeal({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="47" fill="none" stroke="#000" strokeWidth="2.5"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#000" strokeWidth="1"/>
      <text x="50" y="20" textAnchor="middle" fontSize="7" fontWeight="bold" fontFamily="serif" fill="#000" style={{letterSpacing:"1px"}}>A.J.M. ACADEMY</text>
      <path d="M 15 25 A 38 38 0 0 1 85 25" fill="none" stroke="#000" strokeWidth="0.5"/>
      <rect x="36" y="38" width="28" height="20" rx="1" fill="none" stroke="#000" strokeWidth="1.5"/>
      <line x1="50" y1="38" x2="50" y2="58" stroke="#000" strokeWidth="1.5"/>
      <line x1="39" y1="43" x2="48" y2="43" stroke="#000" strokeWidth="0.8"/>
      <line x1="39" y1="47" x2="48" y2="47" stroke="#000" strokeWidth="0.8"/>
      <line x1="39" y1="51" x2="48" y2="51" stroke="#000" strokeWidth="0.8"/>
      <line x1="52" y1="43" x2="61" y2="43" stroke="#000" strokeWidth="0.8"/>
      <line x1="52" y1="47" x2="61" y2="47" stroke="#000" strokeWidth="0.8"/>
      <line x1="52" y1="51" x2="61" y2="51" stroke="#000" strokeWidth="0.8"/>
      <line x1="50" y1="62" x2="50" y2="72" stroke="#000" strokeWidth="1.5"/>
      <ellipse cx="50" cy="61" rx="4" ry="3" fill="none" stroke="#000" strokeWidth="1"/>
      <path d="M 47 60 Q 50 55 53 60" fill="#000"/>
      <text x="50" y="83" textAnchor="middle" fontSize="5.5" fontFamily="serif" fill="#000" style={{letterSpacing:"0.5px"}}>KISHANGANJ · BIHAR</text>
      <path d="M 12 78 A 40 40 0 0 0 88 78" fill="none" stroke="#000" strokeWidth="0.5"/>
      <text x="50" y="92" textAnchor="middle" fontSize="4.5" fontFamily="serif" fill="#000" style={{letterSpacing:"1px"}}>ESTD. 2020</text>
    </svg>
  );
}

// ─── Image Upload Widget ──────────────────────────────────────────────────────
function ImageUploadBtn({ label, value, onUpload, onClear, previewHeight = 52 }) {
  const fileRef = useRef();
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpload(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleChange} />
      {value ? (
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <img src={value} alt={label} style={{
            height:`${previewHeight}px`, maxWidth:"130px", objectFit:"contain",
            border:`1px solid ${C.cardBorder}`, borderRadius:"6px",
            background:"#fff", padding:"4px",
            filter:"grayscale(100%) contrast(115%)",
          }}/>
          <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
            <button onClick={() => fileRef.current.click()} style={{
              padding:"6px 14px", background:C.input, color:C.textMuted,
              border:`1px solid ${C.cardBorder}`, borderRadius:"6px",
              fontSize:"11px", cursor:"pointer", fontFamily:"inherit",
            }}>Replace</button>
            <button onClick={onClear} style={{
              padding:"6px 14px", background:C.dangerDim, color:C.danger,
              border:`1px solid ${C.dangerBorder}`, borderRadius:"6px",
              fontSize:"11px", cursor:"pointer", fontFamily:"inherit",
            }}>Remove</button>
          </div>
        </div>
      ) : (
        <button onClick={() => fileRef.current.click()} style={{
          padding:"9px 18px", background:C.accentDim, color:C.accent,
          border:`1px solid ${C.accent}`, borderRadius:"7px",
          fontSize:"12px", cursor:"pointer", fontFamily:"inherit", fontWeight:"600",
        }}>↑ Upload {label}</button>
      )}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SCard({ title, icon, children }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`,
      borderRadius:"10px", padding:"14px 16px", marginBottom:"14px" }}>
      {title && (
        <div style={{ fontSize:"10px", fontWeight:"700", color:C.textMuted,
          textTransform:"uppercase", letterSpacing:"1px", marginBottom:"12px",
          display:"flex", alignItems:"center", gap:"6px" }}>
          <span>{icon}</span> {title}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Shared input styles ──────────────────────────────────────────────────────
const iStyle = {
  width:"100%", padding:"9px 12px",
  border:`1px solid ${C.inputBorder}`, borderRadius:"7px",
  fontFamily:"inherit", fontSize:"13px",
  boxSizing:"border-box", background:C.input, color:C.text, outline:"none",
};
const lStyle = {
  fontSize:"11px", fontWeight:"600", color:C.textMuted, display:"block",
  marginBottom:"5px", textTransform:"uppercase", letterSpacing:"0.5px",
};
const row = { marginBottom:"12px" };

// ─── Notice Preview ───────────────────────────────────────────────────────────
function NoticePreview({ data, logoImg, showSeal, signatures }) {
  const { noticeNo, date, issuer, subject, addressedTo, body, copyTo } = data;
  const issuerInfo = ISSUERS.find(i => i.value === issuer) || ISSUERS[0];
  const signLines  = issuerInfo.signLabel.split("\n");
  const sigImg     = signatures[issuer] || null;

  return (
    <div id="notice-preview" style={{
      background:"#fff", color:"#000",
      fontFamily:"'Times New Roman', Times, serif",
      width:"700px", minHeight:"990px",
      padding:"48px 56px", boxSizing:"border-box",
      border:"3px solid #000", position:"relative",
    }}>
      <div style={{ position:"absolute", top:"8px", left:"8px", right:"8px", bottom:"8px",
        border:"1px solid #000", pointerEvents:"none" }} />

      {/* Header */}
      <div style={{ textAlign:"center", borderBottom:"2px solid #000", paddingBottom:"14px", marginBottom:"16px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"18px" }}>
          <div style={{ flexShrink:0, width:"84px", display:"flex", justifyContent:"center", alignItems:"center" }}>
            {logoImg
              ? <img src={logoImg} alt="Logo" style={{ width:"84px", height:"84px", objectFit:"contain", filter:"grayscale(100%) contrast(115%)" }} />
              : showSeal ? <SchoolSeal size={84} /> : <div style={{ width:"84px" }} />
            }
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"22px", fontWeight:"bold", letterSpacing:"2px", textTransform:"uppercase" }}>A.J.M. Academy</div>
            <div style={{ fontSize:"11px", marginTop:"2px", letterSpacing:"0.5px" }}>Basharat Nagar, Chhatargachh, Kishanganj, Bihar – 855107</div>
            <div style={{ fontSize:"10px", marginTop:"1px", color:"#333" }}>(Nursery to Class V &nbsp;|&nbsp; English Medium)</div>
          </div>
          <div style={{ width:"84px", flexShrink:0 }} />
        </div>
      </div>

      <div style={{ textAlign:"center", fontSize:"15px", fontWeight:"bold",
        letterSpacing:"6px", textDecoration:"underline", marginBottom:"18px", textTransform:"uppercase" }}>
        NOTICE
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", fontSize:"12px", marginBottom:"14px" }}>
        <div><strong>Notice No.:</strong> {noticeNo || "___/AJM/2025"}</div>
        <div><strong>Date:</strong> {date || "____________"}</div>
      </div>
      <div style={{ fontSize:"12px", marginBottom:"10px" }}><strong>To:</strong> {addressedTo || "All Students & Parents"}</div>
      <div style={{ fontSize:"12px", marginBottom:"16px" }}>
        <strong>Subject:</strong>&nbsp;
        <span style={{ textDecoration:"underline", fontWeight:"bold" }}>{subject || "___________________________"}</span>
      </div>
      <div style={{ borderTop:"1px solid #000", marginBottom:"16px" }} />
      <div style={{ fontSize:"12.5px", lineHeight:"1.85", whiteSpace:"pre-wrap", textAlign:"justify", minHeight:"300px" }}>
        {body || "Notice content will appear here..."}
      </div>

      {/* Signature block */}
      <div style={{ marginTop:"44px", display:"flex", justifyContent:"flex-end" }}>
        <div style={{ textAlign:"center", minWidth:"200px" }}>
          <div style={{ height:"60px", display:"flex", alignItems:"flex-end", justifyContent:"center", marginBottom:"6px" }}>
            {sigImg
              ? <img src={sigImg} alt="Signature" style={{ maxHeight:"58px", maxWidth:"190px", objectFit:"contain", filter:"grayscale(100%) contrast(130%)" }} />
              : <div style={{ borderBottom:"1px solid #000", width:"190px" }} />
            }
          </div>
          {signLines.map((line, i) => (
            <div key={i} style={{ fontSize:"12px", fontWeight:i===0?"bold":"normal", lineHeight:"1.6" }}>{line}</div>
          ))}
          <div style={{ fontSize:"11px", marginTop:"1px", color:"#333" }}>{issuerInfo.designation}</div>
          <div style={{ fontSize:"11px" }}>A.J.M. Academy</div>
        </div>
      </div>

      {copyTo && (
        <div style={{ marginTop:"24px", borderTop:"1px dashed #aaa", paddingTop:"10px", fontSize:"11px" }}>
          <strong>Copy to:</strong> {copyTo}
        </div>
      )}

      <div style={{ position:"absolute", bottom:"20px", left:"56px", right:"56px",
        borderTop:"1px solid #bbb", paddingTop:"5px",
        display:"flex", justifyContent:"space-between", fontSize:"9.5px", color:"#666" }}>
        <span>A.J.M. Academy – Official Notice</span>
        <span>Confidential – For Internal Circulation</span>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const today = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 960);
  const [activeTab, setActiveTab] = useState("form");

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 960);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // ── Persistent (survives refresh) ──
  const [logoImg,    setLogoImg]    = usePersisted("ajm_ng_logo", null);
  const [showSeal,   setShowSeal]   = usePersisted("ajm_ng_seal", true);
  const [signatures, setSignatures] = usePersisted("ajm_ng_sigs", {});

  const [form, setForm] = useState({
    noticeNo:"", date:today, issuer:"principal",
    noticeType:"general",
    subject:    TEMPLATES.general.subject,
    addressedTo:TEMPLATES.general.addressedTo,
    body:       TEMPLATES.general.body,
    copyTo:"",
  });
  const [downloading, setDownloading] = useState(null);

  const upd = useCallback((k, v) => setForm(p => ({ ...p, [k]: v })), []);

  const applyTemplate = (type) => {
    const t = TEMPLATES[type];
    setForm(p => ({ ...p, noticeType:type, subject:t.subject, addressedTo:t.addressedTo, body:t.body }));
  };

  const setSig   = (key, url) => setSignatures({ ...signatures, [key]: url });
  const clearSig = (key) => { const n={...signatures}; delete n[key]; setSignatures(n); };

  const loadScripts = () => new Promise(resolve => {
    if (window.__ajmScripts) { resolve(); return; }
    let n = 0;
    const done = () => { if (++n === 2) { window.__ajmScripts = true; resolve(); } };
    ["https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
     "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"]
      .forEach(src => { const s=document.createElement("script"); s.src=src; s.onload=done; document.head.appendChild(s); });
  });

  const capture = async () => window.html2canvas(document.getElementById("notice-preview"),
    { scale:2, useCORS:true, backgroundColor:"#ffffff", logging:false });

  const downloadJPG = async () => {
    setDownloading("jpg");
    try {
      await loadScripts(); const c = await capture();
      const a=document.createElement("a"); a.download=`AJM_Notice_${form.noticeNo||Date.now()}.jpg`;
      a.href=c.toDataURL("image/jpeg",0.95); a.click();
    } catch(e) { alert("Download failed: "+e.message); }
    setDownloading(null);
  };

  const downloadPDF = async () => {
    setDownloading("pdf");
    try {
      await loadScripts(); const c = await capture();
      const {jsPDF}=window.jspdf;
      const pdf=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
      const pw=pdf.internal.pageSize.getWidth(), ph=pdf.internal.pageSize.getHeight();
      const ratio=c.width/c.height; let w=pw, h=pw/ratio;
      if(h>ph){h=ph;w=ph*ratio;}
      pdf.addImage(c.toDataURL("image/jpeg",1),"JPEG",(pw-w)/2,0,w,h);
      pdf.save(`AJM_Notice_${form.noticeNo||Date.now()}.pdf`);
    } catch(e) { alert("Download failed: "+e.message); }
    setDownloading(null);
  };

  const currentIssuer = ISSUERS.find(i => i.value === form.issuer);

  // ── Form content ──────────────────────────────────────────────────────────
  const FormPanel = (
    <div style={{ padding:"16px 16px 40px" }}>

      <SCard title="Template" icon="📋">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
          {NOTICE_TYPES.map(t => (
            <button key={t.value} onClick={() => applyTemplate(t.value)} style={{
              padding:"8px 10px", fontSize:"12px", cursor:"pointer", fontFamily:"inherit",
              textAlign:"left", lineHeight:"1.4", borderRadius:"7px", transition:"all 0.15s",
              border:`1px solid ${form.noticeType===t.value ? C.accent : C.cardBorder}`,
              background: form.noticeType===t.value ? C.accentDim : C.input,
              color:      form.noticeType===t.value ? C.accent    : C.textMuted,
              fontWeight: form.noticeType===t.value ? "600"       : "400",
            }}>{t.label}</button>
          ))}
        </div>
      </SCard>

      <SCard title="Notice Details" icon="📄">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", ...row }}>
          <div>
            <label style={lStyle}>Notice No.</label>
            <input style={iStyle} value={form.noticeNo} placeholder="001/AJM/2025" onChange={e=>upd("noticeNo",e.target.value)} />
          </div>
          <div>
            <label style={lStyle}>Date</label>
            <input style={iStyle} value={form.date} onChange={e=>upd("date",e.target.value)} />
          </div>
        </div>
        <div style={row}>
          <label style={lStyle}>Issued By</label>
          <select style={{...iStyle, cursor:"pointer"}} value={form.issuer} onChange={e=>upd("issuer",e.target.value)}>
            {ISSUERS.map(i=><option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
        </div>
        <div style={row}>
          <label style={lStyle}>Addressed To</label>
          <input style={iStyle} value={form.addressedTo} onChange={e=>upd("addressedTo",e.target.value)} />
        </div>
        <div style={row}>
          <label style={lStyle}>Subject</label>
          <input style={iStyle} value={form.subject} onChange={e=>upd("subject",e.target.value)} />
        </div>
        <div style={row}>
          <label style={lStyle}>Notice Body (Hindi / English)</label>
          <textarea style={{...iStyle, minHeight:"190px", resize:"vertical", lineHeight:"1.7"}}
            value={form.body} onChange={e=>upd("body",e.target.value)} />
        </div>
        <div>
          <label style={lStyle}>Copy To (optional)</label>
          <input style={iStyle} value={form.copyTo} placeholder="Notice Board, All Class Teachers"
            onChange={e=>upd("copyTo",e.target.value)} />
        </div>
      </SCard>

      {currentIssuer?.canUploadSig && (
        <SCard title={`Signature — ${currentIssuer.label}`} icon="✍️">
          <ImageUploadBtn
            label="Signature"
            value={signatures[form.issuer]||null}
            onUpload={url=>setSig(form.issuer,url)}
            onClear={()=>clearSig(form.issuer)}
            previewHeight={48}
          />
          <div style={{ fontSize:"10px", color:C.textDim, marginTop:"8px" }}>
            💾 Saved permanently · PNG transparent background recommended.
          </div>
        </SCard>
      )}

      <SCard title="School Logo / Seal" icon="🏫">
        <ImageUploadBtn
          label="Logo"
          value={logoImg}
          onUpload={setLogoImg}
          onClear={()=>setLogoImg(null)}
          previewHeight={64}
        />
        {!logoImg && (
          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"12px" }}>
            <input type="checkbox" id="sealChk" checked={showSeal}
              onChange={e=>setShowSeal(e.target.checked)}
              style={{ width:"15px", height:"15px", cursor:"pointer", accentColor:C.accent }} />
            <label htmlFor="sealChk" style={{ fontSize:"12px", color:C.textMuted, cursor:"pointer" }}>
              Show placeholder SVG seal
            </label>
          </div>
        )}
        <div style={{ fontSize:"10px", color:C.textDim, marginTop:"8px" }}>
          💾 Saved permanently · Appears B&W on notice · Square PNG recommended.
        </div>
      </SCard>

      <div style={{ display:"flex", gap:"10px" }}>
        <button onClick={downloadPDF} disabled={!!downloading} style={{
          flex:1, padding:"13px 0", borderRadius:"8px",
          border:`2px solid ${C.accent}`,
          background: downloading==="pdf" ? C.accentDim : C.accent,
          color: downloading==="pdf" ? C.textMuted : "#000",
          fontFamily:"inherit", fontSize:"13px", fontWeight:"700",
          cursor:"pointer", letterSpacing:"1px", textTransform:"uppercase", transition:"all 0.15s",
        }}>{downloading==="pdf" ? "Generating…" : "⬇ PDF"}</button>
        <button onClick={downloadJPG} disabled={!!downloading} style={{
          flex:1, padding:"13px 0", borderRadius:"8px",
          border:`2px solid ${C.cardBorder}`,
          background: C.input, color: downloading==="jpg" ? C.textDim : C.textMuted,
          fontFamily:"inherit", fontSize:"13px", fontWeight:"700",
          cursor:"pointer", letterSpacing:"1px", textTransform:"uppercase", transition:"all 0.15s",
        }}>{downloading==="jpg" ? "Generating…" : "⬇ JPG"}</button>
      </div>

      <div style={{ marginTop:"10px", fontSize:"10px", color:C.textDim, textAlign:"center", lineHeight:"1.6" }}>
        Replace __________ blanks with actual details before downloading.
      </div>
    </div>
  );

  // ── Scaled preview ────────────────────────────────────────────────────────
  const scale = Math.min(1, (window.innerWidth - 32) / 700);
  const scaledH = 990 * scale;

  const PreviewPanel = (
    <div style={{ padding:"16px", background:C.bg }}>
      <div style={{ fontSize:"10px", letterSpacing:"2px", color:C.textDim,
        textTransform:"uppercase", textAlign:"center", marginBottom:"14px" }}>
        Live Preview
      </div>
      <div style={isMobile ? {
        transformOrigin:"top left", transform:`scale(${scale})`,
        width:"700px", height:`${scaledH}px`, marginBottom:`${scaledH - 990}px`,
      } : { display:"flex", justifyContent:"center" }}>
        <div style={{ boxShadow:"0 8px 40px rgba(0,0,0,0.5)" }}>
          <NoticePreview data={form} logoImg={logoImg} showSeal={showSeal} signatures={signatures} />
        </div>
      </div>
      {isMobile && (
        <div style={{ display:"flex", gap:"10px", marginTop:"16px" }}>
          <button onClick={downloadPDF} disabled={!!downloading} style={{
            flex:1, padding:"13px 0", borderRadius:"8px",
            border:`2px solid ${C.accent}`, background:C.accent, color:"#000",
            fontFamily:"inherit", fontSize:"13px", fontWeight:"700",
            cursor:"pointer", letterSpacing:"1px", textTransform:"uppercase",
          }}>{downloading==="pdf" ? "Generating…" : "⬇ PDF"}</button>
          <button onClick={downloadJPG} disabled={!!downloading} style={{
            flex:1, padding:"13px 0", borderRadius:"8px",
            border:`2px solid ${C.cardBorder}`, background:C.input, color:C.textMuted,
            fontFamily:"inherit", fontSize:"13px", fontWeight:"700",
            cursor:"pointer", letterSpacing:"1px", textTransform:"uppercase",
          }}>{downloading==="jpg" ? "Generating…" : "⬇ JPG"}</button>
        </div>
      )}
    </div>
  );

  // ── Top bar (shared) ──────────────────────────────────────────────────────
  const TopBar = (
    <div style={{ background:C.sidebar, borderBottom:`1px solid ${C.cardBorder}`,
      padding: isMobile ? "12px 16px" : "18px 24px",
      display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
      <div>
        <div style={{ fontSize:"9px", letterSpacing:"2px", color:C.textDim, textTransform:"uppercase" }}>
          A.J.M. Academy
        </div>
        <div style={{ fontSize: isMobile ? "15px" : "18px", fontWeight:"700", color:C.text, marginTop:"2px" }}>
          Notice Generator
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
        <div style={{ width:"8px", height:"8px", borderRadius:"50%",
          background:C.accent, boxShadow:`0 0 10px ${C.accent}` }} />
        <span style={{ fontSize:"10px", color:C.accent, fontWeight:"600" }}>Live</span>
      </div>
    </div>
  );

  // ── Mobile layout ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, color:C.text,
        fontFamily:"'Georgia', serif", display:"flex", flexDirection:"column" }}>
        {TopBar}
        <div style={{ display:"flex", background:C.sidebar, borderBottom:`1px solid ${C.cardBorder}`, flexShrink:0 }}>
          {[{id:"form",label:"✏️ Edit"},{id:"preview",label:"👁 Preview"}].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              flex:1, padding:"12px", border:"none", cursor:"pointer",
              fontFamily:"inherit", fontSize:"13px", fontWeight:"600", background:"transparent",
              color: activeTab===t.id ? C.accent : C.textDim,
              borderBottom: activeTab===t.id ? `2px solid ${C.accent}` : "2px solid transparent",
              transition:"color 0.15s",
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{ flex:1, overflowY:"auto" }}>
          {activeTab==="form" ? FormPanel : PreviewPanel}
        </div>
      </div>
    );
  }

  // ── Desktop layout ────────────────────────────────────────────────────────
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh",
      fontFamily:"'Georgia', serif", background:C.bg, color:C.text }}>
      {TopBar}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <div style={{ width:"400px", minWidth:"400px", background:C.sidebar,
          borderRight:`1px solid ${C.cardBorder}`, overflowY:"auto" }}>
          {FormPanel}
        </div>
        <div style={{ flex:1, overflowY:"auto", background:C.bg, padding:"28px 24px",
          display:"flex", flexDirection:"column", alignItems:"center", gap:"14px" }}>
          <div style={{ fontSize:"10px", letterSpacing:"3px", color:C.textDim, textTransform:"uppercase" }}>
            Live Preview
          </div>
          <div style={{ boxShadow:"0 8px 48px rgba(0,0,0,0.5)" }}>
            <NoticePreview data={form} logoImg={logoImg} showSeal={showSeal} signatures={signatures} />
          </div>
          <div style={{ fontSize:"10px", color:C.textDim }}>
            Downloaded in black & white as shown above.
          </div>
        </div>
      </div>
    </div>
  );
}
