/* ============================================================
   سياسة الإلغاء — تهيئة + ربط زر واتساب
   ============================================================ */
bootstrapPage(() => {
  const pw = document.getElementById("policy-wa");
  if(pw) pw.href = `https://wa.me/${SETTINGS.whatsapp}`;
});
