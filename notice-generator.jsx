import { useState, useRef, useCallback } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────
const ISSUERS = [
  { value: "management", label: "School Management", designation: "School Management", signLabel: "On Behalf of Management" },
  { value: "director",   label: "Director",           designation: "Director",          signLabel: "Director, A.J.M. Academy" },
  { value: "principal",  label: "Principal (In-Charge)", designation: "Principal (In-Charge)", signLabel: "Rukiya Bashir\nPrincipal (In-Charge)" },
];

const NOTICE_TYPES = [
  { value: "general",   label: "General Announcement" },
  { value: "holiday",   label: "Holiday / School Closure" },
  { value: "ptm",       label: "Parent-Teacher Meeting (PTM)" },
  { value: "exam",      label: "Exam Schedule" },
  { value: "fee",       label: "Fee Reminder" },
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

// ─── SVG Seal ────────────────────────────────────────────────────────────────
function SchoolSeal({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="47" fill="none" stroke="#000" strokeWidth="2.5"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#000" strokeWidth="1"/>
      <text x="50" y="20" textAnchor="middle" fontSize="7" fontWeight="bold" fontFamily="serif" fill="#000"
        style={{letterSpacing:"1px"}}>A.J.M. ACADEMY</text>
      <path d="M 15 25 A 38 38 0 0 1 85 25" fill="none" stroke="#000" strokeWidth="0.5"/>
      {/* Book icon */}
      <rect x="36" y="38" width="28" height="20" rx="1" fill="none" stroke="#000" strokeWidth="1.5"/>
      <line x1="50" y1="38" x2="50" y2="58" stroke="#000" strokeWidth="1.5"/>
      <line x1="39" y1="43" x2="48" y2="43" stroke="#000" strokeWidth="0.8"/>
      <line x1="39" y1="47" x2="48" y2="47" stroke="#000" strokeWidth="0.8"/>
      <line x1="39" y1="51" x2="48" y2="51" stroke="#000" strokeWidth="0.8"/>
      <line x1="52" y1="43" x2="61" y2="43" stroke="#000" strokeWidth="0.8"/>
      <line x1="52" y1="47" x2="61" y2="47" stroke="#000" strokeWidth="0.8"/>
      <line x1="52" y1="51" x2="61" y2="51" stroke="#000" strokeWidth="0.8"/>
      {/* Torch */}
      <line x1="50" y1="62" x2="50" y2="72" stroke="#000" strokeWidth="1.5"/>
      <ellipse cx="50" cy="61" rx="4" ry="3" fill="none" stroke="#000" strokeWidth="1"/>
      <path d="M 47 60 Q 50 55 53 60" fill="#000"/>
      <text x="50" y="83" textAnchor="middle" fontSize="5.5" fontFamily="serif" fill="#000"
        style={{letterSpacing:"0.5px"}}>KISHANGANJ · BIHAR</text>
      <path d="M 12 78 A 40 40 0 0 0 88 78" fill="none" stroke="#000" strokeWidth="0.5"/>
      <text x="50" y="92" textAnchor="middle" fontSize="4.5" fontFamily="serif" fill="#000"
        style={{letterSpacing:"1px"}}>ESTD. 2020</text>
    </svg>
  );
}

// ─── Notice Preview ───────────────────────────────────────────────────────────
function NoticePreview({ data, showSeal }) {
  const { noticeNo, date, issuer, subject, addressedTo, body, copyTo } = data;
  const issuerInfo = ISSUERS.find(i => i.value === issuer) || ISSUERS[0];
  const signLines = issuerInfo.signLabel.split("\n");

  return (
    <div
      id="notice-preview"
      style={{
        background: "#fff",
        color: "#000",
        fontFamily: "'Times New Roman', Times, serif",
        width: "700px",
        minHeight: "990px",
        padding: "48px 56px",
        boxSizing: "border-box",
        border: "3px solid #000",
        position: "relative",
      }}
    >
      {/* Outer decorative border */}
      <div style={{
        position: "absolute", top: "8px", left: "8px", right: "8px", bottom: "8px",
        border: "1px solid #000", pointerEvents: "none"
      }}/>

      {/* Header */}
      <div style={{ textAlign: "center", borderBottom: "2px solid #000", paddingBottom: "14px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "18px" }}>
          {showSeal && (
            <div style={{ flexShrink: 0 }}>
              <SchoolSeal size={82} />
            </div>
          )}
          <div>
            <div style={{ fontSize: "22px", fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase" }}>
              A.J.M. Academy
            </div>
            <div style={{ fontSize: "11px", marginTop: "2px", letterSpacing: "0.5px" }}>
              Basharat Nagar, Chhatargachh, Kishanganj, Bihar – 855107
            </div>
            <div style={{ fontSize: "10px", marginTop: "1px", color: "#333" }}>
              (Nursery to Class V | English Medium)
            </div>
          </div>
          {showSeal && <div style={{ width: "82px", flexShrink: 0 }} />}
        </div>
      </div>

      {/* NOTICE title */}
      <div style={{
        textAlign: "center", fontSize: "15px", fontWeight: "bold",
        letterSpacing: "6px", textDecoration: "underline",
        marginBottom: "18px", textTransform: "uppercase"
      }}>
        NOTICE
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "14px" }}>
        <div><strong>Notice No.:</strong> {noticeNo || "___/AJM/2025"}</div>
        <div><strong>Date:</strong> {date || "____________"}</div>
      </div>

      {/* Addressed To */}
      <div style={{ fontSize: "12px", marginBottom: "10px" }}>
        <strong>To:</strong> {addressedTo || "All Students & Parents"}
      </div>

      {/* Subject */}
      <div style={{ fontSize: "12px", marginBottom: "16px" }}>
        <strong>Subject:</strong>&nbsp;
        <span style={{ textDecoration: "underline", fontWeight: "bold" }}>
          {subject || "___________________________"}
        </span>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #000", marginBottom: "16px" }} />

      {/* Body */}
      <div style={{
        fontSize: "12.5px",
        lineHeight: "1.85",
        whiteSpace: "pre-wrap",
        textAlign: "justify",
        minHeight: "300px",
      }}>
        {body || "Notice content will appear here..."}
      </div>

      {/* Signature block */}
      <div style={{ marginTop: "40px", display: "flex", justifyContent: "flex-end" }}>
        <div style={{ textAlign: "center", minWidth: "200px" }}>
          <div style={{ borderBottom: "1px solid #000", marginBottom: "4px", paddingBottom: "24px" }}>
            {/* signature space */}
          </div>
          {signLines.map((line, i) => (
            <div key={i} style={{ fontSize: "12px", fontWeight: i === 0 ? "bold" : "normal" }}>{line}</div>
          ))}
          <div style={{ fontSize: "11px", marginTop: "2px", color: "#333" }}>{issuerInfo.designation}</div>
          <div style={{ fontSize: "11px" }}>A.J.M. Academy</div>
        </div>
      </div>

      {/* Copy To */}
      {copyTo && (
        <div style={{ marginTop: "24px", borderTop: "1px dashed #999", paddingTop: "10px", fontSize: "11px" }}>
          <strong>Copy to:</strong> {copyTo}
        </div>
      )}

      {/* Footer */}
      <div style={{
        position: "absolute", bottom: "20px", left: "56px", right: "56px",
        borderTop: "1px solid #bbb", paddingTop: "6px",
        display: "flex", justifyContent: "space-between",
        fontSize: "9.5px", color: "#555"
      }}>
        <span>A.J.M. Academy – Official Notice</span>
        <span>Confidential – For Internal Circulation</span>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function NoticeGenerator() {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric"
  });

  const [formData, setFormData] = useState({
    noticeNo: "",
    date: today,
    issuer: "principal",
    noticeType: "general",
    subject: TEMPLATES.general.subject,
    addressedTo: TEMPLATES.general.addressedTo,
    body: TEMPLATES.general.body,
    copyTo: "",
  });
  const [showSeal, setShowSeal] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const previewRef = useRef(null);

  const update = useCallback((key, val) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  }, []);

  const applyTemplate = useCallback((type) => {
    const t = TEMPLATES[type];
    setFormData(prev => ({
      ...prev,
      noticeType: type,
      subject: t.subject,
      addressedTo: t.addressedTo,
      body: t.body,
    }));
  }, []);

  // ── Download handlers (use html2canvas + jsPDF loaded from CDN) ──
  const loadScripts = () => new Promise((resolve) => {
    if (window._scriptsLoaded) { resolve(); return; }
    let loaded = 0;
    const done = () => { if (++loaded === 2) { window._scriptsLoaded = true; resolve(); } };
    const s1 = document.createElement("script");
    s1.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    s1.onload = done; document.head.appendChild(s1);
    const s2 = document.createElement("script");
    s2.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s2.onload = done; document.head.appendChild(s2);
  });

  const captureCanvas = async () => {
    const el = document.getElementById("notice-preview");
    const canvas = await window.html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
    return canvas;
  };

  const downloadJPG = async () => {
    setDownloading("jpg");
    try {
      await loadScripts();
      const canvas = await captureCanvas();
      const link = document.createElement("a");
      link.download = `AJM_Notice_${formData.noticeNo || Date.now()}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
    } catch(e) { alert("Download failed: " + e.message); }
    setDownloading(null);
  };

  const downloadPDF = async () => {
    setDownloading("pdf");
    try {
      await loadScripts();
      const canvas = await captureCanvas();
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      let w = pdfW, h = pdfW / ratio;
      if (h > pdfH) { h = pdfH; w = pdfH * ratio; }
      pdf.addImage(imgData, "JPEG", (pdfW - w) / 2, 0, w, h);
      pdf.save(`AJM_Notice_${formData.noticeNo || Date.now()}.pdf`);
    } catch(e) { alert("Download failed: " + e.message); }
    setDownloading(null);
  };

  // ── Styles ──
  const inputStyle = {
    width: "100%", padding: "7px 10px", border: "1px solid #ccc",
    borderRadius: "4px", fontFamily: "inherit", fontSize: "13px",
    boxSizing: "border-box", background: "#fff", color: "#111",
  };
  const labelStyle = { fontSize: "11px", fontWeight: "600", color: "#444", display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" };
  const sectionStyle = { marginBottom: "16px" };
  const btnBase = {
    padding: "10px 20px", border: "2px solid #000", borderRadius: "3px",
    fontFamily: "'Times New Roman', serif", fontSize: "13px", fontWeight: "bold",
    cursor: "pointer", letterSpacing: "1px", textTransform: "uppercase",
    transition: "all 0.15s",
  };

  return (
    <div style={{
      display: "flex", gap: "0", minHeight: "100vh",
      fontFamily: "'Georgia', serif",
      background: "#f0ede8",
    }}>
      {/* ── Left panel: Form ── */}
      <div style={{
        width: "340px", minWidth: "340px", background: "#1a1a1a", color: "#eee",
        padding: "24px 20px", overflowY: "auto", boxSizing: "border-box",
      }}>
        <div style={{ textAlign: "center", borderBottom: "1px solid #444", paddingBottom: "16px", marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#aaa", textTransform: "uppercase" }}>A.J.M. Academy</div>
          <div style={{ fontSize: "18px", fontWeight: "bold", marginTop: "4px", letterSpacing: "1px" }}>Notice Generator</div>
        </div>

        {/* Template picker */}
        <div style={sectionStyle}>
          <label style={{ ...labelStyle, color: "#bbb" }}>📋 Notice Template</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            {NOTICE_TYPES.map(t => (
              <button key={t.value}
                onClick={() => applyTemplate(t.value)}
                style={{
                  padding: "6px 8px", fontSize: "11px", border: "1px solid",
                  borderColor: formData.noticeType === t.value ? "#fff" : "#555",
                  background: formData.noticeType === t.value ? "#fff" : "transparent",
                  color: formData.noticeType === t.value ? "#000" : "#ccc",
                  borderRadius: "3px", cursor: "pointer", fontFamily: "inherit",
                  textAlign: "left", lineHeight: "1.3",
                }}
              >{t.label}</button>
            ))}
          </div>
        </div>

        {/* Notice No + Date */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", ...sectionStyle }}>
          <div>
            <label style={{ ...labelStyle, color: "#bbb" }}>Notice No.</label>
            <input style={{ ...inputStyle, background: "#2a2a2a", color: "#fff", border: "1px solid #444" }}
              value={formData.noticeNo}
              placeholder="001/AJM/2025"
              onChange={e => update("noticeNo", e.target.value)} />
          </div>
          <div>
            <label style={{ ...labelStyle, color: "#bbb" }}>Date</label>
            <input style={{ ...inputStyle, background: "#2a2a2a", color: "#fff", border: "1px solid #444" }}
              value={formData.date}
              onChange={e => update("date", e.target.value)} />
          </div>
        </div>

        {/* Issued By */}
        <div style={sectionStyle}>
          <label style={{ ...labelStyle, color: "#bbb" }}>Issued By</label>
          <select style={{ ...inputStyle, background: "#2a2a2a", color: "#fff", border: "1px solid #444" }}
            value={formData.issuer}
            onChange={e => update("issuer", e.target.value)}>
            {ISSUERS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
        </div>

        {/* Addressed To */}
        <div style={sectionStyle}>
          <label style={{ ...labelStyle, color: "#bbb" }}>Addressed To</label>
          <input style={{ ...inputStyle, background: "#2a2a2a", color: "#fff", border: "1px solid #444" }}
            value={formData.addressedTo}
            onChange={e => update("addressedTo", e.target.value)} />
        </div>

        {/* Subject */}
        <div style={sectionStyle}>
          <label style={{ ...labelStyle, color: "#bbb" }}>Subject</label>
          <input style={{ ...inputStyle, background: "#2a2a2a", color: "#fff", border: "1px solid #444" }}
            value={formData.subject}
            onChange={e => update("subject", e.target.value)} />
        </div>

        {/* Body */}
        <div style={sectionStyle}>
          <label style={{ ...labelStyle, color: "#bbb" }}>Notice Body (Hindi / English)</label>
          <textarea
            style={{ ...inputStyle, background: "#2a2a2a", color: "#fff", border: "1px solid #444", minHeight: "200px", resize: "vertical", lineHeight: "1.6" }}
            value={formData.body}
            onChange={e => update("body", e.target.value)}
          />
        </div>

        {/* Copy To */}
        <div style={sectionStyle}>
          <label style={{ ...labelStyle, color: "#bbb" }}>Copy To (optional)</label>
          <input style={{ ...inputStyle, background: "#2a2a2a", color: "#fff", border: "1px solid #444" }}
            value={formData.copyTo}
            placeholder="e.g. Notice Board, All Class Teachers"
            onChange={e => update("copyTo", e.target.value)} />
        </div>

        {/* Show Seal toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <input type="checkbox" id="sealToggle" checked={showSeal}
            onChange={e => setShowSeal(e.target.checked)}
            style={{ width: "16px", height: "16px", cursor: "pointer" }} />
          <label htmlFor="sealToggle" style={{ fontSize: "12px", color: "#bbb", cursor: "pointer" }}>Show School Seal / Logo</label>
        </div>

        {/* Download buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={downloadPDF}
            disabled={!!downloading}
            style={{ ...btnBase, flex: 1, background: downloading === "pdf" ? "#555" : "#fff", color: "#000" }}
          >
            {downloading === "pdf" ? "..." : "⬇ PDF"}
          </button>
          <button
            onClick={downloadJPG}
            disabled={!!downloading}
            style={{ ...btnBase, flex: 1, background: "transparent", color: "#fff" }}
          >
            {downloading === "jpg" ? "..." : "⬇ JPG"}
          </button>
        </div>

        <div style={{ marginTop: "16px", fontSize: "10px", color: "#666", lineHeight: "1.5" }}>
          Tip: Fill in the blanks (________) in the body with actual details before downloading.
        </div>
      </div>

      {/* ── Right panel: Preview ── */}
      <div style={{
        flex: 1, padding: "32px 28px", overflowY: "auto",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "16px",
      }}>
        <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#888" }}>
          Live Preview
        </div>
        <div ref={previewRef} style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.18)" }}>
          <NoticePreview data={formData} showSeal={showSeal} />
        </div>
        <div style={{ fontSize: "10px", color: "#aaa" }}>
          The notice will be downloaded in black &amp; white as shown above.
        </div>
      </div>
    </div>
  );
}
