/* app-loader.js — واجهة انتظار سينمائية: سماء صحراوية بنجوم متلألئة
   ------------------------------------------------------------
   تُضمَّن في <head> (قبل رسم الصفحة) على صفحات البيانات فقط:
   index.html و unit-details.html. تغطّي المحتوى حتى يصل الحدث
   firebaseDataReady (أي بعد جلب الأسعار/الأسماء/التفاصيل من Firestore)
   ثم تتلاشى. مهلة احتياطية تحمي من تعذّر تحميل Firebase. */
(function () {
  // لا تُظهر على لوحة التحكم (تحمّل Firebase فيها متزامن ولا يُطلق الحدث)
  if (/(^|\/)admin\.html(?:$|[?#])/.test(location.pathname)) return;

  var STYLE = `
#app-loader{
  position:fixed;inset:0;z-index:9999;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:0;
  background:linear-gradient(180deg,#FBF7EC 0%,#F6E9D2 50%,#EFE7D6 100%);
  transition:opacity .6s cubic-bezier(0.32,0.72,0,1), visibility .6s cubic-bezier(0.32,0.72,0,1);
  overflow:hidden;
}
/* الثيم الداكن: سماء ليلية بنجوم */
.theme-dark #app-loader{
  background:radial-gradient(ellipse at 50% 120%, #1a2e36 0%, #0d1418 60%, #080d10 100%);
}
#app-loader.hide{opacity:0;visibility:hidden;pointer-events:none}

/* ===== نجوم متلألئة (تظهر في الثيم الداكن فقط) ===== */
#app-loader .al-stars{position:absolute;inset:0;pointer-events:none}
.theme-dark #app-loader .al-star{
  position:absolute;width:2px;height:2px;border-radius:50%;
  background:#fff;opacity:0;
  animation:alTwinkle 3s ease-in-out infinite;
}
@keyframes alTwinkle{
  0%,100%{opacity:0;transform:scale(.5)}
  50%{opacity:1;transform:scale(1.4);box-shadow:0 0 6px rgba(255,255,255,.6)}
}
/* الثيم الفاتح: جزيئات ذهبية عائمة بدل النجوم */
#app-loader .al-star{
  position:absolute;border-radius:50%;
  background:#C29A3E;opacity:0;
  animation:alFloat 4s ease-in-out infinite;
}
@keyframes alFloat{
  0%,100%{opacity:0;transform:translateY(0) scale(.5)}
  50%{opacity:.4;transform:translateY(-8px) scale(1)}
}

/* ===== نجم منطلق (shooting star) — الثيم الداكن فقط ===== */
.theme-dark #app-loader .al-shoot{
  position:absolute;width:80px;height:1px;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent);
  opacity:0;
  animation:alShoot 7s ease-in infinite;
}
#app-loader .al-shoot{display:none}
.theme-dark #app-loader .al-shoot{display:block}
@keyframes alShoot{
  0%{opacity:0;transform:translateX(0) translateY(0) rotate(-25deg)}
  3%{opacity:1}
  10%{opacity:0;transform:translateX(-300px) translateY(140px) rotate(-25deg)}
  100%{opacity:0}
}

/* ===== اللوقو ===== */
#app-loader .al-logo{
  width:56px;height:56px;border-radius:14px;object-fit:contain;
  background:rgba(194,154,62,.12);padding:5px;
  box-shadow:0 0 0 1px rgba(194,154,62,.2), 0 0 30px rgba(194,154,62,.25);
  animation:alLogoGlow 3s ease-in-out infinite;
  position:relative;z-index:2;
}
@keyframes alLogoGlow{
  0%,100%{box-shadow:0 0 0 1px rgba(194,154,62,.2), 0 0 20px rgba(194,154,62,.15)}
  50%{box-shadow:0 0 0 1px rgba(194,154,62,.35), 0 0 40px rgba(194,154,62,.4)}
}

/* ===== العنوان السينمائي — يتوهّج ويخفت ===== */
#app-loader .al-title{
  position:relative;z-index:2;
  font-family:'29LT Bukra','Aref Ruqaa',serif;
  font-weight:700;font-style:normal;
  font-size:clamp(1.4rem,4vw,2.2rem);
  color:#7a5a14;text-align:center;line-height:1.5;
  max-width:520px;padding:0 1.5rem;margin-top:1.8rem;
  text-shadow:0 0 20px rgba(194,154,62,0);
  animation:alTitleGlow 4s ease-in-out infinite;
}
.theme-dark #app-loader .al-title{color:#e7d6a8}
@keyframes alTitleGlow{
  0%,100%{
    color:rgba(122,90,20,.55);
    text-shadow:0 0 10px rgba(194,154,62,.1);
  }
  50%{
    color:rgba(122,90,20,1);
    text-shadow:0 0 20px rgba(194,154,62,.4), 0 0 40px rgba(194,154,62,.2);
  }
}
.theme-dark #app-loader .al-title{
  animation-name:alTitleGlowDark;
}
@keyframes alTitleGlowDark{
  0%,100%{
    color:rgba(231,214,168,.55);
    text-shadow:0 0 10px rgba(194,154,62,.1), 0 0 20px rgba(194,154,62,.05);
  }
  50%{
    color:rgba(231,214,168,1);
    text-shadow:0 0 20px rgba(194,154,62,.5), 0 0 50px rgba(194,154,62,.3), 0 0 80px rgba(194,154,62,.15);
  }
}
#app-loader .al-title em{
  font-style:normal;color:#C29A3E;
  display:block;margin-top:.2rem;
}

/* ===== شريط التحميل المتوهّج ===== */
#app-loader .al-bar{
  position:relative;z-index:2;
  width:140px;height:2px;border-radius:2px;
  background:rgba(194,154,62,.12);
  overflow:hidden;margin-top:2rem;
}
#app-loader .al-bar::after{
  content:"";position:absolute;inset-block:0;inset-inline-start:0;
  width:40%;border-radius:2px;
  background:linear-gradient(90deg,transparent, #C29A3E, transparent);
  animation:alBarSlide 1.4s cubic-bezier(0.4,0,0.6,1) infinite;
}
@keyframes alBarSlide{
  0%{transform:translateX(-100%)}
  100%{transform:translateX(350%)}
}

/* ===== نص تحميل خافت ===== */
#app-loader .al-text{
  position:relative;z-index:2;
  color:rgba(122,90,20,.5);
  font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;
  font-size:.78rem;letter-spacing:.15em;
  margin-top:1rem;
  animation:alTextPulse 2s ease-in-out infinite;
}
.theme-dark #app-loader .al-text{color:rgba(231,214,168,.5)}
@keyframes alTextPulse{
  0%,100%{opacity:.3}
  50%{opacity:.7}
}

@media(prefers-reduced-motion:reduce){
  #app-loader .al-star,#app-loader .al-shoot,#app-loader .al-logo,#app-loader .al-title,#app-loader .al-text{animation-duration:6s}
  #app-loader .al-bar::after{animation-duration:3s}
}
`;

  function inject() {
    if (document.getElementById("app-loader")) return;
    if (!document.getElementById("app-loader-style")) {
      var css = document.createElement("style");
      css.id = "app-loader-style";
      css.textContent = STYLE;
      (document.head || document.documentElement).appendChild(css);
    }
    var el = document.createElement("div");
    el.id = "app-loader";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");

    // ولّد نجوماً متلألئة بمواقع وأحجام عشوائية
    var starsHTML = "";
    for (var i = 0; i < 50; i++) {
      var left = Math.floor(Math.random() * 100);
      var top = Math.floor(Math.random() * 70);
      var delay = (Math.random() * 3).toFixed(2);
      var dur = (2 + Math.random() * 3).toFixed(1);
      var size = (1 + Math.random() * 2).toFixed(1);
      starsHTML += '<span class="al-star" style="left:' + left + '%;top:' + top + '%;width:' + size + 'px;height:' + size + 'px;animation-delay:' + delay + 's;animation-duration:' + dur + 's"></span>';
    }
    // نجمان منطلقان في مواقع مختلفة
    starsHTML += '<span class="al-shoot" style="right:15%;top:18%;animation-delay:1s"></span>';
    starsHTML += '<span class="al-shoot" style="right:40%;top:10%;animation-delay:4s"></span>';

    el.innerHTML =
      '<div class="al-stars">' + starsHTML + '</div>' +
      '<img class="al-logo" src="assets/images/logo.png" alt="" aria-hidden="true" />' +
      '<h2 class="al-title">تحت نجوم الصحراء… <em>تبدأ أجمل الجلسات</em></h2>' +
      '<div class="al-bar"></div>' +
      '<span class="al-text">جارٍ التحضير</span>';
    (document.body || document.documentElement).appendChild(el);
  }

  // حقن مبكر (قد يسبق وجود <body>)، ثم إعادة التأكيد عند اكتمال DOM
  inject();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject, { once: true });
  }

  var done = false;
  function finish() {
    if (done) return;
    done = true;
    var el = document.getElementById("app-loader");
    if (!el) return;
    el.classList.add("hide");
    setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); }, 600);
  }

  // البيانات جاهزة من Firebase — أجّل الإخفاء قليلاً حتى تُعاد رسم العناصر (الأسماء/الأسعار)
  window.addEventListener("firebaseDataReady", function () { setTimeout(finish, 200); });
  // فشل تحميل Firebase: أخفِ فوراً وأظهر البيانات الافتراضية المرسومة أسفل النافذة
  window.addEventListener("firebaseLoadFailed", finish);
  // مهلة احتياطية: لا نعلّق المستخدم طويلاً إن تأخر Firebase أو تعذّر إطلاق أي حدث
  setTimeout(finish, 4000);
  window.addEventListener("pagehide", finish);
})();
