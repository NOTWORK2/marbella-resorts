/* Central Firebase loader.
   Public pages render from local data first, then load Firebase in the background.
   Admin keeps blocking Firebase loading because admin.js needs auth/db immediately. */
(function () {
  var FB_VERSION = "10.9.0";
  var V = "?v=27";
  var cdn = "https://www.gstatic.com/firebasejs/" + FB_VERSION + "/firebase-";
  var isAdmin = /(^|\/)admin\.html(?:$|[?#])/.test(location.pathname);

  if (isAdmin) {
    document.write(
      '<script src="' + cdn + 'app-compat.js"><\/script>' +
      '<script src="' + cdn + 'firestore-compat.js"><\/script>' +
      '<script src="' + cdn + 'auth-compat.js"><\/script>' +
      '<script src="js/utils.js' + V + '"><\/script>' +
      '<script src="js/firebase-config.js' + V + '"><\/script>' +
      '<script src="js/data.js' + V + '"><\/script>'
    );
    return;
  }

  document.write(
    '<script src="js/utils.js' + V + '"><\/script>' +
    '<script src="js/data.js' + V + '"><\/script>'
  );

  function load(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  window.firebaseBootReady = load(cdn + "app-compat.js")
    .then(function () { return load(cdn + "firestore-compat.js"); })
    .then(function () { return load(cdn + "auth-compat.js"); })
    .then(function () { return load("js/firebase-config.js" + V); })
    .then(function () { window.dispatchEvent(new Event("firebaseReady")); })
    .catch(function (error) {
      console.warn("Firebase async load failed", error);
      // أبلغ نافذة الانتظار (app-loader.js) بإخفاء نفسها فوراً وإظهار البيانات
      // الافتراضية بدل تعليق المستخدم حتى انتهاء المهلة الاحتياطية.
      window.dispatchEvent(new Event("firebaseLoadFailed"));
    });
})();
