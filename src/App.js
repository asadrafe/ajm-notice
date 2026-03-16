import { useState, useRef, useCallback } from "react";

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
  const mini = (bg, col) => ({
    padding: "4px 10px", background: bg, color: col,
    border: `1px solid ${col}`, borderRadius: "3px",
    fontSize: "11px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
  });
  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleChange} />
      {value ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src={value} alt={label} style={{
            height: `${previewHeight}px`, maxWidth: "130px", objectFit: "contain",
            border: "1px solid #444", borderRadius: "3px", background: "#fff", padding: "3px"
          }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <button style={mini("#2a2a2a", "#aaa")} onClick={() => fileRef.current.click()}>Replace</button>
            <button style={mini("#3a1010", "#f77")} onClick={onClear}>Remove</button>
          </div>
        </div>
      ) : (
        <button style={mini("#0f2a0f", "#6f6")} onClick={() => fileRef.current.click()}>
          ↑ Upload {label}
        </button>
      )}
    </div>
  );
}

// ─── Notice Preview ───────────────────────────────────────────────────────────
function NoticePreview({ data, logoImg, showSeal, signatures }) {
  const { noticeNo, date, issuer, subject, addressedTo, body, copyTo } = data;
  const issuerInfo = ISSUERS.find(i => i.value === issuer) || ISSUERS[0];
  const signLines = issuerInfo.signLabel.split("\n");
  const sigImg = signatures[issuer] || null;

  return (
    <div id="notice-preview" style={{
      background: "#fff", color: "#000",
      fontFamily: "'Times New Roman', Times, serif",
      width: "700px", minHeight: "990px",
      padding: "48px 56px", boxSizing: "border-box",
      border: "3px solid #000", position: "relative",
    }}>
      <div style={{ position:"absolute", top:"8px", left:"8px", right:"8px", bottom:"8px",
        border:"1px solid #000", pointerEvents:"none" }} />

      {/* Header */}
      <div style={{ textAlign:"center", borderBottom:"2px solid #000", paddingBottom:"14px", marginBottom:"16px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"18px" }}>
          <div style={{ flexShrink:0, width:"84px", display:"flex", justifyContent:"center", alignItems:"center" }}>
            {logoImg
              ? <img src={logoImg} alt="Logo" style={{ width:"84px", height:"84px", objectFit:"contain" }} />
              : showSeal ? <SchoolSeal size={84} /> : <div style={{ width:"84px" }} />
            }
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"22px", fontWeight:"bold", letterSpacing:"2px", textTransform:"uppercase" }}>
              A.J.M. Academy
            </div>
            <div style={{ fontSize:"11px", marginTop:"2px", letterSpacing:"0.5px" }}>
              Basharat Nagar, Chhatargachh, Kishanganj, Bihar – 855107
            </div>
            <div style={{ fontSize:"10px", marginTop:"1px", color:"#333" }}>
              (Nursery to Class V &nbsp;|&nbsp; English Medium)
            </div>
          </div>
          <div style={{ width:"84px", flexShrink:0 }} />
        </div>
      </div>

      <div style={{ textAlign:"center", fontSize:"15px", fontWeight:"bold",
        letterSpacing:"6px", textDecoration:"underline",
        marginBottom:"18px", textTransform:"uppercase" }}>NOTICE</div>

      <div style={{ display:"flex", justifyContent:"space-between", fontSize:"12px", marginBottom:"14px" }}>
        <div><strong>Notice No.:</strong> {noticeNo || "___/AJM/2025"}</div>
        <div><strong>Date:</strong> {date || "____________"}</div>
      </div>

      <div style={{ fontSize:"12px", marginBottom:"10px" }}>
        <strong>To:</strong> {addressedTo || "All Students & Parents"}
      </div>

      <div style={{ fontSize:"12px", marginBottom:"16px" }}>
        <strong>Subject:</strong>&nbsp;
        <span style={{ textDecoration:"underline", fontWeight:"bold" }}>
          {subject || "___________________________"}
        </span>
      </div>

      <div style={{ borderTop:"1px solid #000", marginBottom:"16px" }} />

      <div style={{ fontSize:"12.5px", lineHeight:"1.85", whiteSpace:"pre-wrap",
        textAlign:"justify", minHeight:"300px" }}>
        {body || "Notice content will appear here..."}
      </div>

      {/* Signature */}
      <div style={{ marginTop:"44px", display:"flex", justifyContent:"flex-end" }}>
        <div style={{ textAlign:"center", minWidth:"200px" }}>
          <div style={{ height:"60px", display:"flex", alignItems:"flex-end", justifyContent:"center", marginBottom:"6px" }}>
            {sigImg
              ? <img src={sigImg} alt="Signature"
                  style={{ maxHeight:"58px", maxWidth:"190px", objectFit:"contain", filter:"grayscale(100%) contrast(120%)" }} />
              : <div style={{ borderBottom:"1px solid #000", width:"190px" }} />
            }
          </div>
          {signLines.map((line, i) => (
            <div key={i} style={{ fontSize:"12px", fontWeight: i===0 ? "bold" : "normal", lineHeight:"1.6" }}>{line}</div>
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

      <div style={{
        position:"absolute", bottom:"20px", left:"56px", right:"56px",
        borderTop:"1px solid #bbb", paddingTop:"5px",
        display:"flex", justifyContent:"space-between", fontSize:"9.5px", color:"#666"
      }}>
        <span>A.J.M. Academy – Official Notice</span>
        <span>Confidential – For Internal Circulation</span>
      </div>
    </div>
  );
}

// ─── Responsive hook ─────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 900);
  useState(() => {
    const handler = () => setMobile(window.innerWidth < 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  });
  return mobile;
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const today = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("form"); // "form" | "preview"

  const [form, setForm] = useState({
    noticeNo:"", date:today, issuer:"principal",
    noticeType:"general",
    subject: TEMPLATES.general.subject,
    addressedTo: TEMPLATES.general.addressedTo,
    body: TEMPLATES.general.body,
    copyTo:"",
  });

  const [logoImg, setLogoImg]       = useState(null);
  const [showSeal, setShowSeal]     = useState(true);
  const [signatures, setSignatures] = useState({});
  const [downloading, setDownloading] = useState(null);

  const upd = useCallback((k, v) => setForm(p => ({ ...p, [k]: v })), []);

  const applyTemplate = (type) => {
    const t = TEMPLATES[type];
    setForm(p => ({ ...p, noticeType:type, subject:t.subject, addressedTo:t.addressedTo, body:t.body }));
  };

  const setSig   = (key, url) => setSignatures(p => ({ ...p, [key]: url }));
  const clearSig = (key)      => setSignatures(p => { const n={...p}; delete n[key]; return n; });

  const loadScripts = () => new Promise(resolve => {
    if (window.__ajmScripts) { resolve(); return; }
    let n = 0;
    const done = () => { if (++n === 2) { window.__ajmScripts = true; resolve(); } };
    ["https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
     "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"]
      .forEach(src => { const s = document.createElement("script"); s.src = src; s.onload = done; document.head.appendChild(s); });
  });

  const capture = async () => {
    const el = document.getElementById("notice-preview");
    return window.html2canvas(el, { scale:2, useCORS:true, backgroundColor:"#ffffff", logging:false });
  };

  const downloadJPG = async () => {
    setDownloading("jpg");
    try {
      await loadScripts();
      const c = await capture();
      const a = document.createElement("a");
      a.download = `AJM_Notice_${form.noticeNo || Date.now()}.jpg`;
      a.href = c.toDataURL("image/jpeg", 0.95);
      a.click();
    } catch(e) { alert("Download failed: " + e.message); }
    setDownloading(null);
  };

  const downloadPDF = async () => {
    setDownloading("pdf");
    try {
      await loadScripts();
      const c = await capture();
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
      const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
      const ratio = c.width / c.height;
      let w = pw, h = pw / ratio;
      if (h > ph) { h = ph; w = ph * ratio; }
      pdf.addImage(c.toDataURL("image/jpeg",1), "JPEG", (pw-w)/2, 0, w, h);
      pdf.save(`AJM_Notice_${form.noticeNo || Date.now()}.pdf`);
    } catch(e) { alert("Download failed: " + e.message); }
    setDownloading(null);
  };

  const di = { width:"100%", padding:"9px 12px", border:"1px solid #444",
    borderRadius:"4px", fontFamily:"inherit", fontSize:"14px",
    boxSizing:"border-box", background:"#2a2a2a", color:"#fff" };
  const lbl = { fontSize:"11px", fontWeight:"600", color:"#bbb", display:"block",
    marginBottom:"6px", textTransform:"uppercase", letterSpacing:"0.5px" };
  const sec = { marginBottom:"18px" };
  const hr  = { borderTop:"1px solid #2e2e2e", margin:"18px 0" };
  const card = { background:"#222", borderRadius:"6px", padding:"14px", marginBottom:"18px" };

  const currentIssuer = ISSUERS.find(i => i.value === form.issuer);

  // ── The form panel content (shared between mobile/desktop) ──
  const FormContent = (
    <div style={{ padding: isMobile ? "16px" : "22px 18px" }}>
      <div style={sec}>
        <label style={lbl}>📋 Template</label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
          {NOTICE_TYPES.map(t => (
            <button key={t.value} onClick={() => applyTemplate(t.value)} style={{
              padding:"8px 10px", fontSize:"12px", cursor:"pointer", fontFamily:"inherit",
              textAlign:"left", lineHeight:"1.4", borderRadius:"4px",
              border:`1px solid ${form.noticeType===t.value ? "#fff" : "#3a3a3a"}`,
              background: form.noticeType===t.value ? "#fff" : "transparent",
              color:       form.noticeType===t.value ? "#000" : "#aaa",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={hr} />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", ...sec }}>
        <div>
          <label style={lbl}>Notice No.</label>
          <input style={di} value={form.noticeNo} placeholder="001/AJM/2025"
            onChange={e => upd("noticeNo", e.target.value)} />
        </div>
        <div>
          <label style={lbl}>Date</label>
          <input style={di} value={form.date} onChange={e => upd("date", e.target.value)} />
        </div>
      </div>

      <div style={sec}>
        <label style={lbl}>Issued By</label>
        <select style={di} value={form.issuer} onChange={e => upd("issuer", e.target.value)}>
          {ISSUERS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
        </select>
      </div>

      {currentIssuer?.canUploadSig && (
        <div style={card}>
          <label style={{ ...lbl, marginBottom:"10px" }}>✍️ Signature — {currentIssuer.label}</label>
          <ImageUploadBtn
            label="Signature"
            value={signatures[form.issuer] || null}
            onUpload={url => setSig(form.issuer, url)}
            onClear={() => clearSig(form.issuer)}
            previewHeight={48}
          />
          <div style={{ fontSize:"10px", color:"#555", marginTop:"8px" }}>
            PNG with transparent background recommended.
          </div>
        </div>
      )}

      <div style={hr} />

      <div style={sec}>
        <label style={lbl}>Addressed To</label>
        <input style={di} value={form.addressedTo} onChange={e => upd("addressedTo", e.target.value)} />
      </div>

      <div style={sec}>
        <label style={lbl}>Subject</label>
        <input style={di} value={form.subject} onChange={e => upd("subject", e.target.value)} />
      </div>

      <div style={sec}>
        <label style={lbl}>Notice Body (Hindi / English)</label>
        <textarea style={{ ...di, minHeight:"200px", resize:"vertical", lineHeight:"1.7" }}
          value={form.body} onChange={e => upd("body", e.target.value)} />
      </div>

      <div style={sec}>
        <label style={lbl}>Copy To (optional)</label>
        <input style={di} value={form.copyTo} placeholder="Notice Board, All Class Teachers"
          onChange={e => upd("copyTo", e.target.value)} />
      </div>

      <div style={hr} />

      <div style={card}>
        <label style={{ ...lbl, marginBottom:"10px" }}>🏫 School Logo</label>
        <ImageUploadBtn
          label="Logo"
          value={logoImg}
          onUpload={setLogoImg}
          onClear={() => setLogoImg(null)}
          previewHeight={64}
        />
        {!logoImg && (
          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"10px" }}>
            <input type="checkbox" id="sealChk" checked={showSeal}
              onChange={e => setShowSeal(e.target.checked)}
              style={{ width:"15px", height:"15px", cursor:"pointer" }} />
            <label htmlFor="sealChk" style={{ fontSize:"12px", color:"#888", cursor:"pointer" }}>
              Show placeholder SVG seal
            </label>
          </div>
        )}
        <div style={{ fontSize:"10px", color:"#555", marginTop:"8px" }}>
          Square PNG recommended. Replaces SVG seal.
        </div>
      </div>

      {/* Download buttons */}
      <div style={{ display:"flex", gap:"10px" }}>
        <button onClick={downloadPDF} disabled={!!downloading} style={{
          flex:1, padding:"13px 0", border:"2px solid #fff",
          background: downloading==="pdf" ? "#444" : "#fff",
          color: downloading==="pdf" ? "#aaa" : "#000",
          fontFamily:"inherit", fontSize:"14px", fontWeight:"bold",
          cursor:"pointer", letterSpacing:"1px", textTransform:"uppercase", borderRadius:"4px",
        }}>
          {downloading==="pdf" ? "Generating…" : "⬇ PDF"}
        </button>
        <button onClick={downloadJPG} disabled={!!downloading} style={{
          flex:1, padding:"13px 0", border:"2px solid #555",
          background:"transparent", color: downloading==="jpg" ? "#666" : "#bbb",
          fontFamily:"inherit", fontSize:"14px", fontWeight:"bold",
          cursor:"pointer", letterSpacing:"1px", textTransform:"uppercase", borderRadius:"4px",
        }}>
          {downloading==="jpg" ? "Generating…" : "⬇ JPG"}
        </button>
      </div>

      <div style={{ marginTop:"12px", fontSize:"11px", color:"#555", lineHeight:"1.6" }}>
        Tip: Replace __________ blanks with actual details before downloading.
      </div>
    </div>
  );

  // ── Mobile layout: tabs ──
  if (isMobile) {
    return (
      <div style={{ minHeight:"100vh", fontFamily:"'Georgia', serif", background:"#1a1a1a", color:"#eee" }}>

        {/* Top bar */}
        <div style={{ background:"#111", padding:"14px 16px", textAlign:"center",
          borderBottom:"1px solid #2e2e2e" }}>
          <div style={{ fontSize:"9px", letterSpacing:"3px", color:"#666", textTransform:"uppercase" }}>A.J.M. Academy</div>
          <div style={{ fontSize:"16px", fontWeight:"bold", marginTop:"2px" }}>Notice Generator</div>
        </div>

        {/* Tab switcher */}
        <div style={{ display:"flex", borderBottom:"2px solid #2e2e2e", background:"#111" }}>
          {["form","preview"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex:1, padding:"12px", border:"none", cursor:"pointer",
              fontFamily:"inherit", fontSize:"13px", fontWeight:"bold",
              letterSpacing:"1px", textTransform:"uppercase",
              background: activeTab===tab ? "#1a1a1a" : "#111",
              color: activeTab===tab ? "#fff" : "#555",
              borderBottom: activeTab===tab ? "2px solid #fff" : "2px solid transparent",
              marginBottom:"-2px",
            }}>
              {tab === "form" ? "✏️ Edit" : "👁 Preview"}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "form" ? (
          <div style={{ overflowY:"auto", paddingBottom:"30px" }}>
            {FormContent}
          </div>
        ) : (
          <div style={{ padding:"16px", overflowX:"auto", background:"#f0ede8" }}>
            <div style={{ fontSize:"10px", letterSpacing:"2px", color:"#999",
              textTransform:"uppercase", textAlign:"center", marginBottom:"12px" }}>
              Live Preview — scroll right if needed
            </div>
            {/* Scale down notice for mobile preview */}
            <div style={{ transformOrigin:"top left",
              transform:`scale(${Math.min(1, (window.innerWidth - 32) / 700)})`,
              width:"700px", marginBottom: `-${700 - Math.min(700, window.innerWidth - 32)}px` }}>
              <div style={{ boxShadow:"0 4px 24px rgba(0,0,0,0.15)" }}>
                <NoticePreview data={form} logoImg={logoImg} showSeal={showSeal} signatures={signatures} />
              </div>
            </div>
            <div style={{ marginTop:"16px", display:"flex", gap:"10px" }}>
              <button onClick={downloadPDF} disabled={!!downloading} style={{
                flex:1, padding:"13px 0", border:"2px solid #1a1a1a",
                background: downloading==="pdf" ? "#ccc" : "#1a1a1a",
                color:"#fff", fontFamily:"inherit", fontSize:"14px",
                fontWeight:"bold", cursor:"pointer", borderRadius:"4px",
                letterSpacing:"1px", textTransform:"uppercase",
              }}>
                {downloading==="pdf" ? "Generating…" : "⬇ PDF"}
              </button>
              <button onClick={downloadJPG} disabled={!!downloading} style={{
                flex:1, padding:"13px 0", border:"2px solid #1a1a1a",
                background:"transparent", color:"#1a1a1a", fontFamily:"inherit",
                fontSize:"14px", fontWeight:"bold", cursor:"pointer", borderRadius:"4px",
                letterSpacing:"1px", textTransform:"uppercase",
              }}>
                {downloading==="jpg" ? "Generating…" : "⬇ JPG"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Desktop layout: side by side ──
  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'Georgia', serif", background:"#f0ede8" }}>
      <div style={{ width:"360px", minWidth:"360px", background:"#1a1a1a", color:"#eee",
        overflowY:"auto", boxSizing:"border-box" }}>
        <div style={{ textAlign:"center", borderBottom:"1px solid #2e2e2e", padding:"18px 18px 14px" }}>
          <div style={{ fontSize:"10px", letterSpacing:"3px", color:"#666", textTransform:"uppercase" }}>A.J.M. Academy</div>
          <div style={{ fontSize:"17px", fontWeight:"bold", marginTop:"4px", letterSpacing:"1px" }}>Notice Generator</div>
        </div>
        {FormContent}
      </div>

      <div style={{ flex:1, padding:"30px 24px", overflowY:"auto",
        display:"flex", flexDirection:"column", alignItems:"center", gap:"14px" }}>
        <div style={{ fontSize:"10px", letterSpacing:"3px", color:"#999", textTransform:"uppercase" }}>
          Live Preview
        </div>
        <div style={{ boxShadow:"0 8px 48px rgba(0,0,0,0.14)" }}>
          <NoticePreview data={form} logoImg={logoImg} showSeal={showSeal} signatures={signatures} />
        </div>
        <div style={{ fontSize:"10px", color:"#bbb" }}>
          Downloaded in black &amp; white as shown above.
        </div>
      </div>
    </div>
  );
}
