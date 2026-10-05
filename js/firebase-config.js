const firebaseConfig = {
  apiKey: "AIzaSyDmh9KrXI7WPzywuopF55gUjMyOvZejMkI",
  authDomain: "marbella-resorts.firebaseapp.com",
  projectId: "marbella-resorts",
  // ملاحظة: storageBucket غير مطلوب — رفع الصور يتم عبر ImgBB وليس Firebase Storage.
  messagingSenderId: "891120028271",
  appId: "1:891120028271:web:11b584600bf2c260705b9a"
};

// بريد الأدمن المستخدم لتسجيل الدخول عبر Firebase Authentication.
// أنشئ مستخدماً بهذا البريد وكلمة مرور من Firebase Console ← Authentication ← Users.
// يمكنك تغييره هنا إلى أي بريد تملكه (يُستخدم أيضاً لاستعادة كلمة المرور).
// يُصدَّر على window ليقرأه admin.js (مصدر وحيد للحقيقة).
const ADMIN_EMAIL = "admin@marbella-resorts.com";
window.ADMIN_EMAIL = ADMIN_EMAIL;

// Initialize Firebase using compat libraries (loaded via CDN)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
window.db = firebase.firestore();
window.auth = firebase.auth();

// تفعيل التخزين المؤقت المحلي (offline persistence) لتفادي إعادة جلب الإعدادات/الاستراحات
// مع كل تنقّل بين الصفحات. نستخدم الوضع أحادي التبويب (الوحيد غير المُهمَل في compat SDK)؛
// تزامن البيانات بين التبويبات يضمنه مستمعو Firestore اللحظيون عبر الخادم.
// يُتجاهل بهدوء في المتصفحات غير الداعمة أو عند فتح تبويب ثانٍ (يسقط للشبكة).
try {
  db.enablePersistence().catch(function(err){
    if(err && err.code === 'failed-precondition'){
      // تبويب آخر فعّل المثابرة بالفعل — طبيعي، نسقط للشبكة في هذا التبويب
    } else if(err && err.code === 'unimplemented'){
      // المتصفح لا يدعم المثابرة
    }
  });
} catch (e) { /* متصفح غير داعم */ }
