/* ============================================================
   أدوات مشتركة عامة (تُحمَّل أولاً قبل منطق أي صفحة)
   ============================================================ */

// تهريب HTML لمنع XSS — مصدر وحيد يُستخدم عبر كل الصفحات (عام وعلى window)
function esc(s){
  return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
window.esc = esc;

const IMAGE_PLACEHOLDER = "assets/images/placeholder.jpg";

function getImageSrc(image){
  if(typeof image === "string") return image.trim() || IMAGE_PLACEHOLDER;
  if(image && typeof image === "object"){
    return image.displayUrl || image.display_url || image.url || image.imageUrl || image.image_url || image.mediumUrl || image.thumbUrl || IMAGE_PLACEHOLDER;
  }
  return IMAGE_PLACEHOLDER;
}

function getImageList(images){
  if(!Array.isArray(images)) return [];
  return images.map(getImageSrc).filter(src => src && src !== IMAGE_PLACEHOLDER);
}

function handleImageError(img){
  if(!img || img.dataset.fallbackApplied === "1") return;
  img.dataset.fallbackApplied = "1";
  img.src = IMAGE_PLACEHOLDER;
}

function wireImageFallbacks(root){
  (root || document).querySelectorAll("img[data-fallback]").forEach(img => {
    if(img.dataset.fallbackBound === "1") return;
    img.dataset.fallbackBound = "1";
    img.addEventListener("error", () => handleImageError(img));
  });
}

window.IMAGE_PLACEHOLDER = IMAGE_PLACEHOLDER;
window.getImageSrc = getImageSrc;
window.getImageList = getImageList;
window.handleImageError = handleImageError;
window.wireImageFallbacks = wireImageFallbacks;
