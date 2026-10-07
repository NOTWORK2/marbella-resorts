/* تفادي وميض الوضع الخاطئ (FOUC): يُطبّق الثيم قبل الرسم، ثم يتولّى Firebase التحديث.
   يُحمّل في <head> كل صفحة بشكل متزامن (بدون defer/async).
   Firebase يحتاج ثوانٍ (تحميل + دخول + جلب) قبل معرفة اختيار الزائر، لذا نقرأ أولاً
   نسخة محلية من آخر ثيم اختاره (marbella-theme)، وإلا نتبع تفضيل النظام. */
(function () {
  var theme = null;
  try { theme = localStorage.getItem("marbella-theme"); } catch (e) { /* تخزين محظور */ }
  try {
    var dark = theme === "dark" || (theme !== "light" && window.matchMedia &&
      matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("theme-dark", !!dark);
  } catch (e) { /* متصفح غير داعم */ }
  // اتجاه الصفحة حسب آخر لغة (أو ?lang=) قبل الرسم: يمنع رسم الصفحة RTL ثم قفزها إلى LTR
  try {
    var lang = new URLSearchParams(location.search).get("lang");
    if (lang !== "ar" && lang !== "en") lang = localStorage.getItem("marbella-lang");
    if (lang === "en") { document.documentElement.lang = "en"; document.documentElement.dir = "ltr"; }
  } catch (e) { /* تخزين محظور */ }
})();
