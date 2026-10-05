/* ============================================================
   منتجعات ماربيلا — مشترك بين كل الصفحات
   ربط الإعدادات + شريط التنقل + قائمة الجوال + كشف الظهور + Lightbox + تبديل اللغة
   ============================================================ */

const DICT = {
  ar: {
    "nav-about": "من نحن",
    "nav-units": "الاستراحات",
    "nav-faq": "الأسئلة الشائعة",
    "nav-cancellation": "سياسة الإلغاء",
    "nav-map": "الموقع",
    "hero-title": "تحت نجوم الصحراء… <em>تبدأ أجمل الجلسات</em>",
    "hero-sub": "ثلاث استراحات خاصة بمسابح ومجالس راقية في قلب الظاهرة — صُممت لخصوصيتك التامة وللّحظات جمعك العائلية بعد الغروب.",
    "hero-meta-text": "ثلاث استراحات فاخرة",
    "units-eye": "اختر استراحتك",
    "btn-book": "احجز الآن",
    "btn-choose": "اختر استراحتك",
    "btn-wa": "تواصل عبر واتساب",
    "btn-pdf": "تحميل الكتيب (PDF)",
    "unit-capacity": "السعة:",
    "unit-night": "/الليلة",
    "unit-details": "التفاصيل",
    "unit-location": "الموقع",
    "rooms": "غرف نوم",
    "baths": "دورات مياه",
    "pools": "مسبح",
    "fav-title": "مفضّلتي",
    "footer-rights": "جميع الحقوق محفوظة",
    "lbl-lang": "English",
    "search-placeholder": "ابحث بالاسم...",
    "sort-default": "الترتيب الافتراضي",
    "sort-price-asc": "السعر: الأقل أولًا",
    "sort-price-desc": "السعر: الأعلى أولًا",
    "sort-capacity": "الأكثر سعة",
    "exp-title": "ثلاث استراحات، <span class='gradient-text'>تجربة واحدة</span>",
    "exp-sub": "كل استراحة مستقلة بمسبحها ومجلسها. اختر التاريخ من التقويم ثم أرسل طلبك مباشرة عبر واتساب.",
    "stat-resorts": "استراحات فاخرة",
    "stat-guests": "ضيف سعيد",
    "stat-service": "خدمة عملاء",
    "stat-privacy": "خصوصية تامة",
    "why-eye": "لماذا ماربيلا",
    "why-title": "تجربة تستحقها",
    "why-1-t": "خصوصية تامة",
    "why-1-d": "استراحات مستقلة بالكامل بعيداً عن الزحام",
    "why-2-t": "مسابح خاصة",
    "why-2-d": "لكل استراحة مسبحها المنفصل",
    "why-3-t": "مجالس راقية",
    "why-3-d": "مجالس داخلية وخارجية بديكور فاخر",
    "why-4-t": "حجز سهل",
    "why-4-d": "اختر التاريخ وأرسل طلبك عبر واتساب",
    "test-eye": "آراء ضيوفنا",
    "test-title": "قصص نجاح حقيقية",
    "loc-eye": "الموقع",
    "loc-title": "في قلب",
    "offer-ended": "انتهى العرض",
    "book-deposit": "تأكيد الحجز يتطلب دفع عربون بقيمة 500 درهم لحساب رقم:",
    "pledge-pool": "أتعهد بعدم استخدام أي مواد تغير لون المسبح (صابون، ألوان، إلخ).",
    "directions-title": "طريقة الوصول",
    "stay-night": "مع مبيت",
    "stay-day": "نهاري",
    "weekend": "ويكند",
    "pledge-title": "العربون والتعهد",
    "pledge-deposit": "عربون لتأكيد الحجز عند الطلب",
    "pledge-insurance": "تأمين مسترجع",
    "pledge-insurance-desc": "يُسترد كاملاً عند عدم وجود تلف أو فقد أو كسر",
    "pledge-agree": "أتعهد بعدم تغيير لون مياه المسبح أو إفسادها، وأوافق على دفع العربون والتأمين. أُقرّ بصحة المعلومات أعلاه.",
    "pledge-required": "يجب الموافقة على التعهد لإكمال الحجز"
  },
  en: {
    "nav-about": "About Us",
    "nav-units": "Resorts",
    "nav-faq": "FAQ",
    "nav-cancellation": "Cancellation Policy",
    "nav-map": "Location",
    "hero-title": "Beneath the desert stars… <em>the finest gatherings begin</em>",
    "hero-sub": "Three private resorts with pools and elegant lounges in the heart of Al Dhahirah — designed for total privacy.",
    "hero-meta-text": "Three Luxury Resorts",
    "units-eye": "Choose Your Resort",
    "btn-book": "Book Now",
    "btn-choose": "Choose Resort",
    "btn-wa": "Contact via WhatsApp",
    "btn-pdf": "Download Brochure (PDF)",
    "unit-capacity": "Capacity:",
    "unit-night": "/Night",
    "unit-details": "Details",
    "unit-location": "Location",
    "rooms": "Rooms",
    "baths": "Baths",
    "pools": "Pool",
    "fav-title": "Favorites",
    "footer-rights": "All rights reserved",
    "lbl-lang": "عربي",
    "search-placeholder": "Search by name...",
    "sort-default": "Default Sort",
    "sort-price-asc": "Price: Low to High",
    "sort-price-desc": "Price: High to Low",
    "sort-capacity": "Highest Capacity",
    "exp-title": "Three Resorts, <span class='gradient-text'>One Experience</span>",
    "exp-sub": "Each resort is fully independent with its own pool and lounge. Choose a date and book directly via WhatsApp.",
    "stat-resorts": "Luxury Resorts",
    "stat-guests": "Happy Guests",
    "stat-service": "Customer Service",
    "stat-privacy": "Total Privacy",
    "why-eye": "Why Marbella",
    "why-title": "An Experience You Deserve",
    "why-1-t": "Total Privacy",
    "why-1-d": "Fully independent resorts away from the crowd",
    "why-2-t": "Private Pools",
    "why-2-d": "Each resort has its own separate pool",
    "why-3-t": "Elegant Lounges",
    "why-3-d": "Luxurious indoor and outdoor seating",
    "why-4-t": "Easy Booking",
    "why-4-d": "Select date and book via WhatsApp",
    "test-eye": "Guest Reviews",
    "test-title": "Real Success Stories",
    "loc-eye": "Location",
    "loc-title": "In the Heart of",
    "offer-ended": "Offer Ended",
    "book-deposit": "Booking requires a 500 AED deposit to account:",
    "pledge-pool": "I pledge not to use any substances that change the pool water color (dyes, soap, etc).",
    "directions-title": "Directions",
    "stay-night": "With overnight stay",
    "stay-day": "Day use",
    "weekend": "Weekend",
    "pledge-title": "Deposit & Pledge",
    "pledge-deposit": "Deposit to confirm booking",
    "pledge-insurance": "Refundable insurance",
    "pledge-insurance-desc": "Fully refunded if no damage, loss, or breakage",
    "pledge-agree": "I pledge not to change the pool water color or damage it, and I agree to pay the deposit and insurance. I confirm the above information is correct.",
    "pledge-required": "You must agree to the pledge to complete booking"
  }
};

const urlLang = new URLSearchParams(location.search).get("lang");
let currentLang = (urlLang === "ar" || urlLang === "en")
  ? urlLang
  : ((window.MarbellaStore && window.MarbellaStore.getLang) ? window.MarbellaStore.getLang() : "ar");

/* تهيئة موحّدة للصفحات العامة: انتظار Firebase + initShell + رد نداء جاهز */
window.bootstrapPage = function(onReady){
  document.addEventListener("DOMContentLoaded", async () => {
    initShell();
    if(typeof onReady === "function"){ try{ await onReady(); }catch(e){ console.error(e); } }
    if(window.MarbellaStore){
      const firebaseReady = window.db ? Promise.resolve() : (window.firebaseBootReady || Promise.resolve());
      firebaseReady.then(() => window.MarbellaStore.initFirebaseData()).then(() => {
        initShell();
        window.dispatchEvent(new Event("firebaseDataReady"));
      }).catch(e => console.error("initFirebaseData failed:", e));
    }
  });
};


function tr(key){
  return DICT[currentLang][key] || key;
}

function updateLanguage(lang) {
  const prevLang = currentLang;
  currentLang = lang;
  if(prevLang !== lang && window.MarbellaStore && window.MarbellaStore.setLang) window.MarbellaStore.setLang(lang);

  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === "ar" ? "rtl" : "ltr";
  
  // Update static text elements
  document.querySelectorAll("[data-tr]").forEach(el => {
    const key = el.getAttribute("data-tr");
    if(DICT[lang][key]){
      if (el.tagName === "INPUT" && el.type === "search") {
        el.placeholder = DICT[lang][key];
      } else {
        el.innerHTML = DICT[lang][key];
      }
    }
  });

  // Update dynamic parts like settings
  const $ = id => document.getElementById(id);
  const set = (id, val) => { const el = $(id); if(el) el.textContent = val; };
  const brand = lang === "ar" ? SETTINGS.brandName : SETTINGS.brandNameEn;
  const area = lang === "ar" ? SETTINGS.areaName : (SETTINGS.areaNameEn || SETTINGS.areaName);
  
  set("brandName", brand);
  set("footerBrand", brand);
  set("heroBrand", brand);
  
  set("areaName", area);
  set("areaName2", area);
  set("areaName3", area);
  
  // Trigger custom event so other scripts can re-render if needed
  if(prevLang !== lang) window.dispatchEvent(new Event("languageChanged"));
}

/* ===== ربط الإعدادات العامة بالعناصر ===== */
function initShell(){
  const $ = id => document.getElementById(id);
  const wa = `https://wa.me/${SETTINGS.whatsapp}`;
  const set = (id, val) => { const el = $(id); if(el) el.textContent = val; };
  const href = (id, url) => { const el = $(id); if(el) el.href = url; };

  const isEn = typeof currentLang !== "undefined" && currentLang === "en";
  const brand = isEn ? SETTINGS.brandNameEn : SETTINGS.brandName;
  const area = isEn ? (SETTINGS.areaNameEn || SETTINGS.areaName) : SETTINGS.areaName;
  
  set("heroBrand", brand);
  set("brandName", brand);
  set("footerBrand", brand);
  
  if(SETTINGS.logoPath){
    document.querySelectorAll(".logo, .login-logo, [data-logo]").forEach(img => {
      if(img && img.tagName === "IMG") img.src = SETTINGS.logoPath;
    });
  }
  
  const emailEl = $("footer-email");
  if(emailEl && SETTINGS.email) emailEl.textContent = SETTINGS.email;
  
  const bankEl = $("bank-account");
  if(bankEl && SETTINGS.bankAccount) bankEl.textContent = SETTINGS.bankAccount;
  
  const dirEl = $("directions-text");
  const dirVal = isEn ? (SETTINGS.directionsEn || SETTINGS.directions) : SETTINGS.directions;
  if(dirEl && dirVal) dirEl.textContent = dirVal;
  
  
  set("areaName", area);
  set("areaName2", area);
  set("areaName3", area);
  set("footerPhone", SETTINGS.phoneDisplay);
  set("year", new Date().getFullYear());

  href("link-whatsapp", wa);
  href("footer-whatsapp", wa);
  href("cta-whatsapp", wa);
  href("float-whatsapp", wa);
  href("hero-wa", wa);
  if($("cta-wa")) href("cta-wa", wa);
  href("link-instagram", SETTINGS.instagram);
  href("footer-instagram", SETTINGS.instagram);
  href("link-tiktok", SETTINGS.tiktok);
  href("footer-tiktok", SETTINGS.tiktok);

  const mapEl = $("area-map");
  if(mapEl && UNITS[0]) mapEl.src = `https://www.google.com/maps?q=${UNITS[0].lat},${UNITS[0].lng}&z=14&output=embed`;

  const nav = $("navbar");
  if(nav && !nav.dataset.scrollBound){
    nav.dataset.scrollBound = "1";
    window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > 20), {passive:true});
  }

  const toggle = $("nav-toggle");
  const links = $("nav-links");
  if(toggle && links && !toggle.dataset.navBound){
    toggle.dataset.navBound = "1";
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded","false");
    }));
  }

  applyRevealEffects();

  const tToggle = $("theme-toggle");
  if(tToggle){
    const store = window.MarbellaStore;
    const isDark = store ? (store.getTheme()==="dark") : document.documentElement.classList.contains("theme-dark");
    tToggle.querySelector("i").className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    if(!tToggle.dataset.themeBound){
      tToggle.dataset.themeBound = "1";
      tToggle.addEventListener("click",()=>{
        if(store && store.toggleTheme) store.toggleTheme();
      });
    }
  }

  const lToggle = $("lang-toggle");
  if(lToggle && !lToggle.dataset.langBound){
    lToggle.dataset.langBound = "1";
    lToggle.addEventListener("click",()=>{
      const nextLang = currentLang === "ar" ? "en" : "ar";
      updateLanguage(nextLang);
    });
  }

  // Initial lang setup
  updateLanguage(currentLang);
}

function applyRevealEffects(root){
  const scope = root || document;
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const reveals = scope.querySelectorAll(".reveal:not(.in)");
  if(reduce || !("IntersectionObserver" in window)){
    reveals.forEach(e => e.classList.add("in"));
  } else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
    }), {threshold:.15, rootMargin:"0px 0px -40px 0px"});
    reveals.forEach(e => io.observe(e));
  }
}
window.applyRevealEffects = applyRevealEffects;

/* ===== Lightbox ===== */
let _lbState = {imgs:[], idx:0, lastFocus:null};
function _lbFocusables(){
  const lb = document.getElementById("lightbox");
  if(!lb) return [];
  return [...lb.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])')].filter(el=>!el.disabled && el.offsetParent!==null);
}
function openLightbox(images, startIdx){
  images = getImageList(images);
  if(!images.length) return;
  _lbState.imgs = images; _lbState.idx = startIdx || 0;
  _lbState.lastFocus = document.activeElement;
  let lb = document.getElementById("lightbox");
  if(!lb){
    lb = document.createElement("div");
    lb.id = "lightbox"; lb.className = "lightbox"; lb.hidden = true;
    lb.setAttribute("role","dialog");
    lb.setAttribute("aria-modal","true");
    lb.setAttribute("aria-label","معاينة الصور");
    lb.innerHTML = `
      <button class="lb-close" aria-label="إغلاق"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      <button class="lb-nav prev" aria-label="السابق"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>
      <img src="" alt="معاينة الصورة" data-fallback />
      <button class="lb-nav next" aria-label="التالي"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>
      <div class="lb-counter"></div>`;
    document.body.appendChild(lb);
    lb.addEventListener("click", e => {
      if(e.target === lb || e.target.closest(".lb-close")) closeLightbox();
      if(e.target.closest(".lb-nav.prev")) _lbNav(-1);
      if(e.target.closest(".lb-nav.next")) _lbNav(1);
    });
  }
  // مستمع لوحة المفاتيح على مستوى المستند (لا يعتمد على بقاء التركيز داخل lb)
  if(!_lbState.keyBound){
    _lbState.keyBound = true;
    document.addEventListener("keydown", e => {
      const lb = document.getElementById("lightbox");
      if(!lb || lb.hidden) return;
      if(e.key === "Escape"){ e.preventDefault(); closeLightbox(); }
      else if(e.key === "ArrowLeft"){ _lbNav(1); }
      else if(e.key === "ArrowRight"){ _lbNav(-1); }
      else if(e.key === "Tab"){
        const f = _lbFocusables();
        if(!f.length) return;
        const first = f[0], last = f[f.length-1];
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
    });
  }
  lb.hidden = false;
  document.body.style.overflow = "hidden";
  _lbRender();
  // ركّز على زر الإغلاق بعد الفتح
  requestAnimationFrame(()=>{ const c = lb.querySelector(".lb-close"); if(c) c.focus(); });
}
function _lbRender(){
  const lb = document.getElementById("lightbox");
  const img = lb.querySelector("img");
  img.dataset.fallbackApplied = "0";
  img.src = getImageSrc(_lbState.imgs[_lbState.idx]);
  lb.querySelector(".lb-counter").textContent = (_lbState.idx+1) + " / " + _lbState.imgs.length;
  lb.setAttribute("aria-label", "صورة " + (_lbState.idx+1) + " من " + _lbState.imgs.length);
  wireImageFallbacks(lb);
}
function _lbNav(dir){
  if(!_lbState.imgs.length) return;
  _lbState.idx = (_lbState.idx + dir + _lbState.imgs.length) % _lbState.imgs.length;
  _lbRender();
}
function closeLightbox(){
  const lb = document.getElementById("lightbox");
  if(lb){ lb.hidden = true; document.body.style.overflow = ""; }
  // استعادة التركيز إلى العنصر الذي فتح الـlightbox
  if(_lbState.lastFocus && typeof _lbState.lastFocus.focus === "function"){
    try{ _lbState.lastFocus.focus(); }catch(e){}
  }
  _lbState.lastFocus = null;
}
