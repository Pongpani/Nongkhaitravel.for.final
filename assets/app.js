window.NKT = window.NKT || {};
(function () {
  const STORAGE_KEY = "nkt_places_th_multi";

  function loadPlaces() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { try { return JSON.parse(raw); } catch {} }
    return window.NKT.DEFAULT_PLACES.slice();
  }
  function savePlaces(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
  function ensureSeeded(){ if(!localStorage.getItem(STORAGE_KEY)){ savePlaces(window.NKT.DEFAULT_PLACES); } }

  function initIndex(){
    ensureSeeded();
    const grid = document.getElementById("cardsGrid");
    const tabs = document.getElementById("catTabs");
    let places = loadPlaces();
    let cat = "";

    function firstImg(p){
      if (Array.isArray(p.imgs) && p.imgs.length) return p.imgs[0];
      return p.img || 'https://placehold.co/1200x800?text=Photo';
    }

    function render(list){
      grid.innerHTML = "";
      list.forEach(p => {
        const el = document.createElement("article");
        el.className = "card";
        el.innerHTML = `
          <img class="media" src="${firstImg(p)}" alt="${p.name}">
          <div class="body">
            <h3><a href="place.html?id=${encodeURIComponent(p.id)}">${p.name}</a></h3>
            <p>${p.desc || ""}</p>
            <div class="meta"><span class="chip">${p.category||'-'}</span><span>${p.subdistrict||''}</span></div>
          </div>
          <div class="actions">
            <a class="btn outline" target="_blank" rel="noreferrer" href="${p.map_place || p.map || '#'}">แผนที่</a>
            <a class="btn" href="place.html?id=${encodeURIComponent(p.id)}">อ่านเพิ่มเติม</a>
          </div>`;
        grid.appendChild(el);
      });
    }

    function filter(){
      const result = places.filter(p => !cat || p.category === cat);
      render(result);
    }

    tabs?.addEventListener("click", e => {
      const b = e.target.closest(".tab");
      if(!b) return;
      tabs.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      cat = b.dataset.cat || "";
      filter();
    });

    window.NKT.refreshUI = () => render(places);
    render(places);
  }

  function renderPlaceDetail(){
    ensureSeeded();
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    const list = loadPlaces();
    const p = list.find(x => x.id === id) || list[0];
    if(!p) return;

    const media = document.getElementById("mediaBox");
    media.innerHTML = "";
    if (Array.isArray(p.imgs) && p.imgs.length > 1) {
      const grid = document.createElement("div");
      grid.className = "gallery";
      p.imgs.forEach(src => {
        const im = document.createElement("img");
        im.src = src;
        im.alt = p.name;
        grid.appendChild(im);
      });
      media.appendChild(grid);
    } else {
      const im = document.createElement("img");
      im.className = "cover";
      im.src = (p.imgs && p.imgs[0]) || p.img || "";
      im.alt = p.name || "";
      media.appendChild(im);
    }

    const $ = id => document.getElementById(id);
    $("placeName").textContent = p.name || "-";
    $("placeDesc").textContent = p.desc || "";
    $("placeHistory").textContent = p.history || "-";
    $("placeCat").textContent = p.category || "-";
    $("placeSub").textContent = p.subdistrict || "-";
    $("placeHours").textContent = p.hours || "-";
    $("placeFee").textContent = p.fee || "-";
    $("placeAddr").textContent = p.address || "-";
    document.getElementById("placeMap").src = p.map || "";
    const mapLink = document.getElementById("mapLink");
    mapLink.href = p.map_place || p.map || "#";
  }

  function initAdmin(){
    ensureSeeded();
    const form = document.getElementById("placeForm");
    const list = document.getElementById("adminList");

    const idF = document.getElementById("idField");
    const nameF = document.getElementById("nameField");
    const catF = document.getElementById("categoryField");
    const subF = document.getElementById("subdistrictField");
    const descF = document.getElementById("descField");
    const addrF = document.getElementById("addrField");
    const hoursF = document.getElementById("hoursField");
    const feeF = document.getElementById("feeField");
    const historyF = document.getElementById("historyField");
    const imgF = document.getElementById("imgField");
    const mapF = document.getElementById("mapField");
    const resetBtn = document.getElementById("resetFormBtn");

    let places = loadPlaces();

    function slugify(s){ return (s||'').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
    function clear(){ idF.value=""; form.reset(); }
    function render(){
      places = loadPlaces();
      list.innerHTML = "";
      places.forEach(p => {
        const row = document.createElement("div");
        row.className = "admin-item";
        row.innerHTML = `<div><strong>${p.name}</strong><br><small>${p.category} • ${p.subdistrict||'-'}</small></div>
          <button class="btn outline" data-edit="${p.id}">แก้ไข</button>
          <button class="btn" data-del="${p.id}">ลบ</button>`;
        list.appendChild(row);
        row.querySelector("[data-edit]").addEventListener("click", () => edit(p.id));
        row.querySelector("[data-del]").addEventListener("click", () => del(p.id));
      });
    }
    function edit(id){
      const p = places.find(x => x.id === id); if(!p) return;
      idF.value = p.id;
      nameF.value = p.name||"";
      catF.value = p.category||"ที่เที่ยว";
      subF.value = p.subdistrict||"";
      descF.value = p.desc||"";
      addrF.value = p.address||"";
      hoursF.value = p.hours||"";
      feeF.value = p.fee||"";
      historyF.value = p.history||"";
      const imgs = Array.isArray(p.imgs) ? p.imgs.join(", ") : (p.img||"");
      imgF.value = imgs;
      mapF.value = p.map_place || p.map || "";
      window.scrollTo({top:0, behavior:"smooth"});
    }
    function del(id){
      if(!confirm("ลบรายการนี้?")) return;
      places = places.filter(x => x.id !== id);
      savePlaces(places); render();
    }
    function parseImgs(s){
      if(!s) return [];
      return s.split(",").map(x => x.trim()).filter(Boolean);
    }
    function submit(e){
      e.preventDefault();
      const imgsArr = parseImgs(imgF.value);
      const payload = {
        id: idF.value || slugify(nameF.value)+'-'+Date.now().toString(36),
        name: nameF.value.trim(),
        category: catF.value,
        subdistrict: subF.value.trim(),
        desc: descF.value.trim(),
        address: addrF.value.trim(),
        hours: hoursF.value.trim(),
        fee: feeF.value.trim(),
        history: historyF.value.trim(),
        img: imgsArr[0] || "",
        imgs: imgsArr,
        map: /output=embed/.test(mapF.value) ? mapF.value : (mapF.value ? mapF.value + "&output=embed" : ""),
        map_place: mapF.value.replace("&output=embed","")
      };
      const i = places.findIndex(x => x.id === payload.id);
      if(i>=0) places[i] = Object.assign(places[i], payload); else places.unshift(payload);
      savePlaces(places); clear(); render(); alert("บันทึกสำเร็จ");
    }

    form.addEventListener("submit", submit);
    resetBtn.addEventListener("click", clear);
    render();
  }

  window.NKT.initIndex = initIndex;
  window.NKT.renderPlaceDetail = renderPlaceDetail;
  window.NKT.initAdmin = initAdmin;

  document.addEventListener("DOMContentLoaded", () => {
    if(document.getElementById("cardsGrid")) initIndex();
  });
})();