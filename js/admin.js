/* ============================================================
   لوحة تحكم منتجعات ماربيلا — منطق كامل
   المصادقة عبر Firebase Authentication + CRUD على Firestore.
   ملاحظة: AR_MONTHS/AR_DOW/pad/toISO من data.js عبر store (مصدر مشترك)
   ============================================================ */

const store = window.MarbellaStore;
let calUnitId = null, calDate = new Date();
let cachedBookings = [];
let _bookingsUnsub = null;
let bookingsLoadError = "";

/* الحجوزات التي مضى على تاريخها أكثر من هذه المدة تُحذف تلقائياً عند دخول اللوحة —
   لكن بعد **أرشفة** عددها وإيرادها في stats/main حتى تبقى الأرقام التاريخية
   الحقيقية في لوحة المعلومات للأبد (لا تنقص الإجماليات كل شهر). */
const AUTO_PURGE_DAYS = 30;
let cachedStats = { totalBookings: 0, totalRevenue: 0 };

const LOGO_OPTIONS = [
  { label:"اللوقو الحالي", path:"assets/images/logo.png" },
  { label:"كلاسيك", path:"assets/images/logos/marbella-classic.jpeg" },
  { label:"العيد", path:"assets/images/logos/marbella-eid-sheep.jpeg" },
  { label:"الصيف", path:"assets/images/logos/marbella-summer.jpeg" },
  { label:"رمضان", path:"assets/images/logos/marbella-ramadan.jpeg" },
  { label:"استوائي", path:"assets/images/logos/marbella-tropical.jpeg" }
];

function bookingVal(b, key){
  return String((b && b[key] != null) ? b[key] : "");
}
function bookingPrice(b){
  const n = Number(bookingVal(b, "price").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
function bookingDateLabel(value){
  if(!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString("ar");
}
function applyAdminLogo(path){
  const src = path || "assets/images/logo.png";
  document.querySelectorAll(".login-logo, .sidebar-brand img").forEach(img => { img.src = src; });
}

/* ===== أدوات ===== */
function toast(msg,isErr){
  let t=document.querySelector(".a-toast");
  if(!t){t=document.createElement("div");document.body.appendChild(t);}
  t.className="a-toast"+(isErr?" err":"");t.textContent=msg;
  clearTimeout(t._tm);t._tm=setTimeout(()=>t.remove(),4000);
}
/* رسالة خطأ موحّدة لعمليات الحفظ في Firestore مع سبب واضح */
function saveError(e){
  console.error("save failed", e);
  const code = e && e.code ? e.code : "";
  if(code === "permission-denied"){
    return "لم تُحفظ التعديلات: لا صلاحية كتابة. تأكد من تسجيل الدخول بحساب الأدمن ومن قواعد Firestore.";
  }
  if(code === "unavailable" || code === "network-request-failed" || (typeof navigator !== "undefined" && !navigator.onLine)){
    return "لم تُحفظ التعديلات: تحقّق من اتصال الإنترنت ثم أعد المحاولة.";
  }
  return "لم تُحفظ التعديلات في قاعدة البيانات (" + (code || "خطأ غير معروف") + ").";
}
// esc() مُعرّفة في js/utils.js (عامة) وتُحمَّل قبل admin.js عبر firebase-loader.js

/* ===== المصادقة عبر Firebase Auth =====
   الدخول حصرياً بحساب الأدمن (Email/Password) في Firebase Authentication
   حتى تملك الجلسة صلاحية الكتابة بموجب قواعد الأمان. */
// ADMIN_EMAIL مُعرَّف مسبقاً في firebase-config.js — نستخدمه مباشرة عبر window
const _ADMIN_EMAIL = window.ADMIN_EMAIL;

async function enterAdmin(){
  await store.initData();     // تحميل الإعدادات والاستراحات من Firestore
  // إصلاح ذاتي: ضمّن بريد الأدمن ومفتاح ImgBB في settings/main (دمج — لا مسح)
  // حتى لا يُفقدا حتى لو لم يفتح الأدمن نموذج الإعدادات إطلاقاً
  try{
    const s0 = store.getSettings();
    const heal = {};
    if(s0.adminEmail) heal.adminEmail = s0.adminEmail;
    if(s0.imgbbKey) heal.imgbbKey = s0.imgbbKey;
    if(window.db && Object.keys(heal).length) await db.collection("settings").doc("main").set(heal, { merge:true });
  }catch(e){ console.warn("settings heal failed", e); }
  try{
    cachedBookings = await store.getBookings();
    bookingsLoadError = "";
  }catch(e){
    console.error("bookings load failed", e);
    cachedBookings = [];
    bookingsLoadError = bookingsErrorMessage(e);
  }
  purgeOldBookings();          // تنظيف تلقائي مع أرشفة — بالخلفية لا يحجب اللوحة
  // تحميل الإجماليات المؤرشفة (عدد/إيراد الحجوزات المحذوفة تلقائياً)
  try{
    const sd = await db.collection("stats").doc("main").get();
    if(sd.exists){
      const d = sd.data()||{};
      cachedStats = { totalBookings:+d.totalBookings||0, totalRevenue:+d.totalRevenue||0 };
    }
  }catch(e){ console.warn("stats load failed", e); }
  await loadReviews();        // تحميل التقييمات
  if(_bookingsUnsub){ _bookingsUnsub(); _bookingsUnsub = null; }
  // اشتراك لحظي على الحجوزات: نستخدم بيانات اللقطة مباشرة (لا جلب مكرر قد يفشل)
  if(window.db){
    _bookingsUnsub = db.collection("bookings").onSnapshot(snap => {
      const bks = [];
      snap.forEach(d => { const data = d.data(); data.id = d.id; bks.push(data); });
      bks.sort((a,b)=> String(b.createdAt||"").localeCompare(String(a.createdAt||"")));
      cachedBookings = bks;
      bookingsLoadError = "";
      const active = document.querySelector(".section.active");
      if(active) renderAll();
    }, err => {
      console.warn("bookings snapshot error", err);
      bookingsLoadError = bookingsErrorMessage(err);
      renderAll();
    });
  }
  showAdmin();
}

/* تنظيف تلقائي مع أرشفة: قبل حذف الحجوزات المنتهية نجمع عددها وإيرادها
   في مستند stats/main (تراكمي دائم). ترتيب العمليات مهم: الأرشفة أولاً —
   إن فشلت (مثلاً قواعد قديمة بلا stats) لا يُحذف شيء حفاظاً على الأرقام. */
async function purgeOldBookings(){
  if(!window.db || !Array.isArray(cachedBookings)) return;
  const cutoff = new Date(); cutoff.setHours(0,0,0,0);
  cutoff.setDate(cutoff.getDate() - AUTO_PURGE_DAYS);
  const cutoffISO = toISO(cutoff);
  // مقارنة نصوص ISO (YYYY-MM-DD) أبجدياً صحيحة زمنياً
  const old = cachedBookings.filter(b=>{
    const d = String(b.date || b.createdAt || "").slice(0,10);
    return d && d < cutoffISO;
  });
  if(!old.length) return;
  try{
    // 1) أرشفة الإجماليات أولاً (increment ذرّي — آمن مع تعدد الجلسات)
    const cnt = old.length;
    const rev = old.reduce((s,b)=>s+bookingPrice(b), 0);
    await db.collection("stats").doc("main").set({
      totalBookings: firebase.firestore.FieldValue.increment(cnt),
      totalRevenue:  firebase.firestore.FieldValue.increment(rev),
      updatedAt: new Date().toISOString()
    }, { merge:true });
    cachedStats.totalBookings = (cachedStats.totalBookings||0) + cnt;
    cachedStats.totalRevenue  = (cachedStats.totalRevenue||0) + rev;
    // 2) ثم الحذف على دفعات (حد 500 عملية لكل batch)
    for(let i=0;i<old.length;i+=400){
      const batch = db.batch();
      old.slice(i,i+400).forEach(b=>batch.delete(db.collection("bookings").doc(String(b.id))));
      await batch.commit();
    }
    const removed = new Set(old.map(b=>b.id));
    cachedBookings = cachedBookings.filter(b=>!removed.has(b.id));
    renderAll();
    toast(`أُرشف ${cnt} حجزاً منتهياً (${rev.toLocaleString("ar")} درهم) ثم حُذف — الإجماليات محفوظة`);
  }catch(e){ console.warn("auto purge failed (kept bookings intact)", e); }
}

/* رسالة خطأ دقيقة لفشل تحميل الحجوزات — توضّح السبب والحل */
function bookingsErrorMessage(e){
  const code = e && e.code ? e.code : "";
  if(code === "permission-denied"){
    return "قواعد Firestore تمنع قراءة الحجوزات. انشر القواعد من ملف firestore.rules (أو من README) في Firebase Console ← Firestore ← Rules.";
  }
  if(code === "unavailable" || code === "network-request-failed" || (typeof navigator !== "undefined" && !navigator.onLine)){
    return "تعذّر الاتصال بقاعدة البيانات. تحقّق من الإنترنت ثم أعد المحاولة.";
  }
  if(code === "failed-precondition" || code === "unimplemented"){
    return "تعذّر تحميل الحجوزات: أغلق التبويبات الأخرى للموقع ثم حدّث الصفحة.";
  }
  return "تعذّر تحميل الحجوزات (" + (code || "خطأ غير معروف") + ").";
}

/* إعادة محاولة تحميل الحجوزات يدوياً */
async function retryBookings(){
  bookingsLoadError = "";
  renderAll();
  try{
    cachedBookings = await store.getBookings();
    bookingsLoadError = "";
  }catch(e){
    console.error("bookings retry failed", e);
    bookingsLoadError = bookingsErrorMessage(e);
  }
  renderAll();
}

document.getElementById("login-form").addEventListener("submit",async e=>{
  e.preventDefault();
  const pass=document.getElementById("admin-pass").value.trim();
  const err=document.getElementById("login-error");
  const info=document.getElementById("login-info");
  err.textContent=""; info.textContent="";
  try{
    await auth.signInWithEmailAndPassword(_ADMIN_EMAIL, pass);
    // onAuthStateChanged سيتولّى عرض اللوحة
  }catch(ex){
    const code = ex && ex.code ? ex.code : "";
    let msg = "تعذّر تسجيل الدخول";
    if(code==="auth/invalid-credential"||code==="auth/wrong-password"||code==="auth/user-not-found") msg="كلمة المرور غير صحيحة.";
    else if(code==="auth/too-many-requests") msg="محاولات كثيرة، حاول لاحقاً";
    else if(code==="auth/network-request-failed") msg="تحقّق من اتصال الإنترنت";
    err.textContent=msg;
    document.getElementById("admin-pass").value="";
  }
});

document.getElementById("reset-pass-link").addEventListener("click",async ()=>{
  const info=document.getElementById("login-info");
  const err=document.getElementById("login-error");
  err.textContent=""; info.textContent="";
  try{
    await auth.sendPasswordResetEmail(_ADMIN_EMAIL);
    info.textContent="تم إرسال رابط استعادة كلمة المرور إلى بريد الأدمن.";
  }catch(ex){
    err.textContent="تعذّر إرسال رابط الاستعادة. تأكد من تفعيل Email/Password في Firebase.";
  }
});

document.getElementById("logout-btn").addEventListener("click",async ()=>{
  if(auth.currentUser && !auth.currentUser.isAnonymous) await auth.signOut();
  document.getElementById("admin-view").hidden=true;
  document.getElementById("login-view").style.display="grid";
  document.getElementById("admin-pass").value="";
});

// بوابة العرض حسب حالة المصادقة
auth.onAuthStateChanged(async (user) => {
  if(user && !user.isAnonymous && user.email === _ADMIN_EMAIL){
    await enterAdmin();
  } else {
    if(_bookingsUnsub){ _bookingsUnsub(); _bookingsUnsub = null; }
    document.getElementById("admin-view").hidden=true;
    document.getElementById("login-view").style.display="grid";
    document.getElementById("admin-pass").value="";
  }
});

function showAdmin(){
  document.getElementById("login-view").style.display="none";
  document.getElementById("admin-view").hidden=false;
  renderAll();
}

/* ===== التبويبات ===== */
document.querySelectorAll(".nav-item").forEach(item=>{
  item.addEventListener("click",()=>{
    document.querySelectorAll(".nav-item").forEach(n=>n.classList.remove("active"));
    item.classList.add("active");
    const tab=item.dataset.tab;
    document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
    document.getElementById("sec-"+tab).classList.add("active");
    const titles={dashboard:"لوحة المعلومات",dates:"التواريخ المحجوزة",units:"بيانات الاستراحات",bookings:"سجل الحجوزات",reviews:"تقييمات الضيوف",settings:"الإعدادات"};
    document.getElementById("page-title").textContent=titles[tab];
  });
});

/* ===== Dashboard ===== */
function renderDashboard(){
  const bookings=Array.isArray(cachedBookings) ? cachedBookings : [];
  const units=store.getUnits();

  const confirmedKeys=new Set();
  const perUnit={};
  let totalBookings=0, totalRev=0;
  units.forEach(u=>{
    perUnit[u.id]=0;
    (u.booked||[]).forEach(iso=>{
      confirmedKeys.add(u.id+"|"+iso);
      totalBookings++;
      totalRev += (+unitPriceFor(u, "night", isWeekendDate(iso))||0);
      perUnit[u.id]++;
    });
  });
  bookings.forEach(b=>{
    const key=(b.unitId||"")+"|"+(b.date||"");
    if(confirmedKeys.has(key)) return;
    totalBookings++; totalRev+=bookingPrice(b);
    const uid=(b.unitId && perUnit[b.unitId]!=null)?b.unitId:(units.find(u=>u.name===b.unitName)||{}).id;
    if(uid && perUnit[uid]!=null) perUnit[uid]++;
  });

  // أضِف الإجماليات المؤرشفة (الحجوزات المحذوفة تلقائياً) — الأرقام الحقيقية الكاملة
  const archivedN = cachedStats.totalBookings||0, archivedRev = cachedStats.totalRevenue||0;
  totalBookings += archivedN; totalRev += archivedRev;

  const now=new Date();now.setHours(0,0,0,0);
  const in30=new Date(now);in30.setDate(in30.getDate()+30);
  const occCount = units.reduce((s,u)=>s+(u.booked||[]).filter(iso=>{const d=new Date(iso);return d>=now&&d<in30;}).length,0);
  const occPct = units.length ? Math.min(100, Math.round(occCount/(units.length*30)*100)) : 0;

  document.getElementById("dash-stats").innerHTML=`
    <div class="stat-card"><div class="sc-top"><span class="sc-label">إجمالي الحجوزات</span><span class="sc-icon"><i class="fa-solid fa-receipt"></i></span></div><div class="sc-val">${totalBookings}</div></div>
    <div class="stat-card"><div class="sc-top"><span class="sc-label">الإيرادات المتوقعة</span><span class="sc-icon"><i class="fa-solid fa-coins"></i></span></div><div class="sc-val">${totalRev.toLocaleString("ar")} <small>درهم</small></div></div>
    <div class="stat-card"><div class="sc-top"><span class="sc-label">الإشغال (30 يوم)</span><span class="sc-icon"><i class="fa-solid fa-chart-line"></i></span></div><div class="sc-val">${occPct}%</div><div class="sc-trend">${units.length} استراحات</div></div>
    <div class="stat-card"><div class="sc-top"><span class="sc-label">استراحات نشطة</span><span class="sc-icon"><i class="fa-solid fa-house"></i></span></div><div class="sc-val">${units.length}</div></div>`;

  const counts = units.map(u=>({name:u.name, n:perUnit[u.id]||0}));
  const max = Math.max(1,...counts.map(c=>c.n));
  const chartCard=document.querySelector(".chart-card");
  chartCard.querySelector(".chart-x")?.remove();
  document.getElementById("dash-chart").innerHTML = counts.map(c=>`
    <div class="bar" style="height:${(c.n/max*100)}%"><em>${c.n}</em></div>`).join("");
  chartCard.insertAdjacentHTML("beforeend",
    `<div class="chart-x">${counts.map(c=>`<span>${esc(c.name.split(" ")[2]||c.name)}</span>`).join("")}</div>`);

  const recent=bookings.slice(0,5);
  document.getElementById("dash-recent").innerHTML = bookingsLoadError
    ? `<div class="tbl-empty">${esc(bookingsLoadError)}<br><button class="a-btn ghost" id="dash-bk-retry" style="margin-top:.7rem"><i class="fa-solid fa-rotate"></i> إعادة المحاولة</button></div>`
    : recent.length?`
    <table class="tbl"><thead><tr><th>الاسم</th><th>الاستراحة</th><th>النوع</th><th>التاريخ</th><th>الجوال</th><th>الحالة</th></tr></thead><tbody>
    ${recent.map(b=>{
      const stay = b.stayType === "day" ? "نهاري" : "مبيت";
      const wk = bookingWeekend(b);
      const period = wk ? " · ويكند" : "";
      return `<tr><td>${esc(bookingVal(b,"name"))}</td><td>${esc(bookingVal(b,"unitName"))}</td><td><small>${stay}${period}</small></td><td>${esc(bookingVal(b,"date"))}</td><td>${esc(bookingVal(b,"phone"))}</td><td><span class="tag new">جديد</span></td></tr>`;
    }).join("")}
    </tbody></table>`:`<div class="tbl-empty">لا توجد حجوزات بعد</div>`;
  if(bookingsLoadError){
    const rb=document.getElementById("dash-bk-retry");
    if(rb) rb.addEventListener("click",retryBookings);
  }
}

/* ===== تقويم الإدارة ===== */
function renderCalTabs(){
  const units=store.getUnits();
  if(!units.length) return;
  if(!calUnitId) calUnitId=units[0].id;
  document.getElementById("cal-unit-tabs").innerHTML=units.map(u=>`
    <button class="cal-tab ${u.id===calUnitId?'active':''}" data-id="${u.id}">${esc(u.name)}</button>`).join("");
  document.querySelectorAll(".cal-tab").forEach(b=>b.addEventListener("click",()=>{calUnitId=b.dataset.id;renderCalTabs();renderAdminCalendar();}));
}
function renderAdminCalendar(){
  const units=store.getUnits();
  const unit=units.find(u=>u.id===calUnitId)||units[0];
  if(!unit) return;
  const y=calDate.getFullYear(), m=calDate.getMonth();
  document.getElementById("cal-month").textContent=`${AR_MONTHS[m]} ${y}`;
  const first=new Date(y,m,1).getDay();
  const days=new Date(y,m+1,0).getDate();
  const today=new Date();today.setHours(0,0,0,0);
  // خريطة طلبات الحجز (من سجل الحجوزات) لهذه الاستراحة: iso → عدد الطلبات
  const reqMap={};
  (Array.isArray(cachedBookings)?cachedBookings:[]).forEach(b=>{
    const match=(b.unitId===unit.id)||(b.unitName===unit.name);
    if(match && b.date) reqMap[b.date]=(reqMap[b.date]||0)+1;
  });
  let html=`<div class="admin-cal">${AR_DOW.map((d,i)=>`<div class="dow${(i===5||i===6)?' dow-weekend':''}">${d}</div>`).join("")}`;
  for(let i=0;i<first;i++) html+=`<div class="day empty"></div>`;
  for(let d=1;d<=days;d++){
    const date=new Date(y,m,d);const iso=toISO(date);
    const past=date<today;const booked=unit.booked.includes(iso);
    const weekend=isWeekendDate(date)&&!past&&!booked;
    const reqs=reqMap[iso]||0;
    html+=`<div class="day ${past?'past':''} ${booked?'booked':''} ${weekend?'weekend':''}" data-iso="${iso}">${d}${reqs?`<span class="req-badge" title="${reqs} طلب حجز">${reqs}</span>`:""}</div>`;
  }
  html+=`</div>`;
  document.getElementById("admin-calendar").innerHTML=html;
  document.querySelectorAll(".admin-cal .day:not(.past):not(.empty)").forEach(el=>{
    el.addEventListener("click",async ()=>{
      const units=store.getUnits();const iso=el.dataset.iso;
      const unit=units.find(u=>u.id===calUnitId);
      const i=unit.booked.indexOf(iso);
      const wasBooked=i>=0;
      if(wasBooked) unit.booked.splice(i,1);
      else unit.booked.push(iso);
      try{
        await store.setUnits(units);
        toast(wasBooked?"تم إلغاء تحديد اليوم كمحجوز":"تم تحديد اليوم كمحجوز");
      }catch(e){
        toast(saveError(e),true);   // فشل الحفظ — التراجع تم داخل المتجر
      }
      renderDashboard();renderAdminCalendar();
    });
  });
}
document.getElementById("cal-prev").addEventListener("click",()=>{calDate=new Date(calDate.getFullYear(),calDate.getMonth()-1,1);renderAdminCalendar();});
document.getElementById("cal-next").addEventListener("click",()=>{calDate=new Date(calDate.getFullYear(),calDate.getMonth()+1,1);renderAdminCalendar();});

/* ===== محرر الاستراحات ===== */
function renderUnitsEditor(){
  const units=store.getUnits();
  document.getElementById("units-editor").innerHTML=units.map(u=>`
    <div class="panel" style="padding:0;overflow:hidden;margin-bottom:1rem">
      <div style="padding:1rem 1.2rem;background:var(--a-surface-2);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem">
        <strong>${esc(u.name)}</strong>
        <button class="a-btn ghost" data-edit="${u.id}"><i class="fa-solid fa-pen"></i> تعديل</button>
      </div>
      <div style="padding:1rem 1.2rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.6rem;font-size:.85rem;color:var(--a-muted)">
        <div>سعر الأسبوع: <strong style="color:var(--a-text)">${u.price} ${u.currency}</strong></div>
        <div>سعر الويكند: <strong style="color:var(--a-text)">${u.weekendPrice||u.price} ${u.currency}</strong></div>
        <div>السعة: <strong style="color:var(--a-text)">${esc(u.capacity)}</strong></div>
        <div>الغرف: <strong style="color:var(--a-text)">${esc(u.beds)}</strong></div>
        <div>محجوزة: <strong style="color:var(--a-text)">${u.booked.length} يوم</strong></div>
      </div>
    </div>`).join("");
  document.querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>editUnit(b.dataset.edit)));
}
function editUnit(id){
  const units=store.getUnits();const u=units.find(x=>x.id===id);if(!u)return;
  const wrap=document.createElement("div");
  wrap.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.6);display:grid;place-items:center;z-index:300;padding:1rem";
  wrap.innerHTML=`<div style="background:var(--a-surface);border:1px solid var(--a-line);border-radius:14px;padding:1.7rem;width:min(680px,96vw);max-height:92vh;overflow:auto;box-shadow:var(--shadow-hover);position:relative">
    <div style="position:absolute;inset-block-start:0;inset-inline:0;height:2px;background:linear-gradient(90deg,transparent,var(--a-brass),transparent);border-radius:14px 14px 0 0"></div>
    <h3 style="margin-bottom:1.1rem;font-size:1.15rem">تعديل ${esc(u.name)}</h3>
    <div class="a-field"><label>الاسم</label><input id="e-name" value="${esc(u.name)}"/></div>
    <div class="a-field"><label>الوصف</label><input id="e-tag" value="${esc(u.tagline)}"/></div>
    <div class="a-row">
      <div class="a-field"><label>سعر المبيت — أيام الأسبوع (درهم)</label><input id="e-price" type="number" min="0" value="${u.price}"/></div>
      <div class="a-field"><label>سعر النهاري — أيام الأسبوع (درهم)</label><input id="e-dayprice" type="number" min="0" value="${u.dayPrice||u.price}" placeholder="مثال: 800"/></div>
    </div>
    <div class="a-row">
      <div class="a-field"><label>سعر المبيت — ويكند (جمعة+سبت)</label><input id="e-weekendprice" type="number" min="0" value="${u.weekendPrice||u.price}" placeholder="مثال: 1800"/></div>
      <div class="a-field"><label>سعر النهاري — ويكند (جمعة+سبت)</label><input id="e-weekenddayprice" type="number" min="0" value="${u.weekendDayPrice||u.weekendPrice||u.dayPrice||u.price}" placeholder="مثال: 1000"/></div>
    </div>
    <div class="a-field"><label>العملة</label><input id="e-curr" value="${esc(u.currency)}"/></div>
    <div class="a-field"><label>السعة</label><input id="e-cap" value="${esc(u.capacity)}"/></div>
    <div class="a-row">
      <div class="a-field"><label>عدد الغرف</label><input id="e-rooms" type="number" min="0" value="${u.roomsNum||0}"/></div>
      <div class="a-field"><label>عدد دورات المياه</label><input id="e-bathsnum" type="number" min="0" value="${u.bathsNum||0}"/></div>
    </div>
    <div class="a-row">
      <div class="a-field"><label>عدد المسابح</label><input id="e-pools" type="number" min="0" value="${u.poolsNum||1}"/></div>
      <div class="a-field"><label>المميزات (افصل بفاصلة)</label><textarea id="e-feat" rows="2">${esc(u.features.join("، "))}</textarea></div>
    </div>

    <div class="e-gallery">
      <label>صور الاستراحة</label>
      <div class="e-gallery-grid" id="e-gallery">
        ${(u.images||[]).map((src,i)=>`<div class="e-thumb" data-src="${esc(src)}">
          <img src="${esc(getImageSrc(src))}" alt="صورة ${i+1}" loading="lazy" data-fallback/>
          <button type="button" class="e-thumb-del" data-del="${i}" aria-label="حذف الصورة"><i class="fa-solid fa-xmark"></i></button>
        </div>`).join("")}
      </div>
      <div class="e-upload">
        <input type="file" id="e-img-input" accept="image/*" hidden />
        <button type="button" class="a-btn ghost" id="e-img-pick"><i class="fa-solid fa-cloud-arrow-up"></i> رفع صورة</button>
        <span class="e-upload-progress" id="e-img-progress"></span>
      </div>
    </div>

    <div style="display:flex;gap:.5rem;margin-top:.6rem">
      <button class="a-btn" id="e-save"><i class="fa-solid fa-floppy-disk"></i> حفظ</button>
      <button class="a-btn ghost" id="e-cancel">إلغاء</button>
    </div></div>`;
  document.body.appendChild(wrap);
  wireImageFallbacks(wrap);
  wrap.querySelector("#e-cancel").addEventListener("click",()=>wrap.remove());

  // ===== إدارة صور الاستراحة =====
  const galleryEl = wrap.querySelector("#e-gallery");
  galleryEl.addEventListener("click", async (ev)=>{
    const delBtn = ev.target.closest(".e-thumb-del");
    if(!delBtn) return;
    const idx = +delBtn.dataset.del;
    const removedUrl = u.images[idx];
    if(!confirm("حذف هذه الصورة من الاستراحة؟")) return;
    u.images.splice(idx,1);
    try{
      await store.setUnits(units);            // حدّث Firestore أولاً
      await store.deleteImage(removedUrl);   // يزيل الإشارة فقط (ImgBB لا يحذف عبر API المجاني)
      toast("تم حذف الصورة من المعرض");
    }catch(e){
      toast(saveError(e),true);
    }
    // أعد فتح النافذة لتعكس الحالة الجديدة
    wrap.remove(); editUnit(id);
  });

  const fileInput = wrap.querySelector("#e-img-input");
  const progressEl = wrap.querySelector("#e-img-progress");
  wrap.querySelector("#e-img-pick").addEventListener("click",()=>fileInput.click());
  fileInput.addEventListener("change", async ()=>{
    const file = fileInput.files && fileInput.files[0];
    if(!file) return;
    progressEl.textContent = "جاري الرفع 0%";
    try{
      const { url } = await store.uploadImage(file, u.id, pct => { progressEl.textContent = `جاري الرفع ${pct}%`; });
      u.images.push(url);
      await store.setUnits(units);
      progressEl.textContent = "";
      toast("تم رفع الصورة");
      wrap.remove(); editUnit(id);
    }catch(e){
      console.error(e);
      progressEl.textContent = "";
      const msg = (e && e.message === "IMGBB_NO_KEY")
        ? "أضِف مفتاح ImgBB من الإعدادات أولاً"
        : (e && e.code) ? saveError(e)
        : "تعذّر رفع الصورة — تحقّق من مفتاح ImgBB والاتصال";
      toast(msg, true);
    }
  });

  wrap.querySelector("#e-save").addEventListener("click",async ()=>{
    u.name=wrap.querySelector("#e-name").value.trim()||u.name;
    u.tagline=wrap.querySelector("#e-tag").value.trim();
    u.price=+wrap.querySelector("#e-price").value||u.price;
    const dpVal = wrap.querySelector("#e-dayprice").value.trim();
    u.dayPrice = dpVal ? +dpVal : u.price;   // افتراضياً يساوي سعر المبيت إن لم يُحدّد
    const wpVal = wrap.querySelector("#e-weekendprice").value.trim();
    u.weekendPrice = wpVal ? +wpVal : u.price;   // افتراضياً يساوي سعر المبيت أيام الأسبوع
    const wdpVal = wrap.querySelector("#e-weekenddayprice").value.trim();
    u.weekendDayPrice = wdpVal ? +wdpVal : (u.weekendPrice || u.price);   // افتراضياً يساوي سعر مبيت الويكند
    u.currency=wrap.querySelector("#e-curr").value.trim()||u.currency;
    u.capacity=wrap.querySelector("#e-cap").value.trim();
    u.roomsNum=+wrap.querySelector("#e-rooms").value||0;
    u.bathsNum=+wrap.querySelector("#e-bathsnum").value||0;
    u.poolsNum=+wrap.querySelector("#e-pools").value||1;
    // ولّد النصوص العربية/الإنجليزية تلقائياً للتوافق مع صفحة التفاصيل (specs-table)
    u.beds = u.roomsNum + " غرف نوم";
    u.baths = u.bathsNum + " دورات مياه";
    if(!u.bedsEn) u.bedsEn = u.roomsNum + " Bedrooms";
    if(!u.bathsEn) u.bathsEn = u.bathsNum + " Bathrooms";
    u.features=wrap.querySelector("#e-feat").value.split(/[،,]/).map(s=>s.trim()).filter(Boolean);
    try{
      await store.setUnits(units);
      wrap.remove();renderAll();toast("تم حفظ التعديلات");
    }catch(e){
      // فشل الحفظ: المتجر استرجع الحالة السابقة — أبلغ الأدمن بالسبب وأعد فتح المحرر بالقيم الفعلية
      toast(saveError(e),true);
      wrap.remove();editUnit(id);renderAll();
    }
  });
}

/* ===== سجل الحجوزات ===== */
function renderBookings(filter=""){
  if(bookingsLoadError){
    document.getElementById("bookings-table").innerHTML = `<div class="tbl-empty">${esc(bookingsLoadError)}<br><button class="a-btn ghost" id="bk-retry" style="margin-top:.7rem"><i class="fa-solid fa-rotate"></i> إعادة المحاولة</button></div>`;
    const rb=document.getElementById("bk-retry");
    if(rb) rb.addEventListener("click",retryBookings);
    return;
  }
  const bookings=(Array.isArray(cachedBookings) ? cachedBookings : []).slice();
  const f=filter.trim().toLowerCase();
  const list=f?bookings.filter(b=>[bookingVal(b,"name"),bookingVal(b,"phone"),bookingVal(b,"unitName"),bookingVal(b,"date")].join(" ").toLowerCase().includes(f)):bookings;
  const units=store.getUnits();
  // الحجز "مؤكد" إذا كان يومه محجوزاً فعلياً في بيانات الاستراحة (مصدر الحقيقة للموقع)
  const isConfirmed=b=>{
    const u=units.find(x=>x.id===b.unitId)||units.find(x=>x.name===b.unitName);
    return b.status==="confirmed" || !!(u && (u.booked||[]).includes(b.date));
  };
  document.getElementById("bookings-table").innerHTML=list.length?`
    <table class="tbl"><thead><tr><th>الاسم</th><th>الاستراحة</th><th>النوع</th><th>التاريخ</th><th>الجوال</th><th>السعر</th><th>تاريخ الطلب</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>
    ${list.map(b=>{
      const stayBadge = b.stayType === "day"
        ? `<span class="tag" style="background:#fef3c7;color:#92400e">نهاري</span>`
        : `<span class="tag" style="background:#dbeafe;color:#1e40af">مبيت</span>`;
      const weekend = bookingWeekend(b);
      const periodBadge = weekend
        ? ` <span class="tag" style="background:#ede9fe;color:#5b21b6">ويكند</span>`
        : ` <span class="tag" style="background:#f1f5f9;color:#475569">أسبوع</span>`;
      const confirmed = isConfirmed(b);
      const statusBadge = confirmed
        ? `<span class="tag" style="background:#dcfce7;color:#166534">مؤكد</span>`
        : `<span class="tag new">بانتظار التأكيد</span>`;
      return `<tr>
      <td>${esc(bookingVal(b,"name"))}${b.notes?`<br><small style="color:var(--a-muted)">${esc(b.notes)}</small>`:""}</td>
      <td>${esc(bookingVal(b,"unitName"))}</td><td>${stayBadge}${periodBadge}</td><td>${esc(bookingVal(b,"date"))}</td><td>${esc(bookingVal(b,"phone"))}</td><td>${bookingPrice(b).toLocaleString("ar")} ${esc(bookingVal(b,"currency"))}</td>
      <td>${bookingDateLabel(b.createdAt)}</td>
      <td>${statusBadge}</td>
      <td><div class="row-actions">
        ${confirmed?"":`<button class="icon-btn ok" data-confirm="${esc(b.id)}" title="تأكيد الحجز (حجز اليوم في الموقع)"><i class="fa-solid fa-check"></i></button>`}
        <a class="icon-btn" href="https://wa.me/${bookingVal(b,"phone").replace(/\D/g,'')}" target="_blank" rel="noopener" title="واتساب"><i class="fa-brands fa-whatsapp"></i></a>
        <button class="icon-btn del" data-del="${esc(b.id)}" title="حذف"><i class="fa-solid fa-trash"></i></button>
      </div></td></tr>`;
    }).join("")}
    </tbody></table>`:`<div class="tbl-empty">لا توجد حجوزات${f?" مطابقة":""}</div>`;
  document.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",async ()=>{
    const id = b.dataset.del;
    try{
      await store.deleteBooking(id);
      cachedBookings = cachedBookings.filter(x=>x.id!==id);
      renderAll();toast("تم حذف الحجز");
    }catch(e){ toast(saveError(e),true); }
  }));
  // تأكيد الحجز: يضيف اليوم إلى التواريخ المحجوزة في الاستراحة (ينعكس فوراً على الموقع)
  document.querySelectorAll("[data-confirm]").forEach(btn=>btn.addEventListener("click",async ()=>{
    const id = btn.dataset.confirm;
    const bk = cachedBookings.find(x=>x.id===id);
    if(!bk) return;
    const units2 = store.getUnits();
    const unit = units2.find(u=>u.id===bk.unitId) || units2.find(u=>u.name===bk.unitName);
    if(!unit){ toast("تعذّر إيجاد الاستراحة الخاصة بهذا الحجز",true); return; }
    if(!(unit.booked||[]).includes(bk.date)) unit.booked.push(bk.date);
    try{
      await store.setUnits(units2);
      // علّم مستند الحجز كمؤكد (تحديث الأدمن مسموح في القواعد)
      if(window.db && bk.id){
        await db.collection("bookings").doc(String(bk.id)).set({ status:"confirmed" }, { merge:true }).catch(()=>{});
        bk.status = "confirmed";
      }
      toast("تم تأكيد الحجز — اليوم أصبح محجوزاً في الموقع");
    }catch(e){
      toast(saveError(e),true);
    }
    renderAll();
  }));
}
document.getElementById("bk-search").addEventListener("input",e=>renderBookings(e.target.value));

/* ===== تصدير CSV ===== */
function csvSafe(v){
  let s = String(v==null?"":v);
  if(/^[=+\-@%]/.test(s.trim()) || /[\t\r]/.test(s)) s = "'" + s;
  return s;
}
document.getElementById("export-csv").addEventListener("click",()=>{
  const bk=cachedBookings;
  if(!bk.length){toast("لا توجد حجوزات للتصدير",true);return;}
  const rows=[["ID","الاسم","الاستراحة","التاريخ","الجوال","ملاحظات","السعر","العملة","الفترة","تاريخ الطلب"]];
  bk.forEach(b=>{
    const wk = bookingWeekend(b);
    rows.push([b.id,bookingVal(b,"name"),bookingVal(b,"unitName"),bookingVal(b,"date"),bookingVal(b,"phone"),bookingVal(b,"notes"),bookingPrice(b),bookingVal(b,"currency"),wk?"ويكند":"أيام الأسبوع",bookingDateLabel(b.createdAt)]);
  });
  const csv="\uFEFF"+rows.map(r=>r.map(c=>`"${csvSafe(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);
  a.download="marbella-bookings.csv";a.click();URL.revokeObjectURL(a.href);
  toast("تم تصدير الحجوزات");
});

/* ===== الإعدادات ===== */
function renderSettings(){
  const s=store.getSettings();
  document.getElementById("s-brand").value=s.brandName||"";
  document.getElementById("s-wa").value=s.whatsapp||"";
  document.getElementById("s-phone").value=s.phoneDisplay||"";
  document.getElementById("s-area").value=s.areaName||"";
  document.getElementById("s-ig").value=s.instagram||"";
  document.getElementById("s-tk").value=s.tiktok||"";
  document.getElementById("s-intro").value=s.introMessage||"";
  if(document.getElementById("s-email")) document.getElementById("s-email").value=s.email||"";
  if(document.getElementById("s-bank")) document.getElementById("s-bank").value=s.bankAccount||"";
  if(document.getElementById("s-deposit")) document.getElementById("s-deposit").value=s.depositAmount||"";
  if(document.getElementById("s-pledge")) document.getElementById("s-pledge").value=s.pledgeText||"";
  renderLogoPicker(s.logoPath || "assets/images/logo.png");
  applyAdminLogo(s.logoPath);
  renderOffers();
}

/* ===== إدارة العروض ===== */
function renderOffers(){
  const s = store.getSettings();
  const off = s.offer || {};
  const cb = document.getElementById("o-active");
  if(cb) cb.checked = !!off.active;
  const lbl = document.getElementById("o-label");
  if(lbl) lbl.value = off.label || "";
  const lblEn = document.getElementById("o-labelen");
  if(lblEn) lblEn.value = off.labelEn || "";
  const st = document.getElementById("o-start");
  if(st) st.value = off.start || "";
  const tg = document.getElementById("o-target");
  if(tg) tg.value = off.target || "";
}
function renderLogoPicker(selectedPath){
  const wrap = document.getElementById("logo-picker");
  if(!wrap) return;
  const activePath = LOGO_OPTIONS.some(logo => logo.path === selectedPath) ? selectedPath : LOGO_OPTIONS[0].path;
  wrap.innerHTML = LOGO_OPTIONS.map((logo, i) => {
    const checked = logo.path === activePath || (!activePath && i === 0);
    return `<label class="logo-option ${checked ? "active" : ""}">
      <input type="radio" name="logo-choice" value="${esc(logo.path)}" ${checked ? "checked" : ""} />
      <img src="${esc(logo.path)}" alt="${esc(logo.label)}" loading="lazy" />
      <span>${esc(logo.label)}</span>
    </label>`;
  }).join("");
  wrap.querySelectorAll('input[name="logo-choice"]').forEach(input => {
    input.addEventListener("change", () => {
      wrap.querySelectorAll(".logo-option").forEach(el => el.classList.toggle("active", el.contains(input) && input.checked));
      applyAdminLogo(input.value);
    });
  });
}
document.getElementById("settings-form").addEventListener("submit",async e=>{
  e.preventDefault();
  const s=store.getSettings();
  s.brandName=document.getElementById("s-brand").value.trim();
  s.whatsapp=document.getElementById("s-wa").value.trim();
  s.phoneDisplay=document.getElementById("s-phone").value.trim();
  s.areaName=document.getElementById("s-area").value.trim();
  s.instagram=document.getElementById("s-ig").value.trim();
  s.tiktok=document.getElementById("s-tk").value.trim();
  s.introMessage=document.getElementById("s-intro").value.trim();
  if(document.getElementById("s-email")) s.email=document.getElementById("s-email").value.trim();
  if(document.getElementById("s-bank")) s.bankAccount=document.getElementById("s-bank").value.trim();
  // ملاحظة: مفتاح ImgBB لا يُدار من الواجهة (حماية من التعديل بالخطأ) —
  // يبقى الافتراضي في data.js ولا تلمسه الإعدادات نهائياً
  delete s.imgbbKey;
  const logoChoice = document.querySelector('input[name="logo-choice"]:checked');
  if(logoChoice) s.logoPath = logoChoice.value;
  if(document.getElementById("s-deposit")){
    const val = document.getElementById("s-deposit").value.trim();
    const num = Number(val);
    s.depositAmount = val === "" ? 500 : (Number.isFinite(num) ? num : (s.depositAmount || 500));
  }

  if(document.getElementById("s-pledge")) s.pledgeText=document.getElementById("s-pledge").value.trim();
  try{
    await store.setSettings(s);
    toast("تم حفظ الإعدادات");
  }catch(e){
    toast(saveError(e),true);
    renderSettings();   // أعد عرض القيم الفعلية المحفوظة بعد التراجع
  }
});

/* ===== حفظ العرض الترويجي ===== */
document.getElementById("offer-form").addEventListener("submit",async e=>{
  e.preventDefault();
  const s=store.getSettings();
  s.offer = {
    active: document.getElementById("o-active").checked,
    label: document.getElementById("o-label").value.trim(),
    labelEn: document.getElementById("o-labelen").value.trim(),
    start: document.getElementById("o-start").value,
    target: document.getElementById("o-target").value,
    updatedAt: Date.now()
  };
  try{
    await store.setSettings(s);
    toast(s.offer.active ? "تم تفعيل العرض وحفظه" : "تم حفظ العرض (غير مُفعّل)");
  }catch(e){
    toast(saveError(e),true);
    renderOffers();
  }
});
document.getElementById("o-disable").addEventListener("click", async ()=>{
  const s=store.getSettings();
  s.offer = Object.assign({}, s.offer||{}, { active:false, updatedAt: Date.now() });
  try{
    await store.setSettings(s);
    renderOffers();
    toast("تم إيقاف العرض");
  }catch(e){
    toast(saveError(e),true);
    renderOffers();
  }
});
document.getElementById("pass-form").addEventListener("submit",async e=>{
  e.preventDefault();
  const p1=document.getElementById("new-pass").value;
  const p2=document.getElementById("new-pass2").value;
  if(p1.length<4){toast("كلمة المرور قصيرة جداً",true);return;}
  if(p1!==p2){toast("كلمتا المرور غير متطابقتين",true);return;}
  const user = auth.currentUser;
  if(!user){toast("سجّل الدخول أولاً",true);return;}
  try{
    await user.updatePassword(p1);
    document.getElementById("new-pass").value="";document.getElementById("new-pass2").value="";
    toast("تم تغيير كلمة المرور");
  }catch(ex){
    const code = ex && ex.code ? ex.code : "";
    if(code==="auth/requires-recent-login") toast("سجّل الخروج ثم الدخول مجدداً قبل التغيير",true);
    else toast("تعذّر تغيير كلمة المرور",true);
  }
});
document.getElementById("reset-all").addEventListener("click",async ()=>{
  if(confirm("سيتم حذف كل البيانات وإعادتها للوضع الافتراضي. متابعة؟")){
    try{
      await store.resetAll();
      // صفّر الإجماليات المؤرشفة أيضاً (إعادة تعيين كاملة)
      if(window.db) await db.collection("stats").doc("main").delete().catch(()=>{});
      cachedStats = { totalBookings:0, totalRevenue:0 };
      cachedBookings = [];
      renderAll();toast("تمت إعادة التعيين");
    }catch(e){
      console.error("resetAll failed", e);
      toast("تعذّرت إعادة التعيين، تحقّق من الصلاحيات",true);
    }
  }
});

/* ===== التقييمات ===== */
let cachedReviews = [];
async function loadReviews(){ cachedReviews = await store.getAllReviews(); }

function renderReviews(){
  const list = cachedReviews.slice();
  const wrap = document.getElementById("reviews-table");
  if(!wrap) return;
  const units = store.getUnits();
  const unitName = id => { const u = units.find(x=>x.id===id); return u ? u.name : "—"; };
  wrap.innerHTML = list.length ? `
    <table class="tbl"><thead><tr><th>الاستراحة</th><th>الاسم</th><th>التقييم</th><th>التعليق</th><th>التاريخ</th><th>إجراءات</th></tr></thead><tbody>
    ${list.map(r=>{
      const stars = "★".repeat(r.rating||0) + "☆".repeat(5-(r.rating||0));
      const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString("ar") : "—";
      return `<tr>
        <td>${esc(unitName(r.unitId))}</td>
        <td>${esc(r.name)}</td>
        <td><span class="rev-stars">${stars}</span></td>
        <td class="rev-text-cell">${esc(r.text)}</td>
        <td>${date}</td>
        <td><button class="icon-btn del" data-rev-del="${esc(r.id)}" title="حذف"><i class="fa-solid fa-trash"></i></button></td>
      </tr>`;
    }).join("")}
    </tbody></table>` : `<div class="tbl-empty">لا توجد تقييمات بعد</div>`;

  wrap.querySelectorAll("[data-rev-del]").forEach(b=>b.addEventListener("click", async ()=>{
    if(!confirm("حذف هذا التقييم نهائياً؟")) return;
    try{
      await store.deleteReview(b.dataset.revDel);
      cachedReviews = cachedReviews.filter(x=>x.id!==b.dataset.revDel);
      renderReviews(); toast("تم حذف التقييم");
    }catch(e){ toast("تعذّر حذف التقييم", true); }
  }));
}
document.getElementById("reviews-refresh")?.addEventListener("click", async ()=>{
  await loadReviews(); renderReviews(); toast("تم تحديث التقييمات");
});

/* ===== تشغيل ===== */
async function renderAll(){
  renderDashboard();
  renderCalTabs();
  renderAdminCalendar();
  renderUnitsEditor();
  renderBookings();
  renderReviews();
  renderSettings();
}
