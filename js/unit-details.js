/* ============================================================
   تفاصيل الاستراحة: معرض الصور + الخريطة + التقييمات
   ============================================================ */

bootstrapPage(() => {
  const $ = id => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const requestedId = params.get("id");

  function getUnit(){
    return UNITS.find(u => u.id === requestedId) || UNITS[0];
  }

  function formatPrice(value, currency){
    return `${esc(value || 0)} ${esc(currency || "")}`;
  }

  function renderPrices(unit, isEn){
    const currency = isEn ? (unit.currencyEn || unit.currency) : unit.currency;
    const { night, day, wNight, wDay } = getUnitPrices(unit);
    const wkLbl = isEn ? "Weekend" : "ويكند";
    const wdLbl = isEn ? "Weekdays" : "أيام الأسبوع";
    return `
      <div class="bc-prices bc-prices-4" aria-label="${isEn ? "Booking prices" : "أسعار الحجز"}">
        <div class="bc-price-group">
          <span class="bc-group-label">${wdLbl}</span>
          <div class="bc-price-night">
            <span><i class="fa-solid fa-moon" aria-hidden="true"></i> ${isEn ? "Overnight" : "مع مبيت"}</span>
            <strong>${formatPrice(night, currency)}</strong>
          </div>
          <div class="bc-price-day">
            <span><i class="fa-solid fa-sun" aria-hidden="true"></i> ${isEn ? "Day use" : "بدون مبيت"}</span>
            <strong>${formatPrice(day, currency)}</strong>
          </div>
        </div>
        <div class="bc-price-group bc-group-weekend">
          <span class="bc-group-label">${wkLbl} <small>(${isEn ? "Fri/Sat" : "جمعة/سبت"})</small></span>
          <div class="bc-price-night">
            <span><i class="fa-solid fa-moon" aria-hidden="true"></i> ${isEn ? "Overnight" : "مع مبيت"}</span>
            <strong>${formatPrice(wNight, currency)}</strong>
          </div>
          <div class="bc-price-day">
            <span><i class="fa-solid fa-sun" aria-hidden="true"></i> ${isEn ? "Day use" : "بدون مبيت"}</span>
            <strong>${formatPrice(wDay, currency)}</strong>
          </div>
        </div>
      </div>`;
  }

  function renderDetails(){
    const unit = getUnit();
    const detail = $("detail-content");
    if(!unit){
      detail.innerHTML = `<div class="empty-state"><h3>الاستراحة غير موجودة</h3><a href="index.html" class="btn btn-primary">العودة للرئيسية</a></div>`;
      return;
    }

    const isEn = typeof currentLang !== "undefined" && currentLang === "en";
    const name = isEn ? (unit.nameEn || unit.name) : unit.name;
    const tagline = isEn ? (unit.taglineEn || unit.tagline) : unit.tagline;
    const capacity = isEn ? (unit.capacityEn || unit.capacity) : unit.capacity;
    const beds = isEn && unit.bedsEn ? unit.bedsEn : unit.beds;
    const baths = isEn && unit.bathsEn ? unit.bathsEn : unit.baths;
    const featuresList = (isEn ? (unit.featuresEn || unit.features) : unit.features) || [];
    const images = getImageList(unit.images);
    const mainImgSrc = getImageSrc(images[0]);

    const features = featuresList
      .map(f => `<span class="chip"><i class="fa-solid fa-check" aria-hidden="true"></i>${esc(f)}</span>`)
      .join("");

    const gallery = images
      .map((src, i) => `<figure class="dg-thumb"><img src="${esc(src)}" alt="${esc(name)} ${i + 1}" loading="lazy" data-idx="${i}" data-fallback/></figure>`)
      .join("");

    const similar = UNITS.filter(u => u.id !== unit.id).map(u => {
      const simName = isEn ? (u.nameEn || u.name) : u.name;
      const simCurrency = isEn ? (u.currencyEn || u.currency) : u.currency;
      return `
        <a class="sim-card" href="unit-details.html?id=${encodeURIComponent(u.id)}">
          <img src="${esc(getImageSrc(getImageList(u.images)[0]))}" alt="${esc(simName)}" loading="lazy" width="200" height="140" data-fallback/>
          <span class="sim-name">${esc(simName)}</span>
          <span class="sim-price">${formatPrice(u.price, simCurrency)}</span>
        </a>`;
    }).join("");

    detail.innerHTML = `
      <div class="detail-grid">
        <div class="detail-main">
          <div class="detail-gallery reveal">
            <figure class="dg-main"><img src="${esc(mainImgSrc)}" alt="${esc(name)}" id="dg-main-img" data-idx="0" data-fallback/></figure>
            <div class="dg-thumbs">${gallery}</div>
          </div>
          <div class="detail-specs reveal" data-delay="1">
            <h2>${esc(name)}</h2>
            <p class="unit-tag">${esc(tagline)}</p>
            <div class="unit-features">${features}</div>
            <table class="specs-table">
              <tr><td><i class="fa-solid fa-users" aria-hidden="true"></i> ${isEn ? "Capacity" : "السعة"}</td><td>${esc(capacity)}</td></tr>
              <tr><td><i class="fa-solid fa-bed" aria-hidden="true"></i> ${isEn ? "Bedrooms" : "غرف النوم"}</td><td>${esc(beds)}</td></tr>
              <tr><td><i class="fa-solid fa-bath" aria-hidden="true"></i> ${isEn ? "Bathrooms" : "دورات المياه"}</td><td>${esc(baths)}</td></tr>
            </table>
          </div>
          <div class="detail-map reveal" data-delay="2">
            <h3>${isEn ? "Location" : "الموقع"}</h3>
            <div class="map-wrap" style="height:320px"><iframe src="https://www.google.com/maps?q=${encodeURIComponent(unit.lat)},${encodeURIComponent(unit.lng)}&z=15&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="${isEn ? "Map" : "خريطة"} ${esc(name)}"></iframe></div>
          </div>
        </div>
        <aside class="detail-side reveal" data-delay="1">
          <div class="booking-card">
            ${renderPrices(unit, isEn)}
            <button class="btn btn-wa btn-full" id="book-this"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> ${isEn ? "Book via WhatsApp" : "احجز عبر واتساب"}</button>
            <a class="btn btn-outline btn-full" href="https://www.google.com/maps?q=${encodeURIComponent(unit.lat)},${encodeURIComponent(unit.lng)}&z=15" target="_blank" rel="noopener"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${isEn ? "Directions" : "الاتجاهات"}</a>
          </div>
          <div class="reviews-card" id="reviews-card">
            <h3>${isEn ? "Guest Reviews" : "تقييم الضيوف"}</h3>
            <div id="reviews-display"></div>
            <form id="review-form" class="review-form" novalidate>
              <h4>${isEn ? "Add your review" : "أضف تقييمك"}</h4>
              <div class="rf-stars" role="radiogroup" aria-label="${isEn ? "Rating" : "التقييم"}">
                ${[5,4,3,2,1].map(n => `<input type="radio" name="rev-rating" id="r${n}" value="${n}"><label for="r${n}" aria-label="${n} ${isEn ? "stars" : "نجوم"}"><i class="fa-solid fa-star"></i></label>`).join("")}
              </div>
              <input id="rev-name" type="text" placeholder="${isEn ? "Your name" : "اسمك"}" autocomplete="name" />
              <textarea id="rev-text" rows="2" placeholder="${isEn ? "Write your comment..." : "اكتب تعليقك..."}"></textarea>
              <small class="rf-error" id="rf-error" role="alert"></small>
              <button type="submit" class="a-btn"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i> ${isEn ? "Submit" : "إرسال التقييم"}</button>
            </form>
          </div>
        </aside>
      </div>
      <section class="similar reveal">
        <h3>${isEn ? "Similar resorts" : "استراحات مشابهة"}</h3>
        <div class="sim-grid">${similar}</div>
      </section>`;

    if(typeof window.applyRevealEffects === "function") window.applyRevealEffects(detail);
    wireImageFallbacks(detail);
    bindDetailEvents(unit, isEn);
    renderReviews(unit, isEn);
  }

  function bindDetailEvents(unit, isEn){
    const mainImg = $("dg-main-img");
    if(mainImg){
      document.querySelectorAll(".dg-thumb img").forEach(th => {
        th.addEventListener("click", () => {
          mainImg.dataset.fallbackApplied = "0";
          mainImg.src = th.src;
          mainImg.dataset.idx = th.dataset.idx;
        });
      });
      const images = getImageList(unit.images);
      mainImg.addEventListener("click", () => {
        if(!images.length || mainImg.dataset.fallbackApplied === "1") return;
        openLightbox(images, parseInt(mainImg.dataset.idx, 10) || 0);
      });
      mainImg.style.cursor = images.length ? "zoom-in" : "default";
    }

    const bookBtn = $("book-this");
    if(bookBtn){
      bookBtn.addEventListener("click", () => {
        location.href = `index.html?book=${encodeURIComponent(unit.id)}#units-section`;
      });
    }

    const form = $("review-form");
    if(form){
      const rfErr = $("rf-error");
      form.addEventListener("submit", async e => {
        e.preventDefault();
        const store = window.MarbellaStore;
        const rating = parseInt(form.querySelector("input[name=rev-rating]:checked")?.value, 10);
        const rname = $("rev-name").value.trim();
        const rtext = $("rev-text").value.trim();
        rfErr.textContent = "";
        if(!rating){ rfErr.textContent = isEn ? "Select a rating from 1 to 5 stars" : "اختر تقييماً من 1 إلى 5 نجوم"; return; }
        if(!rname){ rfErr.textContent = isEn ? "Enter your name" : "اكتب اسمك"; return; }
        if(rtext.length < 5){ rfErr.textContent = isEn ? "Write a comment of at least 5 characters" : "اكتب تعليقاً لا يقل عن 5 أحرف"; return; }
        if(store) await store.addReview(unit.id, { name:rname, rating, text:rtext });
        form.reset();
        await renderReviews(unit, isEn);
        rfErr.style.color = "var(--palm)";
        rfErr.textContent = isEn ? "Thank you! Your review has been posted" : "شكراً! تم نشر تقييمك";
        setTimeout(() => { rfErr.textContent = ""; rfErr.style.color = ""; }, 3000);
      });
    }
  }

  async function renderReviews(unit, isEn){
    const wrap = $("reviews-display");
    const store = window.MarbellaStore;
    if(!wrap || !store || !window.db){
      if(wrap) wrap.innerHTML = `<p class="rev-empty">${isEn ? "Reviews will appear here." : "تظهر التقييمات هنا."}</p>`;
      return;
    }
    try{
      const reviews = await store.getReviews(unit.id);
      const avg = reviews.length ? (reviews.reduce((s,r) => s + (+r.rating || 0), 0) / reviews.length) : null;
      const avgStr = avg ? avg.toFixed(1) : "-";
      const stars = avg ? "★".repeat(Math.round(avg)) + "☆".repeat(5 - Math.round(avg)) : "☆☆☆☆☆";
      let html = `<div class="rating"><span class="stars">${stars}</span> ${avgStr} / 5 <small>(${reviews.length} ${isEn ? "reviews" : "تقييم"})</small></div>`;
      if(reviews.length){
        html += `<div class="rev-list">${reviews.slice().reverse().map(r => {
          const s = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
          return `<div class="rev-item"><div class="rev-stars">${s}</div><p>${esc(r.text)}</p><small>- ${esc(r.name)}</small></div>`;
        }).join("")}</div>`;
      } else {
        html += `<p class="rev-empty">${isEn ? "No reviews yet. Be the first to review!" : "لا توجد تقييمات بعد. كن أول من يقيّم!"}</p>`;
      }
      wrap.innerHTML = html;
    }catch(e){
      console.warn("reviews load failed", e);
      wrap.innerHTML = `<p class="rev-empty">${isEn ? "Reviews are temporarily unavailable." : "التقييمات غير متاحة مؤقتاً."}</p>`;
    }
  }

  renderDetails();
  window.addEventListener("firebaseDataReady", renderDetails);
  window.addEventListener("languageChanged", () => {
    const url = new URL(location.href);
    if(url.searchParams.get("lang") !== currentLang){
      url.searchParams.set("lang", currentLang);
      location.href = url.toString();
    } else {
      renderDetails();
    }
  });
});
