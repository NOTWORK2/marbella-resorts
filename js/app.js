/* ============================================================
   تطبيق منتجعات ماربيلا — تقويم + خرائط + واتساب
   ملاحظة: AR_MONTHS/AR_DOW/pad/toISO مُعرّفة في data.js (مصدر مشترك)
   ============================================================ */

let currentUnit = null;   // الإستراحة المختارة حالياً
let calDate = new Date();  // الشهر المعروض في التقويم
let selectedDate = null;   // التاريخ المختار من المستخدم
let stayType = "night";     // نوع الحجز: "night" (مع مبيت) أو "day" (نهاري)
let _bookingId = null;      // معرّف ثابت لمحاولة الحجز الحالية (يمنع تكرار المستند)

/* ===== أسعار نوع الحجز =====
   كل سعر رقم صريح يُحدّد من لوحة التحكم (لا نسب مئوية).
   4 أسعار لكل استراحة: مبيت/نهاري × أيام الأسبوع/ويكند (الجمعة والسبت).
   isWeekendDate/unitPriceFor مُعرّفتان في data.js (مصدر مشترك). */
function getStayPrice(unit, date){
  return unitPriceFor(unit, stayType, isWeekendDate(date || selectedDate));
}
function getStayLabel(){
  return stayType === "day" ? "نهاري (بدون مبيت)" : "مع مبيت";
}
function getPeriodLabel(weekend){
  return weekend ? "ويكند (جمعة/سبت)" : "أيام الأسبوع";
}

/* ===== حالة الفلاتر ===== */
let unitFilters = { q:"", sort:"default", feats:[], section:"all" };

/* استخراج رقم السعة من نص مثل "تسع حتى 20 شخص" */
function parseCapacity(text){
  const m = String(text||"").match(/\d+/);
  return m ? parseInt(m[0],10) : 0;
}

/* تطبيق الفلاتر والفرز على قائمة الوحدات */
function getFilteredUnits(){
  let list = UNITS.slice();
  
  // فلترة القسم
  if(unitFilters.section !== "all"){
    list = list.filter(u => u.section === unitFilters.section);
  }
  
  // بحث نصي
  const q = unitFilters.q.trim().toLowerCase();
  if(q) list = list.filter(u=>(u.name+" "+u.nameEn+" "+u.tagline+" "+u.taglineEn+" "+(u.features||[]).join(" ")).toLowerCase().includes(q));
  
  // فلترة بالمميزات المختارة
  if(unitFilters.feats.length){
    list = list.filter(u=>unitFilters.feats.every(f=>(u.features||[]).includes(f)));
  }
  // فرز
  switch(unitFilters.sort){
    case "price-asc":  list.sort((a,b)=>a.price-b.price); break;
    case "price-desc": list.sort((a,b)=>b.price-a.price); break;
    case "capacity":   list.sort((a,b)=>parseCapacity(b.capacity)-parseCapacity(a.capacity)); break;
  }
  return list;
}

/* بناء رقائق فلترة المميزات من كل الوحدات */
function buildFilterChips(){
  const wrap = document.getElementById("filter-feats");
  if(!wrap) return;
  const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';
  const feats = [...new Set(UNITS.flatMap(u => isEn ? (u.featuresEn || []) : (u.features || [])))];
  wrap.innerHTML = feats.map(f=>`<button class="fb-chip" data-feat="${esc(f)}" aria-pressed="false">${esc(f)}</button>`).join("");
  wrap.querySelectorAll("[data-feat]").forEach(chip=>{
    chip.addEventListener("click",()=>{
      const f = chip.dataset.feat;
      const i = unitFilters.feats.indexOf(f);
      if(i>=0){ unitFilters.feats.splice(i,1); chip.setAttribute("aria-pressed","false"); }
      else { unitFilters.feats.push(f); chip.setAttribute("aria-pressed","true"); }
      renderUnits();
    });
  });
}


/* ===== أدوات مساعدة ===== */
function isSameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}

/* ===== ربط الإعدادات بالواجهة (مشترك عبر shared.js#initShell) ===== */
function initSettings(){
  initShell();
  
  // Re-render on language change
  window.addEventListener("languageChanged", () => {
    renderUnits();
    buildFilterChips();
    renderTestimonials();
  });
}

function clearFilters(){
  unitFilters = { q:"", sort:"default", feats:[], section:"all" };
  const s = document.getElementById("filter-search"); if(s) s.value="";
  const so = document.getElementById("filter-sort"); if(so) so.value="default";
  document.querySelectorAll(".fb-chip").forEach(c=>c.setAttribute("aria-pressed","false"));
  renderUnits();
}

/* ===== عرض بطاقات الاستراحات ===== */
function renderUnits(filterFn){
  const grid = document.getElementById("units-grid");
  const list = filterFn ? UNITS.filter(filterFn) : getFilteredUnits();
  const store = window.MarbellaStore;
  if(!list.length){
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--muted)"><i class="fa-solid fa-magnifying-glass-minus" style="font-size:2rem;opacity:.4;display:block;margin-bottom:.6rem"></i>لا توجد استراحات مطابقة لبحثك. <button class="fb-clear" id="fb-clear">مسح الفلاتر</button></div>`;
    const clr = document.getElementById("fb-clear");
    if(clr) clr.addEventListener("click",clearFilters);
    return;
  }
  grid.innerHTML = list.map(u => {
    const isEn = currentLang === "en";
    const name = isEn ? (u.nameEn || u.name) : u.name;
    const tagline = isEn ? (u.taglineEn || u.tagline) : u.tagline;
    const capacity = isEn ? (u.capacityEn || u.capacity) : u.capacity;
    const currency = isEn ? (u.currencyEn || u.currency) : u.currency;
    const featsList = (isEn ? (u.featuresEn || u.features) : u.features) || [];
    const imgs = getImageList(u.images);
    
    const features = featsList.map(f=>`<span class="chip"><i class="fa-solid fa-check"></i>${esc(f)}</span>`).join("");
    const dots = imgs.map((_,i)=>`<span${i===0?' class="active"':''}></span>`).join("");
    const fav = store && store.isFavorite(u.id);
    const { night, day, wNight, wDay } = getUnitPrices(u);
    const hasDay = u.dayPrice && u.dayPrice !== u.price;
    const hasWeekend = (wNight !== night) || (wDay !== day);
    let priceHTML = "";
    if(hasDay){
      priceHTML += `<span class="price-night">${esc(night)} <small>${esc(currency)} ${tr("unit-night")}</small></span>`;
      priceHTML += `<span class="price-day">${esc(day)} <small>${esc(currency)} ${tr("stay-day")}</small></span>`;
    } else {
      priceHTML += `<span class="unit-price">${esc(night)} <small>${esc(currency)} ${tr("unit-night")}</small></span>`;
    }
    if(hasWeekend){
      priceHTML += `<span class="price-weekend"><i class="fa-solid fa-umbrella-beach" aria-hidden="true"></i> ${tr("weekend")}: ${esc(wNight)} <small>${esc(currency)}</small></span>`;
    }
    
    return `
    <article class="unit-card">
      <div class="unit-gallery" id="gal-${esc(u.id)}">
        <img src="${esc(getImageSrc(imgs[0]))}" alt="${esc(name)}" width="400" height="250" loading="lazy" data-fallback />
        <span class="unit-prices">${priceHTML}</span>
        
        <div class="likes-badge">
          <button class="fav-btn ${fav?'on':''}" data-fav="${esc(u.id)}" aria-label="${fav?'Remove favorite':'Add favorite'}" aria-pressed="${fav?'true':'false'}">
            <i class="fa-${fav?'solid':'regular'} fa-heart"></i>
          </button>
          <span class="likes-count">${esc(u.likes || 0)}</span>
        </div>

        <div class="gallery-nav">
          <button class="gal-prev" data-unit="${esc(u.id)}" aria-label="السابق"><i class="fa-solid fa-chevron-${isEn?'left':'right'}"></i></button>
          <button class="gal-next" data-unit="${esc(u.id)}" aria-label="التالي"><i class="fa-solid fa-chevron-${isEn?'right':'left'}"></i></button>
        </div>
        <div class="gallery-dots">${dots}</div>
      </div>
      <div class="unit-body">
        
        <h3>${esc(name)}</h3>
        <p class="unit-tag">${esc(tagline)}</p>
        
        <div class="numeric-amenities">
          <span class="amenity-badge"><i class="fa-solid fa-users"></i> ${esc(capacity)}</span>
          <span class="amenity-badge"><i class="fa-solid fa-bed"></i> ${esc(u.roomsNum || 0)} ${tr("rooms")}</span>
          <span class="amenity-badge"><i class="fa-solid fa-bath"></i> ${esc(u.bathsNum || 0)} ${tr("baths")}</span>
          <span class="amenity-badge"><i class="fa-solid fa-water-ladder"></i> ${esc(u.poolsNum || 1)} ${tr("pools")}</span>
        </div>

        <div class="unit-features">${features}</div>
        
        <div class="unit-actions">
          <a class="btn-outline" href="unit-details.html?id=${encodeURIComponent(u.id)}"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> ${tr("unit-details")}</a>
          <a class="btn-outline" href="https://www.google.com/maps?q=${encodeURIComponent(u.lat)},${encodeURIComponent(u.lng)}&z=15" target="_blank" rel="noopener"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${tr("unit-location")}</a>

          <button class="btn btn-wa btn-book" data-book="${esc(u.id)}" style="grid-column: 1/-1;"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> ${tr("btn-book")}</button>
        </div>
      </div>
    </article>`;
  }).join("");

  // أزرار الحجز (داخل شبكة الاستراحات فقط — تفادياً لربط أزرار قسم المفضّلة مكرراً)
  grid.querySelectorAll("[data-book]").forEach(btn=>{
    btn.addEventListener("click",()=>openBooking(btn.dataset.book));
  });

  // أزرار المفضّلة
  grid.querySelectorAll("[data-fav]").forEach(btn=>{
    btn.addEventListener("click",(e)=>{
      e.stopPropagation();
      const id = btn.dataset.fav;
      const store = window.MarbellaStore;
      store.toggleFavorite(id);
      const on = store.isFavorite(id);
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-pressed", on?"true":"false");
      btn.setAttribute("aria-label", on?"إزالة من المفضّلة":"إضافة للمفضّلة");
      btn.querySelector("i").className = `fa-${on?'solid':'regular'} fa-heart`;
      updateFavCount();
      // تحديث قسم المفضّلة إن كان مرئياً
      const fg = document.getElementById("fav-grid");
      if(fg && !fg.hidden) renderFavorites();
    });
  });

  // معرض الصور (تبديل يدوي)
  list.forEach(u=>{
    const imgs = getImageList(u.images);
    const img = document.querySelector(`#gal-${u.id} img`);
    document.querySelector(`#gal-${u.id} .gal-next`).addEventListener("click",(e)=>{e.stopPropagation();switchImg(u,img,1);});
    document.querySelector(`#gal-${u.id} .gal-prev`).addEventListener("click",(e)=>{e.stopPropagation();switchImg(u,img,-1);});
    // فتح Lightbox عند النقر على الصورة
    img.addEventListener("click",()=>{
      if(!imgs.length || img.dataset.fallbackApplied === "1") return;
      const idx = imgs.indexOf(img.getAttribute("src"));
      openLightbox(imgs, idx<0?0:idx);
    });
    img.style.cursor = imgs.length ? "zoom-in" : "default";
  });
  initImgShimmer();
  wireImageFallbacks(grid);
}

/* ===== قسم المفضّلة ===== */
function updateFavCount(){
  const store = window.MarbellaStore;
  const n = store ? store.getFavorites().length : 0;
  const badge = document.getElementById("fav-count");
  if(badge){ badge.textContent = n; badge.hidden = n===0; }
}

function renderFavorites(){
  const grid = document.getElementById("fav-grid");
  const empty = document.getElementById("fav-empty");
  const store = window.MarbellaStore;
  if(!store){ grid.innerHTML=""; return; }
  const favIds = store.getFavorites();
  const favUnits = UNITS.filter(u=>favIds.includes(u.id));
  if(!favUnits.length){
    grid.innerHTML = "";
    if(empty) empty.hidden = false;
    return;
  }
  if(empty) empty.hidden = true;
  grid.innerHTML = favUnits.map(u => {
    const features = (u.features||[]).map(f=>`<span class="chip"><i class="fa-solid fa-check"></i>${esc(f)}</span>`).join("");
    const imgs = getImageList(u.images);
    return `
    <article class="unit-card">
      <div class="unit-gallery">
        <img src="${esc(getImageSrc(imgs[0]))}" alt="صورة ${esc(u.name)}" width="400" height="250" loading="lazy" data-fallback />
        <span class="unit-price">${esc(u.price)} <small>${esc(u.currency)}/الليلة</small></span>
        <button class="fav-btn on" data-fav="${esc(u.id)}" aria-label="إزالة من المفضّلة" aria-pressed="true"><i class="fa-solid fa-heart"></i></button>
      </div>
      <div class="unit-body">
        
        <h3>${esc(u.name)}</h3>
        <p class="unit-tag">${esc(u.tagline)}</p>
        <div class="unit-features">${features}</div>
        <div class="unit-actions">
          <a class="btn-outline" href="unit-details.html?id=${encodeURIComponent(u.id)}"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> التفاصيل</a>
          <button class="btn btn-wa btn-book" data-book="${esc(u.id)}"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> احجز</button>
        </div>
      </div>
    </article>`;
  }).join("");
  // ربط أزرار المفضّلة والحجز في قسم المفضّلة
  grid.querySelectorAll("[data-fav]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const id = btn.dataset.fav;
      store.toggleFavorite(id);
      updateFavCount();
      renderFavorites();
    });
  });
  grid.querySelectorAll("[data-book]").forEach(btn=>{
    btn.addEventListener("click",()=>openBooking(btn.dataset.book));
  });
  wireImageFallbacks(grid);
}

/* ===== عدّاد العروض التنازلي =====
   يُعاد بناؤه نظيفاً: متغيّر عام للـ interval يُوقف قبل أي إعادة تشغيل،
   ويقرأ القيم من SETTINGS.offer مباشرة كل ثانية (لا قيم محجوزة قديمة). */
let _offerTimer = null;
function initCountdown(){
  const banner = document.getElementById("offer-banner");
  if(!banner) return;
  // أوقف أي عدّاد سابق قبل بدء جديد (يمنع تضارب العدّادات)
  if(_offerTimer){ clearInterval(_offerTimer); _offerTimer = null; }

  function render(){
    const off = SETTINGS.offer;
    // لا عرض أو غير مُفعّل: أخفِ البانر وأوقف العدّاد
    if(!off || !off.active || !off.target){
      banner.hidden = true;
      if(_offerTimer){ clearInterval(_offerTimer); _offerTimer = null; }
      return;
    }
    banner.hidden = false;
    const isEn = currentLang === "en";
    const label = isEn ? (off.labelEn || off.label) : off.label;
    const target = new Date(off.target + "T23:59:59");
    const start = off.start ? new Date(off.start + "T00:00:00") : null;
    const now = new Date();
    // إن لم يبدأ العرض بعد
    if(start && now < start){
      banner.innerHTML = `<div class="ob-label"><i class="fa-solid fa-fire" aria-hidden="true"></i> ${label}</div>`;
      return;
    }
    let diff = Math.max(0, target - now);
    if(diff <= 0){
      banner.innerHTML = `<div class="ob-label"><i class="fa-solid fa-fire" aria-hidden="true"></i> ${label} — ${tr("offer-ended")}</div>`;
      if(_offerTimer){ clearInterval(_offerTimer); _offerTimer = null; }
      return;
    }
    const days = Math.floor(diff / 86400000); diff %= 86400000;
    const hrs  = Math.floor(diff / 3600000); diff %= 3600000;
    const mins = Math.floor(diff / 60000); diff %= 60000;
    const secs = Math.floor(diff / 1000);
    banner.innerHTML = `
      <div class="ob-label"><i class="fa-solid fa-fire" aria-hidden="true"></i> ${label}</div>
      <div class="countdown" aria-live="off">
        <div class="cd-unit"><strong>${days}</strong><small>${isEn?"Days":"يوم"}</small></div>
        <div class="cd-unit"><strong>${pad(hrs)}</strong><small>${isEn?"Hrs":"ساعة"}</small></div>
        <div class="cd-unit"><strong>${pad(mins)}</strong><small>${isEn?"Min":"دقيقة"}</small></div>
        <div class="cd-unit"><strong>${pad(secs)}</strong><small>${isEn?"Sec":"ثانية"}</small></div>
      </div>`;
  }
  render();
  _offerTimer = setInterval(render, 1000);
}

/* ===== عرض قصص النجاح ===== */
async function renderTestimonials(){
  const wrap = document.getElementById("testimonials-grid");
  if(!wrap) return;
  const isEn = currentLang === "en";

  // جرّب التقييمات الحقيقية من Firebase أولاً
  let real = [];
  if(window.db && window.MarbellaStore){
    try{ real = await window.MarbellaStore.getAllReviews(); }catch(e){ real = []; }
  }
  real.sort((a,b)=> String(b.createdAt||"").localeCompare(String(a.createdAt||"")));

  const card = t => {
    const stars = "★".repeat(t.rating||0) + "☆".repeat(5-(t.rating||0));
    const name = isEn ? (t.nameEn || t.name) : t.name;
    const role = isEn ? (t.roleEn || t.role) : (t.role || (t.unitName || "ضيف"));
    const text = isEn ? (t.textEn || t.text) : t.text;
    return `
    <figure class="testimonial-card reveal">
      <div class="t-stars" aria-label="${t.rating||0} من 5">${stars}</div>
      <blockquote>"${esc(text)}"</blockquote>
      <figcaption>
        <span class="t-avatar">${esc(name.charAt(0))}</span>
        <span><strong>${esc(name)}</strong><small>${esc(role)}</small></span>
      </figcaption>
    </figure>`;
  };

  const hasReal = real.length > 0;
  const list = hasReal ? real : (typeof TESTIMONIALS !== "undefined" ? TESTIMONIALS : []);
  wrap.innerHTML = list.map(card).join("");
  if(typeof window.applyRevealEffects === "function") window.applyRevealEffects(wrap);
}


function switchImg(u,img,dir){
  const imgs = getImageList(u.images);
  if(!imgs.length) return;
  const gal = img.closest(".unit-gallery");
  let idx = imgs.indexOf(img.getAttribute("src"));
  if(idx < 0) idx = 0;
  idx = (idx + dir + imgs.length) % imgs.length;
  img.dataset.fallbackApplied = "0";
  img.setAttribute("src",imgs[idx]);
  if(gal){
    gal.querySelectorAll(".gallery-dots span").forEach((d,i)=>d.classList.toggle("active",i===idx));
  }
}

/* ===== التقويم ===== */
function renderCalendar(){
  const wrap = document.getElementById("calendar");
  const y = calDate.getFullYear();
  const m = calDate.getMonth();
  const first = new Date(y,m,1);
  const startDay = first.getDay(); // 0=الأحد
  const daysInMonth = new Date(y,m+1,0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);

  let html = `<div class="cal-nav">
      <button id="cal-prev" aria-label="الشهر السابق"><i class="fa-solid fa-chevron-right"></i></button>
      <span>${AR_MONTHS[m]} ${y}</span>
      <button id="cal-next" aria-label="الشهر التالي"><i class="fa-solid fa-chevron-left"></i></button>
    </div><div class="cal-grid">`;

  AR_DOW.forEach((d,i)=> html += `<div class="cal-dow${(i===5||i===6)?' cal-dow-weekend':''}">${d}</div>`);

  for(let i=0;i<startDay;i++) html += `<div class="cal-day empty"></div>`;

  const booked = currentUnit ? currentUnit.booked : [];

  for(let d=1; d<=daysInMonth; d++){
    const date = new Date(y,m,d);
    const iso = toISO(date);
    const isPast = date < today;
    const isBooked = booked.includes(iso);
    const isSelected = selectedDate && isSameDay(date,selectedDate);
    const isWeekend = isWeekendDate(date);
    let cls = "cal-day ";
    if(isPast)        cls += "past";
    else if(isBooked) cls += "booked";
    else              cls += isSelected ? "selected" : "free";
    if(isWeekend && !isPast && !isBooked && !isSelected) cls += " weekend";
    const dis = (isPast||isBooked) ? 'aria-disabled="true"' : "";
    html += `<div class="${cls}" data-date="${iso}" ${dis}>${d}</div>`;
  }
  html += `</div>`;
  wrap.innerHTML = html;

  document.getElementById("cal-prev").addEventListener("click",()=>{
    calDate = new Date(y,m-1,1); renderCalendar();
  });
  document.getElementById("cal-next").addEventListener("click",()=>{
    calDate = new Date(y,m+1,1); renderCalendar();
  });

  wrap.querySelectorAll(".cal-day.free").forEach(el=>{
    el.addEventListener("click",()=>{
      // حلّل التاريخ بالتوقيت المحلي (new Date("YYYY-MM-DD") يُفسَّر UTC ويزيح اليوم)
      const [yy,mm,dd] = el.dataset.date.split("-").map(Number);
      selectedDate = new Date(yy, mm-1, dd);
      renderCalendar();
    });
  });

  updateSummary();
  updateBookingSub();
}

/* ===== ملخص الحجز (التاريخ المختار) ===== */
function updateSummary(){
  const el = document.getElementById("booking-summary");
  if(!el) return;
  if(selectedDate){
    const dStr = `${selectedDate.getDate()} ${AR_MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
    el.classList.remove("empty");
    el.innerHTML = `<span class="sum-label">التاريخ المختار</span>
      <span class="sum-value"><i class="fa-solid fa-circle-check"></i> ${dStr}</span>`;
  } else {
    el.classList.add("empty");
    el.innerHTML = `<span class="sum-label">التاريخ المختار</span>
      <span class="sum-value"><i class="fa-regular fa-calendar"></i> اختر من التقويم</span>`;
  }
}

/* ===== إشعارات toast ===== */
let toastTimer = null;
function showToast(message,type="ok"){
  const el = document.getElementById("toast");
  if(!el) return;
  el.className = "toast "+type;
  const icon = type==="err" ? "fa-circle-exclamation" : "fa-circle-check";
  el.innerHTML = `<i class="fa-solid ${icon}" aria-hidden="true"></i><span>${message}</span>`;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ el.hidden = true; }, 4000);
}

/* ===== تحقق الحقول ===== */
function setFieldError(id,message){
  const input = document.getElementById(id);
  const err = document.getElementById("err-"+id.split("-")[1]);
  const field = input.closest(".field");
  if(message){
    field.classList.add("invalid");
    if(err) err.textContent = message;
    input.setAttribute("aria-invalid","true");
  } else {
    field.classList.remove("invalid");
    if(err) err.textContent = "";
    input.removeAttribute("aria-invalid");
  }
}

function validateName(){
  const v = document.getElementById("guest-name").value.trim();
  if(!v){ setFieldError("guest-name","اكتب اسمك الكامل"); return false; }
  if(v.length < 3){ setFieldError("guest-name","الاسم قصير جداً"); return false; }
  setFieldError("guest-name",""); return true;
}

function validatePhone(){
  const v = document.getElementById("guest-phone").value.trim();
  if(!v){ setFieldError("guest-phone","اكتب رقم الجوال"); return false; }
  const digits = v.replace(/[\s\-()]/g,"");
  if(!/^\+?\d{8,15}$/.test(digits)){ setFieldError("guest-phone","رقم جوال غير صحيح"); return false; }
  setFieldError("guest-phone",""); return true;
}

/* ===== إعادة ربط الاستراحة المفتوحة بعد تحديث البيانات =====
   UNITS تُستبدل كائناتها بالكامل عند أي تحديث من Firestore، فيصبح
   currentUnit مرجعاً قديماً (سعر/تواريخ قديمة). نعيد حلّه من المصفوفة
   ونعيد رسم التقويم والسعر إن كانت نافذة الحجز مفتوحة. */
function resyncCurrentUnit(){
  const modal = document.getElementById("booking-modal");
  if(!currentUnit || !modal || modal.hidden) return;
  const fresh = UNITS.find(u => u.id === currentUnit.id);
  if(!fresh || fresh === currentUnit) return;
  currentUnit = fresh;
  // إن أصبح اليوم المختار محجوزاً بعد التحديث، ألغِ اختياره
  if(selectedDate && (currentUnit.booked||[]).includes(toISO(selectedDate))){
    selectedDate = null;
    showToast("هذا اليوم أصبح محجوزاً — اختر تاريخاً آخر","err");
  }
  renderCalendar();
  updateBookingSub();
}

/* ===== فتح نافذة الحجز ===== */
function openBooking(unitId){
  currentUnit = UNITS.find(u=>u.id===unitId);
  if(!currentUnit) return;
  selectedDate = null;
  calDate = new Date();
  stayType = "night";
  // معرّف ثابت لهذه المحاولة: أي إرسال مكرّر يكتب فوق المستند نفسه بدل تكراره
  _bookingId = "BK" + Date.now().toString(36);
  document.getElementById("modal-title").textContent = `حجز: ${currentUnit.name}`;
  updateBookingSub();
  applyPledgeSettings();
  document.getElementById("booking-form").reset();
  // إعادة ضبط نوع الحجز إلى الافتراضي (مع مبيت)
  document.querySelectorAll(".stay-opt").forEach(b=>{
    const active = b.dataset.stay === stayType;
    b.classList.toggle("active", active);
    b.setAttribute("aria-checked", active ? "true" : "false");
  });
  document.getElementById("pledge-agree").checked = false;
  // مسح خطأ التعهد مباشرة (دون setFieldError الذي يتوقع عنصر input بمعرّف مطابق)
  const pErr = document.getElementById("err-pledge");
  if(pErr) pErr.textContent = "";
  const pCard = document.querySelector(".pledge-card");
  if(pCard) pCard.classList.remove("invalid");
  setFieldError("guest-name","");
  setFieldError("guest-phone","");
  renderCalendar();
  const modal = document.getElementById("booking-modal");
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  modal.querySelector(".modal-close").focus();
}

function updateBookingSub(){
  if(!currentUnit) return;
  const cur = currentUnit.currency;
  const sub = document.getElementById("modal-sub");
  if(!sub) return;
  if(selectedDate){
    const weekend = isWeekendDate(selectedDate);
    const price = unitPriceFor(currentUnit, stayType, weekend);
    const stayLbl = stayType === "day" ? "نهاري" : "مبيت";
    sub.innerHTML = `<i class="fa-solid fa-tag" aria-hidden="true"></i> ${getPeriodLabel(weekend)} — ${stayLbl}: <strong>${price} ${esc(cur)}</strong>`;
  } else {
    const { night, day, wNight, wDay } = getUnitPrices(currentUnit);
    sub.innerHTML = `<small style="opacity:.85">اختر تاريخاً لعرض السعر المناسب</small><br>
      <small>أسبوع: مبيت <strong>${night}</strong> · نهاري <strong>${day}</strong> &nbsp;|&nbsp; ويكند: مبيت <strong>${wNight}</strong> · نهاري <strong>${wDay}</strong> ${esc(cur)}</small>`;
  }
}

/* ===== ملء قيم العربون/التأمين/التعهد من الإعدادات ===== */
function settingNumber(value, fallback){
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function applyPledgeSettings(){
  const s = SETTINGS;
  const deposit = settingNumber(s.depositAmount, 500);
  const depEl = document.getElementById("pledge-deposit-amt");
  if(depEl) depEl.textContent = deposit + " درهم";

  const pledgeText = s.pledgeText || "أتعهد بعدم تغيير لون مياه المسبح أو إفسادها، وأوافق على دفع العربون. أُقرّ بصحة المعلومات أعلاه.";
  const ptEl = document.getElementById("pledge-text");
  if(ptEl) ptEl.textContent = pledgeText;
}

function closeBooking(){
  const modal = document.getElementById("booking-modal");
  modal.hidden = true;
  document.body.style.overflow = "";
}

/* ===== إرسال الطلب إلى واتساب ===== */
let _bookingInFlight = false;
async function sendToWhatsApp(){
  // حارس ضد الإرسال المزدوج (نقرتان سريعتان / إعادة إطلاق الحدث)
  if(_bookingInFlight) return false;
  if(!selectedDate){
    showToast("اختر تاريخاً من التقويم أولاً","err");
    return false;
  }
  const okName = validateName();
  const okPhone = validatePhone();
  const okPledge = validatePledge();
  if(!okName || !okPhone || !okPledge){
    showToast("راجع الحقول المطلوبة","err");
    if(!okPledge){ document.getElementById("pledge-agree").focus(); }
    else { (okName? document.getElementById("guest-phone"):document.getElementById("guest-name")).focus(); }
    return false;
  }

  const name = document.getElementById("guest-name").value.trim();
  const phone = document.getElementById("guest-phone").value.trim();
  const notes = document.getElementById("guest-notes").value.trim();

  const btn = document.getElementById("send-whatsapp");
  _bookingInFlight = true;
  btn.setAttribute("aria-busy","true");
  btn.disabled = true;

  /* تحقّق حي من الخادم قبل تأكيد الطلب: يمنع إرسال سعر قديم (كاش/صفحة
     مفتوحة منذ زمن) أو حجز يوم أصبح محجوزاً بعد فتح النافذة. */
  if(window.MarbellaStore && window.MarbellaStore.refreshUnit){
    try{
      const fresh = await Promise.race([
        window.MarbellaStore.refreshUnit(currentUnit.id),
        new Promise(r => setTimeout(() => r(null), 4000))
      ]);
      if(fresh) currentUnit = fresh;
    }catch(e){ /* نكمل بالبيانات المحلية عند تعذّر الجلب */ }
  }

  // أُلغي اختيار اليوم أثناء المزامنة (أصبح محجوزاً) — أوقف الإرسال
  if(!selectedDate){
    _bookingInFlight = false;
    btn.removeAttribute("aria-busy");
    btn.disabled = false;
    return false;
  }

  // اليوم أصبح محجوزاً (تأكّد من الخادم أو تحديث لحظي): أوقف الإرسال
  if((currentUnit.booked||[]).includes(toISO(selectedDate))){
    selectedDate = null;
    renderCalendar();
    updateBookingSub();
    showToast("عذراً، هذا اليوم أصبح محجوزاً — اختر تاريخاً آخر","err");
    _bookingInFlight = false;
    btn.removeAttribute("aria-busy");
    btn.disabled = false;
    return false;
  }

  // أعد حساب السعر من أحدث بيانات وحدّث العرض إن تغيّر
  const weekend = isWeekendDate(selectedDate);
  const price = getStayPrice(currentUnit, selectedDate);
  updateBookingSub();

  const stayLabel = getStayLabel();
  const periodLabel = getPeriodLabel(weekend);
  const deposit = settingNumber(SETTINGS.depositAmount, 500);

  const dStr = `${selectedDate.getDate()} ${AR_MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  let msg = `${SETTINGS.introMessage}\n\n`;
  msg += `🏡 الاستراحة: ${currentUnit.name}\n`;
  msg += `📅 التاريخ: ${dStr}\n`;
  msg += `🕒 نوع الحجز: ${stayLabel}\n`;
  msg += `🗓️ الفترة: ${periodLabel}\n`;
  msg += `💵 السعر: ${price} ${currentUnit.currency}\n`;
  msg += `👤 الاسم: ${name}\n`;
  msg += `📱 الموبايل: ${phone}\n`;
  if(notes) msg += `📝 ملاحظات: ${notes}\n`;
  msg += `\n✅ تعهدت بدفع عربون ${deposit} درهم، وألا أُغيّر لون مياه المسبح.\n`;
  msg += `رجو تأكيد الحجز، شكراً لكم.`;

  const url = `https://wa.me/${SETTINGS.whatsapp}?text=${encodeURIComponent(msg)}`;

  // تسجيل الحجز في Firestore (يظهر في لوحة التحكم). التواريخ المحجوزة يديرها الأدمن من اللوحة.
  if(window.MarbellaStore){
    const isoDate = toISO(selectedDate);
    try {
      await window.MarbellaStore.addBooking({
        id: _bookingId || ("BK" + Date.now().toString(36)),
        unitId: currentUnit.id,
        unitName: currentUnit.name,
        date: isoDate,
        stayType: stayType,
        stayLabel: stayLabel,
        isWeekend: weekend,
        periodLabel: periodLabel,
        name, phone, notes,
        price: price,
        currency: currentUnit.currency,
        pledge: true,
        createdAt: new Date().toISOString()
      });
    } catch(e){
      console.warn("addBooking failed", e);
      showToast("تعذّر حفظ الطلب في قاعدة البيانات، لكن سيُرسل عبر واتساب","err");
    }
  }

  // إعادة تمكين الزر بعد الفتح
  setTimeout(()=>{
    _bookingInFlight = false;
    btn.removeAttribute("aria-busy");
    btn.disabled = false;
  },600);

  window.open(url,"_blank");
  showToast("جاري فتح واتساب لإرسال طلبك","ok");
  return false;
}

/* ===== التحقق من التعهد ===== */
function validatePledge(){
  const cb = document.getElementById("pledge-agree");
  const err = document.getElementById("err-pledge");
  const card = cb.closest(".pledge-card");
  if(!cb.checked){
    card.classList.add("invalid");
    if(err) err.textContent = "يجب الموافقة على التعهد لإكمال الحجز";
    return false;
  }
  card.classList.remove("invalid");
  if(err) err.textContent = "";
  return true;
}

/* ============================================================
   المحور 1 — الأنيميشن والتأثيرات البصرية
   (كشف الظهور يُدار في shared.js#initShell)
   ============================================================ */

/* ===== كتابة تلقائية لعنوان البطل ===== */
function initTypewriter(){
  const el = document.querySelector(".hero-title em");
  if(!el) return;
  if(matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const full = el.textContent;
  el.textContent = "";
  el.classList.add("typewriter");
  let i = 0;
  const tick = setInterval(()=>{
    el.textContent = full.slice(0,++i);
    if(i >= full.length){
      clearInterval(tick);
      setTimeout(()=>el.classList.remove("typewriter"), 1500);
    }
  }, 55);
}

/* ===== أرقام متحركة ===== */
function animateCounter(el){
  const target = parseInt(el.dataset.counter,10) || 0;
  const suffix = el.dataset.suffix || "";
  const dur = 1400, start = performance.now();
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  if(reduce){ el.textContent = target + suffix; return; }
  function frame(now){
    const p = Math.min((now-start)/dur,1);
    const eased = 1 - Math.pow(1-p,3);
    el.textContent = Math.floor(eased*target) + suffix;
    if(p < 1) requestAnimationFrame(frame);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(frame);
}
function initCounters(){
  const counters = document.querySelectorAll("[data-counter]");
  if(!counters.length) return;
  if(!("IntersectionObserver" in window)){ counters.forEach(animateCounter); return; }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){ animateCounter(en.target); io.unobserve(en.target); }
    });
  },{threshold:.4});
  counters.forEach(c=>io.observe(c));
}

/* ===== Parallax خفيف على البطل ===== */
function initParallax(){
  const img = document.querySelector(".hero-img");
  if(!img || matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  window.addEventListener("scroll",()=>{
    const y = window.scrollY;
    if(y < window.innerHeight) img.style.transform = `translateY(${y*0.18}px) scale(1.05)`;
  },{passive:true});
}

/* ===== جسيمات عائمة ===== */
function initParticles(){
  const wrap = document.querySelector(".hero .particles");
  if(!wrap || matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const frag = document.createDocumentFragment();
  for(let i=0;i<14;i++){
    const s = document.createElement("span");
    s.style.insetInlineStart = Math.random()*100 + "%";
    s.style.animationDuration = (8 + Math.random()*10) + "s";
    s.style.animationDelay = (Math.random()*8) + "s";
    s.style.opacity = (.3 + Math.random()*.4).toFixed(2);
    frag.appendChild(s);
  }
  wrap.appendChild(frag);
}

/* ===== Lightbox للمعرض (مُوفّر في shared.js — يُستدعى هنا مباشرة) ===== */

/* ===== Ripple على الأزرار ===== */
function initRipple(){
  document.querySelectorAll(".btn").forEach(btn=>{
    btn.addEventListener("click",function(e){
      if(matchMedia("(prefers-reduced-motion:reduce)").matches) return;
      const circle = document.createElement("span");
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width,rect.height);
      circle.className = "ripple";
      circle.style.width = circle.style.height = size + "px";
      circle.style.left = (e.clientX - rect.left - size/2) + "px";
      circle.style.top = (e.clientY - rect.top - size/2) + "px";
      btn.appendChild(circle);
      setTimeout(()=>circle.remove(),600);
    });
  });
}

/* ===== Shimmer أثناء تحميل صور البطاقات ===== */
function initImgShimmer(){
  document.querySelectorAll(".unit-gallery img").forEach(img=>{
    if(img.complete){ return; }
    const gal = img.closest(".unit-gallery");
    gal.classList.add("loading");
    img.addEventListener("load",()=>gal.classList.remove("loading"));
    img.addEventListener("error",()=>gal.classList.remove("loading"));
  });
}

/* ===== التشغيل ===== */
function init(){
  initSettings();
  renderUnits();
  // إعادة عرض البطاقات عند تغيير الأسعار/البيانات من لوحة التحكم (مستمع لحظي)
  window.addEventListener("unitsUpdated", () => {
    renderUnits();
    buildFilterChips();
    updateFavCount();
    resyncCurrentUnit();   // مزامنة نافذة الحجز إن كانت مفتوحة (سعر/تواريخ)
  });
  // إعادة تطبيق الإعدادات (العرض، الأسعار، رقم الواتساب...) عند تغييرها من لوحة التحكم
  window.addEventListener("settingsUpdated", () => {
    initCountdown();          // إخفاء/إظهار شريط العرض فوراً
    renderUnits();            // الأسعار قد تتغيّر
    initShell();
  });
  document.getElementById("modal-close").addEventListener("click",closeBooking);
  document.getElementById("booking-modal").addEventListener("click",(e)=>{
    if(e.target.id==="booking-modal") closeBooking();
  });
  // إرسال النموذج
  document.getElementById("booking-form").addEventListener("submit",(e)=>{
    e.preventDefault();
    sendToWhatsApp();
  });
  // تحقق فوري على مغادرة الحقل
  document.getElementById("guest-name").addEventListener("blur",validateName);
  document.getElementById("guest-phone").addEventListener("blur",validatePhone);
  // مسح الخطأ عند الكتابة
  document.getElementById("guest-name").addEventListener("input",()=>setFieldError("guest-name",""));
  document.getElementById("guest-phone").addEventListener("input",()=>setFieldError("guest-phone",""));
  document.addEventListener("keydown",(e)=>{ if(e.key==="Escape") closeBooking(); });

  // رابط عميق: فتح نافذة الحجز لاستراحة محددة (?book=ID)
  const bookId = new URLSearchParams(location.search).get("book");
  if(bookId){
    setTimeout(()=>openBooking(bookId), 400);
  }

  // المحور 1 — أنيميشن وتأثيرات
  initTypewriter();
  initCounters();
  initParallax();
  initParticles();
  initRipple();

  // المفضّلة + قصص النجاح
  renderTestimonials();
  updateFavCount();

  // فلاتر البحث/الفرز
  buildFilterChips();
  const fSearch = document.getElementById("filter-search");
  if(fSearch) fSearch.addEventListener("input",()=>{ unitFilters.q = fSearch.value; renderUnits(); });
  const fSort = document.getElementById("filter-sort");
  if(fSort) fSort.addEventListener("change",()=>{ unitFilters.sort = fSort.value; renderUnits(); });

  // تبديل نوع الحجز (نهاري/مبيت)
  document.querySelectorAll(".stay-opt").forEach(btn=>{
    btn.addEventListener("click",()=>{
      stayType = btn.dataset.stay;
      document.querySelectorAll(".stay-opt").forEach(b=>{
        const active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-checked", active ? "true" : "false");
      });
      updateBookingSub();
    });
  });

  // عدّاد العروض التنازلي
  initCountdown();

  const favToggle = document.getElementById("fav-toggle");
  if(favToggle){
    favToggle.addEventListener("click",()=>{
      const sec = document.getElementById("fav-section");
      const show = sec.hidden;
      sec.hidden = !show;
      if(show) renderFavorites();
      favToggle.setAttribute("aria-expanded", show?"true":"false");
    });
  }
}
async function bootstrap() {
    try { init(); } catch(e){ console.error("init failed:", e); try{ renderUnits(); }catch(_){} }
    if(window.MarbellaStore){
      const firebaseReady = window.db ? Promise.resolve() : (window.firebaseBootReady || Promise.resolve());
      firebaseReady.then(() => window.MarbellaStore.initFirebaseData()).then(() => {
        try{
          initShell();
          renderUnits();
          buildFilterChips();
          renderTestimonials();
          updateFavCount();
          applyPledgeSettings();
          window.dispatchEvent(new Event("firebaseDataReady"));
        }catch(e){ console.error("refresh after Firebase failed:", e); }
      }).catch(e => console.error("initFirebaseData failed:", e));
    }
}
bootstrap();
window.addEventListener("firebaseDataReady", applyPledgeSettings);
