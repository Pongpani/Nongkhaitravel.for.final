(function(){
  const LS_KEY = "nkt_lang";
  const SUPPORTED = ["th","en"];
  function getLang(){ 
    const s = localStorage.getItem(LS_KEY);
    if (SUPPORTED.includes(s)) return s;
    return "th";
  }
  function setLang(l){ localStorage.setItem(LS_KEY, l); }
  function applyI18n(){
    const lang = getLang();
    document.documentElement.setAttribute("lang", lang === "th" ? "th" : "en");
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const text = (I18N[lang] && I18N[lang][key]) || el.textContent;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        if (el.placeholder && I18N[lang][key]) el.placeholder = I18N[lang][key];
      } else {
        el.textContent = text;
      }
    });
    document.querySelectorAll("[data-lang]").forEach(el => {
      el.classList.toggle("active", el.getAttribute("data-lang") === lang);
    });
  }
  window.I18N = window.I18N || { th:{}, en:{} };
  window.NKT_I18N = { getLang, setLang, applyI18n };
  document.addEventListener("DOMContentLoaded", applyI18n);
})();