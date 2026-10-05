/* تفادي وميض الوضع الداكن (FOUC): يُطبّق تفضيل النظام قبل الرسم، ثم يتولّى Firebase التحديث.
   يُحمّل في <head> كل صفحة بشكل متزامن (بدون defer/async). */
(function () {
  try {
    if (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("theme-dark");
    }
  } catch (e) { /* متصفح غير داعم */ }
})();
