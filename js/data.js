/* ============================================================
   بيانات منتجعات ماربيلا — عدّل القيم هنا فقط
   ============================================================ */

const SETTINGS = {
  brandName: "منتجعات ماربيلا",
  brandNameEn: "Marbella Resorts",
  // بريد الأدمن — تقرأه قواعد Firestore من settings/main (adminEmail) للتحقق من صلاحيات الكتابة
  adminEmail: "admin@marbella-resorts.com",
  // مفتاح ImgBB لرفع صور الاستراحات — افتراضي دائم حتى لا يضيع الرفع
  // لو فُقد من مستند Firestore (يمكن تغييره من لوحة التحكم ← الإعدادات)
  imgbbKey: "a6d93191c6f3a6aaf27f8d9ce4f6fead",
  // رقم واتساب بدون + أو مسافات (الصيغة الدولية)
  whatsapp: "971566222566",
  phoneDisplay: "+971 56 622 2566",
  logoPath: "assets/images/logo.png",
  instagram: "https://www.instagram.com/resortsadeem",
  tiktok: "https://www.tiktok.com/@resortsadeem",
  // المنطقة العامة
  areaName: "الظاهرة / الملاليح - أبو ظبي",
  areaNameEn: "Al Dhahirah / Al Malaleeh - Abu Dhabi",
  // رسالة ترحيب تظهر في الطلب المُرسل للواتساب
  introMessage: "مرحباً، أرغب في حجز استراحة:",
  // العرض الترويجي (يُدار من لوحة التحكم ويُحفظ في Firestore)
  offer: {
    active: true,
    label: "عرض الصيف — خصم خاص على الحجوزات المبكرة",
    labelEn: "Summer Offer — Special Discount on Early Bookings",
    start: "",          // تاريخ بدء العرض (YYYY-MM-DD) — فارغ = فوري
    target: "2026-07-15" // تاريخ انتهاء العرض (YYYY-MM-DD)
  }
};

/* ============================================================
   بيانات الاستراحات الثلاث
   - عدّل الأسماء والأسعار والوصف والإحداثيات حسب الحاجة
   ============================================================ */
const UNITS = [
  {
    id: "estrha1",
    section: "families",
    likes: 142,
    name: "استراحة ماربيلا 1 (عائلات)",
    nameEn: "Marbella Resort 1 (Families)",
    tagline: "المكان المثالي لجمعتك العائلية القادمة",
    taglineEn: "The perfect place for your next family gathering",
    price: 1500,
    currency: "درهم",
    currencyEn: "AED",
    capacity: "تسع حتى 30 شخص",
    capacityEn: "Up to 30 guests",
    roomsNum: 4,
    bathsNum: 4,
    poolsNum: 1,
    beds: "4 غرف نوم", // Fallback text
    baths: "4 دورات مياه", // Fallback text
    features: ["مسبح خاص بعمق تدريجي", "صالة أرضية بشاشة كبيرة", "3 جلسات خارجية", "ألعاب أطفال", "محطة شواء", "مطبخ خارجي"],
    featuresEn: ["Gradual depth private pool", "Ground lounge with large screen", "3 Outdoor seatings", "Kids play area", "BBQ station", "Outdoor kitchen"],
    pdfLink: "https://base44.app/api/apps/6a3fdaede4075caea82fe777/files/mp/public/6a3fdaede4075caea82fe777/6b785e7e4_WhatsAppImage2026-06-27at33910PM.pdf",
    images: ["assets/images/estrha1/photo_1.jpeg", "assets/images/estrha1/photo_10.jpeg", "assets/images/estrha1/photo_11.jpeg", "assets/images/estrha1/photo_12.jpeg", "assets/images/estrha1/photo_13.jpeg", "assets/images/estrha1/photo_14.jpeg", "assets/images/estrha1/photo_15.jpeg", "assets/images/estrha1/photo_16.jpeg", "assets/images/estrha1/photo_17.jpeg", "assets/images/estrha1/photo_18.jpeg", "assets/images/estrha1/photo_2.jpeg", "assets/images/estrha1/photo_3.jpeg", "assets/images/estrha1/photo_4.jpeg", "assets/images/estrha1/photo_5.jpeg", "assets/images/estrha1/photo_6.jpeg"],
    lat: 23.9785,
    lng: 55.5288,
    booked: []
  },
  {
    id: "estrha2",
    section: "singles",
    likes: 85,
    name: "استراحة ماربيلا 2 (عزاب/عائلات)",
    nameEn: "Marbella Resort 2 (Singles/Families)",
    tagline: "هدوء وفخامة مع خصوصية تامة",
    taglineEn: "Quietness and luxury with total privacy",
    price: 1200,
    currency: "درهم",
    currencyEn: "AED",
    capacity: "تسع حتى 30 شخص",
    capacityEn: "Up to 30 guests",
    roomsNum: 2,
    bathsNum: 2,
    poolsNum: 1,
    beds: "2 غرف نوم",
    baths: "2 دورات مياه",
    features: ["مسبح خاص 150سم", "صالة كبيرة", "جلستين خارجية", "محطة شواء", "مجلس رجال منعزل", "ألعاب أطفال"],
    featuresEn: ["Private pool 150cm", "Large hall", "2 Outdoor seatings", "BBQ station", "Isolated men's majlis", "Kids play area"],
    pdfLink: "https://drive.google.com/drive/folders/1XGbqGVhPrzB7uBY5d93ROmEhyJAm2HfQ?usp=drive_link",
    images: ["assets/images/estrha2/photo_1.jpeg", "assets/images/estrha2/photo_10.jpeg", "assets/images/estrha2/photo_11.jpeg", "assets/images/estrha2/photo_12.jpeg", "assets/images/estrha2/photo_13.jpeg", "assets/images/estrha2/photo_14.jpeg", "assets/images/estrha2/photo_15.jpeg", "assets/images/estrha2/photo_2.jpeg", "assets/images/estrha2/photo_3.jpeg", "assets/images/estrha2/photo_4.jpeg", "assets/images/estrha2/photo_5.jpeg", "assets/images/estrha2/photo_6.jpeg", "assets/images/estrha2/photo_7.jpeg", "assets/images/estrha2/photo_8.jpeg", "assets/images/estrha2/photo_9.jpeg"],
    lat: 23.9790,
    lng: 55.5295,
    booked: []
  },
  {
    id: "estrha3",
    section: "singles",
    likes: 110,
    name: "استراحة ماربيلا 3",
    nameEn: "Marbella Resort 3",
    tagline: "تجربة راقية بأسعار تنافسية",
    taglineEn: "An upscale experience at competitive prices",
    price: 1200,
    currency: "درهم",
    currencyEn: "AED",
    capacity: "تسع حتى 25 شخص",
    capacityEn: "Up to 25 guests",
    roomsNum: 2,
    bathsNum: 2,
    poolsNum: 1,
    beds: "2 غرف نوم",
    baths: "2 دورات مياه",
    features: ["مسبح خاص 150سم", "صالة كبيرة", "جلستين خارجية", "محطة شواء", "مجلس رجال منعزل", "ألعاب أطفال"],
    featuresEn: ["Private pool 150cm", "Large hall", "2 Outdoor seatings", "BBQ station", "Isolated men's majlis", "Kids play area"],
    pdfLink: "https://drive.google.com/drive/folders/14ehvxJTvq17gQlgoNx0E3NCaJ1PRRdmi?usp=drive_link",
    images: ["assets/images/estrha1/photo_1.jpeg", "assets/images/estrha2/photo_2.jpeg"],
    lat: 23.9780,
    lng: 55.5280,
    booked: []
  }
];

/* ============================================================
   العروض — مُدمج الآن في SETTINGS.offer وقابل للإدارة من لوحة التحكم.
   ============================================================ */

const TESTIMONIALS = [
  { name: "أبو محمد", nameEn: "Abu Mohammed", role: "ضيف دائم", roleEn: "Regular Guest", text: "استراحة نظيفة وخصوصية تامة، كرّرنا الحجز مرتين والخدمة ممتازة.", textEn: "Clean resort, total privacy. We booked twice, excellent service.", rating: 5 },
  { name: "عائلة العتيبي", nameEn: "Al Otaibi Family", role: "ضيف", roleEn: "Guest", text: "المسبح خاص وكان مناسبًا للأطفال، والمجلس فاخر. تجربة عائلية ممتازة.", textEn: "Private pool was great for kids, and the lounge is luxurious. Excellent family experience.", rating: 5 },
  { name: "خالد الشمري", nameEn: "Khaled Al-Shammari", role: "ضيف", roleEn: "Guest", text: "الموقع هادئ وقريب من كل الخدمات، والتواصل عبر واتساب كان سريعًا.", textEn: "Quiet location close to all services, and WhatsApp communication was fast.", rating: 4 },
];

/* ============================================================
   الأسئلة الشائعة (تُعرض في صفحة faq.html ديناميكياً)
   ============================================================ */
const FAQ = [
  { cat: "الحجز والإلغاء", q: "كيف أحجز استراحة؟", a: "اختر الاستراحة والتاريخ من التقويم في الصفحة الرئيسية، ثم اضغط «احجز الآن» وأرسل الطلب عبر واتساب ليتم تأكيده فوراً." },
  { cat: "الحجز والإلغاء", q: "هل يمكنني إلغاء الحجز؟", a: "نعم، راجع صفحة سياسة الإلغاء لمعرفة نسب الاسترداد حسب توقيت الإلغاء." },
  { cat: "الأسعار والدفع", q: "هل السعر يشمل كل المرافق؟", a: "نعم، السعر المعروض يشمل المسبح والمجالس والمطبخ والواي فاي. أي طلبات إضافية تُناقش مباشرة وقت الحجز." },
  { cat: "الأسعار والدفع", q: "ما هي طرق الدفع؟", a: "يتم الدفع نقداً أو عبر التحويل عند استلام الاستراحة. تفاصيل الدفع تُرسل عبر واتساب عند تأكيد الحجز." },
  { cat: "المرافق والخدمات", q: "هل يوجد مسبح خاص لكل استراحة؟", a: "نعم، كل استراحة لها مسبح خاص بها بالكامل مع منطقة جلوس خارجية." },
  { cat: "المرافق والخدمات", q: "هل يوجد واي فاي وموقف سيارات؟", a: "نعم، جميع الاستراحات مجهزة بالواي فاي وموقف سيارات خاص." },
  { cat: "القوانين", q: "هل يُسمح بالتجمعات الكبيرة؟", a: "يُرجى الالتزام بسعة كل استراحة المحددة. أي زيادة يجب التنسيق عليها مسبقاً عبر واتساب." },
  { cat: "القوانين", q: "ما هي مواعيد تسليم واستلام الاستراحة؟", a: "التسليم عادة ظهراً والاستلام صباح اليوم التالي. يمكن التنسيق على ساعات مرنة عبر واتساب." },
];

/* ============================================================
   === طبقة التخزين: Firebase (Firestore + Auth) ===
   كل البيانات (الإعدادات، الاستراحات، الحجوزات، التقييمات،
   والتفضيلات: الثيم/اللغة/المفضّلة) تُخزَّن في Firebase.
   لا يُستخدم localStorage / sessionStorage نهائياً.
   ============================================================ */

const DEFAULT_SETTINGS = Object.assign({}, SETTINGS);
const DEFAULT_UNITS    = JSON.parse(JSON.stringify(UNITS));

/* دمج متين: لا تدع القيم الفارغة/الناقصة من Firestore تُلغي الافتراضي السليم.
   - null/undefined: تُهمل (نبقي الافتراضي)
   - مصفوفة فارغة []: تُهمل (نبقي الافتراضي) — يحمي images/features/booked
   - نص فارغ "": يُهمل
   - باقي القيم (أرقام/نصوص/بوليان/مصفوفات مملوءة): تُقبل */
function mergeUnit(def, data){
  const base = JSON.parse(JSON.stringify(def));
  if(!data || typeof data !== "object") return base;
  for(const k of Object.keys(data)){
    const v = data[k];
    if(v === null || v === undefined) continue;
    if(Array.isArray(v)){ if(v.length > 0) base[k] = v; continue; }
    if(typeof v === "string"){ if(v.trim() !== "") base[k] = v; continue; }
    base[k] = v;
  }
  return base;
}
// مثل mergeUnit لكن للإعدادات (يدعم الدمج العميق للكائنات المتداخلة كـ offer)
function mergeSettings(def, data){
  const base = Object.assign({}, def);
  if(!data || typeof data !== "object") return base;
  for(const k of Object.keys(data)){
    const v = data[k];
    if(v === null || v === undefined) continue;
    if(Array.isArray(v)){ if(v.length > 0) base[k] = v; continue; }
    if(typeof v === "string"){ if(v.trim() !== "") base[k] = v; continue; }
    if(typeof v === "object" && typeof base[k] === "object" && !Array.isArray(base[k])){
      base[k] = Object.assign({}, base[k], v);   // دمج عميق لكائن واحد
      continue;
    }
    base[k] = v;
  }
  return base;
}


/* أدوات تاريخ مشتركة */
const AR_MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const AR_DOW = ["أحد","إثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"];
function pad(n){return String(n).padStart(2,"0");}
function toISO(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;}

/* ===== تسعير الويكند =====
   أيام الويكند: الجمعة (5) والسبت (6) وفق Date.getDay().
   4 أسعار لكل استراحة: مبيت/نهاري × أيام الأسبوع/ويكند،
   مع بدائل منطقية عند عدم تحديد سعر الويكند. */
const WEEKEND_DAYS = [5, 6];
function isWeekendDate(date){
  if(!date) return false;
  const d = (date instanceof Date) ? date : new Date(date);
  if(isNaN(d.getTime())) return false;
  return WEEKEND_DAYS.indexOf(d.getDay()) >= 0;
}
function unitPriceFor(unit, stay, weekend){
  if(stay === "day"){
    return weekend
      ? (unit.weekendDayPrice || unit.weekendPrice || unit.dayPrice || unit.price)
      : (unit.dayPrice || unit.price);
  }
  return weekend ? (unit.weekendPrice || unit.price) : unit.price;
}
/* كل أسعار الاستراحة الأربعة (مع البدائل المنطقية) — مصدر موحّد للعرض */
function getUnitPrices(unit){
  const night = unit.price;
  const day = unit.dayPrice || unit.price;
  const wNight = unit.weekendPrice || unit.price;
  const wDay = unit.weekendDayPrice || unit.weekendPrice || unit.dayPrice || unit.price;
  return { night, day, wNight, wDay };
}
/* هل حجز ضمن ويكند (يتسامح مع الحجوزات القديمة دون isWeekend) */
function bookingWeekend(b){
  return b.isWeekend != null ? b.isWeekend : isWeekendDate(b.date);
}



if(!window.MarbellaStore){
  const _prefs = { lang:null, theme:null, favorites:[] };
  let _unitsSubscribed = false;

  // تفعيل الاشتراك اللحظي على الاستراحات فور توفر قاعدة البيانات
  function _subscribeUnits(){
    if(_unitsSubscribed || !window.db) return;
    _unitsSubscribed = true;
    db.collection("units").onSnapshot(snap => {
      const updated = [];
      snap.forEach(d => {
        const data = d.data();
        const def = DEFAULT_UNITS.find(u => u.id === data.id);
        updated.push(def ? mergeUnit(def, data) : data);
      });
      updated.sort((a,b)=>String(a.id).localeCompare(String(b.id)));
      UNITS.splice(0, UNITS.length, ...updated);
      // أعد تطبيق الإعدادات (قد تتغير الأسعار) وأبلغ الصفحة بإعادة العرض
      window.dispatchEvent(new Event("unitsUpdated"));
    }, err => console.warn("units snapshot error", err));
  }

  // اشتراك لحظي على الإعدادات (العروض، الأسعار، التواصل...) — ينعكس فوراً على كل الصفحات
  // حماية ضد cache القديم: نتجاهل الكتابات المحلية المعلّقة ونتحقق أن القيمة فعلاً تغيّرت
  let _settingsSubscribed = false;
  let _lastSettingsKey = "";
  function _subscribeSettings(){
    if(_settingsSubscribed || !window.db) return;
    _settingsSubscribed = true;
    db.collection("settings").doc("main").onSnapshot({includeMetadataChanges:false}, doc => {
      if(!doc.exists) return;
      // تجاهل الكتابات المحلية المعلّقة (cache قبل تأكيد الخادم) — تسبب عودة القيم القديمة
      if(doc.metadata && doc.metadata.hasPendingWrites) return;
      const merged = mergeSettings(DEFAULT_SETTINGS, doc.data());
      // لا تطلق الحدث إلا إذا تغيّر شيء فعلاً (يمنع الإطلاقات الزائدة والحلقات)
      const key = JSON.stringify({offer: merged.offer});
      if(key === _lastSettingsKey){ Object.assign(SETTINGS, merged); return; }
      _lastSettingsKey = key;
      Object.assign(SETTINGS, merged);
      window.dispatchEvent(new Event("settingsUpdated"));
    }, err => console.warn("settings snapshot error", err));
  }

  // فعّل الاشتراك بمجرد تحميل firebase-config.js (db متاح)
  if(window.db){ _subscribeUnits(); _subscribeSettings(); }
  else { window.addEventListener("firebaseReady", () => { _subscribeUnits(); _subscribeSettings(); }, { once:true }); }

  window.MarbellaStore = {
    AR_MONTHS, AR_DOW, pad, toISO,

    /* ===== التفضيلات (الثيم/اللغة/المفضّلة) — مخزّنة في Firestore تحت users/{uid} ===== */
    getLang(){ return _prefs.lang || "ar"; },
    getTheme(){
      if(_prefs.theme) return _prefs.theme;
      try{ return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
      catch(e){ return "light"; }
    },
    getFavorites(){ return _prefs.favorites.slice(); },
    isFavorite(id){ return _prefs.favorites.includes(id); },

    async setLang(lang){ _prefs.lang = lang; await this._savePrefs(); },
    toggleTheme(){
      const dark = this.getTheme() !== "dark";
      _prefs.theme = dark ? "dark" : "light";
      this._applyTheme();
      this._savePrefs();
    },
    toggleFavorite(id){
      const i = _prefs.favorites.indexOf(id);
      let add;
      if(i>=0){ _prefs.favorites.splice(i,1); add=false; }
      else { _prefs.favorites.push(id); add=true; }
      this._savePrefs(); // تُحفظ المفضّلة في users/{uid} (تعمل تحت قواعد self-write)
      // ملاحظة: عدّاد الإعجابات (units.likes) يُدار من الأدمن فقط بموجب قواعد الأمان؛
      // لا نُصدر كتابة موعودة بالرفض من جانب الزائر المجهول.
      return add;
    },

    _applyTheme(){
      const dark = this.getTheme()==="dark";
      document.documentElement.classList.toggle("theme-dark", dark);
      const t = document.getElementById("theme-toggle");
      if(t){ const i=t.querySelector("i"); if(i) i.className = dark?"fa-solid fa-sun":"fa-solid fa-moon"; }
    },
    _applyPrefs(){
      this._applyTheme();
      if(typeof window.updateLanguage === "function") window.updateLanguage(this.getLang());
      window.dispatchEvent(new Event("prefsReady"));
    },
    async _savePrefs(){
      try{
        const u = window.auth && window.auth.currentUser;
        if(!u || !window.db) return;
        await db.collection("users").doc(u.uid).set({
          lang: _prefs.lang, theme: _prefs.theme, favorites: _prefs.favorites,
          updatedAt: new Date().toISOString()
        }, { merge:true });
      }catch(e){ /* قواعد الأمان قد تمنع؛ نتجاهل بهدوء */ }
    },

    /* ===== التهيئة ===== */
    async initData(){
      if(!window.db) return;
      try{
        const [setDoc, unitsSnap] = await Promise.all([
          db.collection("settings").doc("main").get(),
          db.collection("units").get()
        ]);
        if(!setDoc.exists){ await db.collection("settings").doc("main").set(DEFAULT_SETTINGS).catch(()=>{}); Object.assign(SETTINGS, DEFAULT_SETTINGS); }
        else { Object.assign(SETTINGS, mergeSettings(DEFAULT_SETTINGS, setDoc.data())); }

        if(unitsSnap.empty){
          for(const u of DEFAULT_UNITS) await db.collection("units").doc(u.id).set(u).catch(()=>{});
          UNITS.splice(0, UNITS.length, ...JSON.parse(JSON.stringify(DEFAULT_UNITS)));
        } else {
          const fetched = [];
          unitsSnap.forEach(d => {
            const data = d.data();
            // ادمج مع الافتراضي؛ تجاهل القيم الفارغة/الناقصة من Firestore
            const def = DEFAULT_UNITS.find(u => u.id === data.id);
            const merged = def ? mergeUnit(def, data) : data;
            fetched.push(merged);
          });
          fetched.sort((a,b)=>String(a.id).localeCompare(String(b.id)));
          UNITS.splice(0, UNITS.length, ...fetched);
        }

        // فعّل الاشتراك اللحظي إن لم يُفعَّل بعد
        _subscribeUnits();
      }catch(e){ console.error("Firebase fetch error:", e.code, e.message, e); }
    },
    _initAuth(){
      return new Promise(resolve => {
        if(!window.auth){ this._applyPrefs(); return resolve(); }
        let done = false;
        const finish = () => { if(!done){ done=true; try{this._applyPrefs();}catch(e){} resolve(); } };
        auth.onAuthStateChanged(async (user) => {
          if(user){
            await this._loadPrefs(user.uid);
            try{ this._applyPrefs(); }catch(e){} // أعد التطبيق دائماً حتى لو انتهى المهلة الزمنية مسبقاً
            finish();
          }
          else { try{ await auth.signInAnonymously(); }catch(e){ finish(); } }
        });
        // أمان: لا نعلّق الصفحة إلى الأبد إن تعذّرت المصادنة
        setTimeout(finish, 4000);
      });
    },
    async _loadPrefs(uid){
      try{
        const ref = db.collection("users").doc(uid);
        const d = await ref.get();
        if(d.exists){
          const data = d.data();
          _prefs.lang = data.lang || "ar";
          _prefs.theme = data.theme || null;
          _prefs.favorites = Array.isArray(data.favorites) ? data.favorites : [];
        } else {
          await ref.set({ lang:"ar", theme:null, favorites:[], createdAt:new Date().toISOString() });
        }
      }catch(e){ console.warn("prefs load failed", e); }
    },
    async initFirebaseData(){
      // المصادقة أولاً ثم جلب/زرع البيانات
      await this.initData();
      this._initAuth().catch(e => console.warn("auth init failed", e));
    },

    /* ===== الإعدادات ===== */
    getSettings(){ return Object.assign({}, SETTINGS); },
    async setSettings(s){
      const prev = Object.assign({}, SETTINGS);
      Object.assign(SETTINGS, s);
      // أبلغ الصفحات فوراً محلياً (onSnapshot قد يتأخر أو يُتجاهل بسبب hasPendingWrites)
      _lastSettingsKey = JSON.stringify({offer: SETTINGS.offer});
      window.dispatchEvent(new Event("settingsUpdated"));
      if(!window.db) return;
      try{
        // دمج (لا استبدال): أي حفظ لا يمسح حقولاً موجودة في Firestore
        // لكنها غير محمّلة في النسخة المحلية (مثل imgbbKey) — كان سبب
        // اختفاء المفتاح كل فترة.
        await db.collection("settings").doc("main").set(s, { merge:true });
      }catch(e){
        // فشلت الكتابة (صلاحيات/شبكة): استرجع الحالة السابقة حتى لا تعرض
        // اللوحة بيانات وهمية غير محفوظة ثم أبلغ الطبقات العليا بالخطأ
        Object.assign(SETTINGS, prev);
        _lastSettingsKey = JSON.stringify({offer: SETTINGS.offer});
        window.dispatchEvent(new Event("settingsUpdated"));
        throw e;
      }
    },

    /* ===== الاستراحات ===== */
    getUnits(){ return JSON.parse(JSON.stringify(UNITS)); },
    async setUnits(arr){
      const prev = JSON.parse(JSON.stringify(UNITS));
      UNITS.splice(0, UNITS.length, ...JSON.parse(JSON.stringify(arr)));
      // أبلغ الصفحات المفتوحة بإعادة العرض فوراً (لا ننتظر onSnapshot الذي قد
      // يطلق أولاً من cache محلي قديم ويمحو التحديث المحلي مؤقتاً)
      window.dispatchEvent(new Event("unitsUpdated"));
      if(!window.db) return;
      const batch = db.batch();
      arr.forEach(u => batch.set(db.collection("units").doc(u.id), u));
      try{
        await batch.commit();
      }catch(e){
        // فشلت الكتابة: استرجع النسخة السابقة لتطابق الواجهة قاعدة البيانات
        UNITS.splice(0, UNITS.length, ...prev);
        window.dispatchEvent(new Event("unitsUpdated"));
        throw e;
      }
      // أعد الإبلاغ بعد تأكيد الكتابة في الخادم
      window.dispatchEvent(new Event("unitsUpdated"));
    },

    /* جلب أحدث نسخة من استراحة مباشرة من الخادم (يتجاوز الكاش المحلي)
       وتحديث UNITS بها — يُستخدم قبل تأكيد الحجز لضمان سعر/توفر صحيحين.
       يُرجع null عند تعذّر الجلب (يُستخدم الكاش الحالي كبديل). */
    async refreshUnit(unitId){
      if(!window.db) return null;
      try{
        const snap = await db.collection("units").doc(String(unitId)).get({ source:"server" });
        if(!snap.exists) return null;
        const data = snap.data();
        const def = DEFAULT_UNITS.find(u => u.id === data.id);
        const fresh = def ? mergeUnit(def, data) : data;
        const i = UNITS.findIndex(u => u.id === fresh.id);
        if(i >= 0) UNITS.splice(i, 1, fresh); else UNITS.push(fresh);
        window.dispatchEvent(new Event("unitsUpdated"));
        return fresh;
      }catch(e){ console.warn("refreshUnit failed", e); return null; }
    },

    /* ===== الحجوزات ===== */
    async getBookings(){
      if(!window.db) throw new Error("Firebase is not ready");
      try{
        const snap = await db.collection("bookings").get();
        const bks = [];
        snap.forEach(d => { const data = d.data(); data.id = d.id; bks.push(data); });
        bks.sort((a,b)=> String(b.createdAt||"").localeCompare(String(a.createdAt||"")));
        return bks;
      }catch(e){ console.error("getBookings failed", e); throw e; }
    },
    async addBooking(b){
      if(!window.db && window.firebaseBootReady) await window.firebaseBootReady;
      if(!window.db) throw new Error("Firebase is not ready");
      b.createdAt = new Date().toISOString();
      // استخدم معرّف الحجز (BK...) كمعرّف للمستند ليكون الكتابة idempotent:
      // أي إرسال مكرّر بنفس المعرّف يكتب فوق المستند نفسه بدل إنشاء حجز ثانٍ.
      if(b.id){ await db.collection("bookings").doc(String(b.id)).set(b); }
      else { await db.collection("bookings").add(b); }
    },
    async deleteBooking(id){
      if(!window.db) throw new Error("Firebase is not ready");
      await db.collection("bookings").doc(id).delete();
    },

    /* ===== التقييمات ===== */
    async getReviews(unitId){
      if(!window.db) return [];
      const snap = await db.collection("reviews").where("unitId","==",unitId).get();
      const rs = [];
      snap.forEach(d => { const data = d.data(); data.id = d.id; rs.push(data); });
      return rs;
    },
    async getAllReviews(){
      if(!window.db) return [];
      try{
        const snap = await db.collection("reviews").get();
        const rs = [];
        snap.forEach(d => { const data = d.data(); data.id = d.id; rs.push(data); });
        rs.sort((a,b)=> String(b.createdAt||"").localeCompare(String(a.createdAt||"")));
        return rs;
      }catch(e){ console.error("getAllReviews failed", e); return []; }
    },
    async addReview(unitId, review){
      if(!window.db) return;
      review.unitId = unitId;
      review.createdAt = new Date().toISOString();
      await db.collection("reviews").add(review);
    },
    async deleteReview(id){
      if(!window.db) return;
      await db.collection("reviews").doc(id).delete();
    },

    /* ===== رفع/حذف صور الاستراحات (عبر ImgBB — مجاني تماماً) =====
       ملاحظة: مفتاح ImgBB يُقرأ من SETTINGS.imgbbKey (يُضبط من لوحة التحكم).
       ImgBB لا يدعم الحذف عبر الـAPI المجاني، لذا deleteImage تكتفي
       بإزالة الرابط من بيانات الاستراحة (لا يُحذف الملف من الخادم). */
    async uploadImage(file, unitId, onProgress){
      if(!file) throw new Error("لم يُحدّد ملف");
      const key = SETTINGS.imgbbKey;
      if(!key){
        throw new Error("IMGBB_NO_KEY");
      }
      // تحويل الملف إلى Base64 (متطلب واجهة ImgBB)
      const base64 = await new Promise((resolve, reject)=>{
        const r = new FileReader();
        r.onload = () => resolve(r.result.split(",")[1]); // إزالة بادئة data:image/...;base64,
        r.onerror = () => reject(new Error("تعذّر قراءة الملف"));
        r.readAsDataURL(file);
      });
      // محاكاة تقدّم بسيط (fetch لا يدعم تقدّم الرفع)
      if(typeof onProgress === "function"){ onProgress(50); }
      const fd = new FormData();
      fd.append("image", base64);
      fd.append("name", (file.name||"image").replace(/[^\w.\-]+/g,"_"));
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`, {
        method: "POST", body: fd
      });
      if(!res.ok){
        const t = await res.text().catch(()=>"");
        const detail = t ? ("): " + t) : ")";
        throw new Error("تعذّر الرفع إلى ImgBB (" + res.status + detail);
      }
      const data = await res.json();
      if(!data || !data.success || !data.data || !data.data.url){
        throw new Error("استجابة ImgBB غير متوقعة");
      }
      if(typeof onProgress === "function"){ onProgress(100); }
      const variants = data.data;
      const directUrl = variants.display_url || (variants.image && variants.image.url) || variants.url;
      // نُرجع الرابط الأكثر ملاءمة للعرض مع بدائل من استجابة ImgBB عند توفرها.
      return {
        url: directUrl,
        displayUrl: variants.display_url || null,
        imageUrl: variants.image && variants.image.url ? variants.image.url : null,
        thumbUrl: variants.thumb && variants.thumb.url ? variants.thumb.url : null,
        mediumUrl: variants.medium && variants.medium.url ? variants.medium.url : null,
        deleteUrl: variants.delete_url || null,
        id: variants.id || null
      };
    },
    // ImgBB لا يدعم الحذف المجاني عبر API — نكتفي بإزالة الرابط من الواجهة
    async deleteImage(url){
      console.info("deleteImage: تُزال الإشارة من بيانات الاستراحة فقط (ImgBB لا يحذف عبر API المجاني).", url);
    },

    /* ===== إعادة التعيين الكامل (لوحة التحكم) ===== */
    async _purgeCollection(name){
      // حذف كل مستندات مجموعة على دفعات (حد 500 عملية لكل batch)
      let snap = await db.collection(name).limit(450).get();
      while(!snap.empty){
        const b = db.batch();
        snap.forEach(d => b.delete(d.ref));
        await b.commit();
        snap = await db.collection(name).limit(450).get();
      }
    },
    async resetAll(){
      if(!window.db) return;
      // الإعدادات والاستراحات (إعادة زرع الافتراضي)
      await db.collection("settings").doc("main").set(DEFAULT_SETTINGS);
      Object.assign(SETTINGS, DEFAULT_SETTINGS);
      const unitBatch = db.batch();
      DEFAULT_UNITS.forEach(u => unitBatch.set(db.collection("units").doc(u.id), JSON.parse(JSON.stringify(u))));
      await unitBatch.commit();
      UNITS.splice(0, UNITS.length, ...JSON.parse(JSON.stringify(DEFAULT_UNITS)));
      // حذف الحجوزات والتقييمات (دفعات) — يُعاد رمي الخطأ ليُعالَج في الواجهة
      await this._purgeCollection("bookings");
      await this._purgeCollection("reviews");
    }
  };
}
