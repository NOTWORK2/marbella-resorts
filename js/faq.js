/* ============================================================
   الأسئلة الشائعة — بناء ديناميكي من مصفوفة FAQ + بحث فوري
   يعتمد على globals من utils.js/data.js/shared.js (esc, FAQ, SETTINGS, bootstrapPage)
   ============================================================ */
bootstrapPage(() => {
  const $ = id=>document.getElementById(id);
  const fw=$("faq-wa"); if(fw) fw.href = `https://wa.me/${SETTINGS.whatsapp}`;

  // أيقونات لكل تصنيف FAQ
  const CAT_ICONS = {
    "الحجز والإلغاء":"fa-calendar-check",
    "الأسعار والدفع":"fa-money-bill-wave",
    "المرافق والخدمات":"fa-house",
    "القوانين":"fa-scale-balanced"
  };

  // بناء الأسئلة من مصفوفة FAQ
  const list = $("faq-list");
  const cats = [];
  (typeof FAQ!=="undefined"?FAQ:[]).forEach(item=>{
    if(!cats.includes(item.cat)) cats.push(item.cat);
  });
  list.innerHTML = cats.map((cat,i)=>{
    const items = (typeof FAQ!=="undefined"?FAQ:[]).filter(f=>f.cat===cat)
      .map(f=>`<details class="faq-item"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");
    return `<div class="faq-group reveal" ${i?`data-delay="${i}"`:""}>
      <h3 class="faq-cat"><i class="fa-solid ${CAT_ICONS[cat]||"fa-circle-question"}" aria-hidden="true"></i> ${esc(cat)}</h3>
      ${items}</div>`;
  }).join("");
  // إعادة تهيئة كشف الظهور للعناصر الجديدة
  if("IntersectionObserver" in window){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}}),{threshold:.15,rootMargin:"0px 0px -40px 0px"});
    list.querySelectorAll(".reveal").forEach(e=>io.observe(e));
  } else list.querySelectorAll(".reveal").forEach(e=>e.classList.add("in"));

  const input = $("faq-search-input");
  const empty = $("faq-empty");
  input.addEventListener("input",()=>{
    const q = input.value.trim().toLowerCase();
    let anyVisible = false;
    document.querySelectorAll(".faq-item").forEach(item=>{
      const match = !q || item.textContent.toLowerCase().includes(q);
      item.style.display = match ? "" : "none";
      if(match) anyVisible = true;
    });
    document.querySelectorAll(".faq-group").forEach(g=>{
      g.style.display = [...g.querySelectorAll(".faq-item")].some(i=>i.style.display!=="none") ? "" : "none";
    });
    empty.hidden = anyVisible;
  });
});
