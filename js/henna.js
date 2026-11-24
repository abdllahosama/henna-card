(() => {
  "use strict";
  const C = window.WEDDING;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ar = (n) => Number(n).toLocaleString("ar-EG");
  const params = new URLSearchParams(location.search);
  const guest = (params.get("to") || "").trim().slice(0, 60);

  /* ---------- منع تكبير الصفحة (Safari بيتجاهل user-scalable=no) ---------- */
  ["gesturestart", "gesturechange", "gestureend"].forEach((ev) =>
    document.addEventListener(ev, (e) => e.preventDefault(), { passive: false }));
  document.addEventListener("touchmove", (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });

  /* ---------- ربط النصوص من config ---------- */
  $$("[data-bind]").forEach((el) => {
    const v = C[el.dataset.bind];
    if (v != null) el.textContent = v;
  });
  $("#mono1").textContent = C.monogram[0];
  $("#mono2").textContent = C.monogram[1];

  /* ---------- اسم الضيف ---------- */
  if (guest) {
    $("#gateName").textContent = guest;
    const g = $("#heroGreet");
    g.textContent = "يسعدنا حضورك يا ";
    const b = document.createElement("b");
    b.textContent = guest;
    g.append(b, " ومشاركتنا الفرحة");
  }

  /* ---------- الموسيقى ---------- */
  const audio = $("#music");
  const musicBtn = $("#musicBtn");
  let hasMusic = false;
  if (C.music) {
    audio.preload = "metadata";
    audio.src = C.music;
    audio.addEventListener("loadedmetadata", () => {
      hasMusic = true;
      if (document.body.classList.contains("opened")) musicBtn.hidden = false;
    }, { once: true });
  }
  const setPlaying = (on) => musicBtn.classList.toggle("playing", on);
  musicBtn.addEventListener("click", () => {
    if (audio.paused) audio.play().then(() => setPlaying(true)).catch(() => {});
    else { audio.pause(); setPlaying(false); }
  });

  /* ---------- فتح الظرف ---------- */
  const gate = $("#gate");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const steps = reduce ? [0, 0, 0, 0] : [0, 450, 1350, 2700];
  let opened = false;

  function openEnvelope() {
    if (opened) return;
    opened = true;
    if (C.music) {
      audio.volume = 0;
      audio.play().then(() => {
        setPlaying(true);
        let v = 0;
        const fade = setInterval(() => { v = Math.min(0.45, v + 0.03); audio.volume = v; if (v >= 0.45) clearInterval(fade); }, 120);
      }).catch(() => {});
    }
    ["s1", "s2", "s3", "s4"].forEach((cls, i) => setTimeout(() => gate.classList.add(cls), steps[i]));
    setTimeout(() => {
      document.body.classList.remove("locked");
      document.body.classList.add("opened");
      if (hasMusic) musicBtn.hidden = false;
      $$(".hero .reveal").forEach((el) => el.classList.add("in"));
    }, steps[3]);
    setTimeout(() => { gate.remove(); }, steps[3] + 1200);
  }
  $("#seal").addEventListener("click", openEnvelope);
  $("#envelope").addEventListener("click", openEnvelope);

  /* ---------- ظهور العناصر مع السكرول ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el) => { if (!el.closest(".hero")) io.observe(el); });

  /* ---------- العد التنازلي ---------- */
  const target = new Date(C.date).getTime();
  const cd = { d: $('[data-cd="d"]'), h: $('[data-cd="h"]'), m: $('[data-cd="m"]'), s: $('[data-cd="s"]') };
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      $("#countdown").hidden = true;
      $("#countdownDone").hidden = false;
      return;
    }
    const s = Math.floor(diff / 1000);
    cd.d.textContent = ar(Math.floor(s / 86400));
    cd.h.textContent = ar(Math.floor((s % 86400) / 3600));
    cd.m.textContent = ar(Math.floor((s % 3600) / 60));
    cd.s.textContent = ar(s % 60);
    setTimeout(tick, 1000);
  }
  tick();

  /* ---------- التقويم والخريطة ---------- */
  const start = new Date(C.date);
  const end = new Date(start.getTime() + (C.durationHours || 4) * 3600e3);
  const utc = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const title = `ليلة حنة ${C.groom} و${C.bride}`;
  const where = [C.venueName, C.venueAddress].filter(Boolean).join(" — ");
  const details = `يسعدنا حضورك 🤍\n${C.mapsUrl || ""}`;

  $("#gcalBtn").href = "https://calendar.google.com/calendar/render?" + new URLSearchParams({
    action: "TEMPLATE", text: title, dates: `${utc(start)}/${utc(end)}`, location: where, details,
  });
  $("#icsBtn").addEventListener("click", () => {
    const esc = (t) => String(t).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//henna//invite//AR", "BEGIN:VEVENT",
      `UID:${utc(start)}-henna@invite`, `DTSTAMP:${utc(new Date())}`,
      `DTSTART:${utc(start)}`, `DTEND:${utc(end)}`,
      `SUMMARY:${esc(title)}`, `LOCATION:${esc(where)}`, `DESCRIPTION:${esc(details)}`,
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", `DESCRIPTION:${esc(title)}`, "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    a.download = "henna.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  if (C.mapsUrl) $("#mapsBtn").href = C.mapsUrl;
  else $("#mapsRow").hidden = true;
  if (!C.venueAddress) $('[data-bind="venueAddress"]').hidden = true;
  if (C.mapEmbedUrl) {
    $("#mapFrame").src = C.mapEmbedUrl;
    $("#mapWrap").hidden = false;
  }

  /* ---------- التهاني من نفس شيت الفرح ---------- */
  const API = C.rsvpEndpoint;
  let wishes = [];
  let wishShown = 12;
  async function loadStats() {
    if (!API) return;
    try {
      const res = await fetch(API, { cache: "no-store" });
      const data = await res.json();
      wishes = Array.isArray(data.wishes) ? data.wishes : [];
      renderWishes();
    } catch (_) {}
  }
  const post = (data) => fetch(API, { method: "POST", mode: "no-cors", body: new URLSearchParams(data) });

  /* ---------- دفتر التهاني ---------- */
  const wishList = $("#wishList");
  const rtf = new Intl.RelativeTimeFormat("ar-EG", { numeric: "auto" });
  function ago(t) {
    const s = (t - Date.now()) / 1000;
    const units = [["day", 86400], ["hour", 3600], ["minute", 60]];
    for (const [u, sec] of units) if (Math.abs(s) >= sec) return rtf.format(Math.round(s / sec), u);
    return "دلوقتي";
  }
  function renderWishes() {
    wishList.textContent = "";
    wishes.slice(0, wishShown).forEach((w) => {
      const card = document.createElement("article");
      card.className = "wish";
      const p = document.createElement("p");
      p.textContent = w.message;
      const foot = document.createElement("footer");
      const b = document.createElement("b");
      b.textContent = w.name;
      const time = document.createElement("time");
      time.textContent = ago(w.time);
      foot.append(b, time);
      card.append(p, foot);
      wishList.append(card);
    });
    $("#wishMore").hidden = wishes.length <= wishShown;
  }
  $("#wishMore").addEventListener("click", () => { wishShown += 12; renderWishes(); });

  if (API) {
    $("#wishes").hidden = false;
    if (guest) $("#wishName").value = guest;
    const msgEl = $("#wishMsg");
    msgEl.addEventListener("input", () => { $("#wishCount").textContent = `${ar(msgEl.value.length)} / ٤٠٠`; });
    $("#wishForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const err = $("#wishError");
      err.hidden = true;
      const name = $("#wishName").value.trim();
      const message = msgEl.value.trim();
      if (!name || !message) {
        err.textContent = !name ? "اكتب اسمك" : "اكتب التهنئة";
        err.hidden = false;
        return;
      }
      const btn = $("#wishSubmit");
      btn.disabled = true;
      try {
        await post({ type: "wish", name, message, invitedAs: guest, website: $("#wishForm [name=website]").value });
        wishes.unshift({ name, message, time: Date.now() });
        renderWishes();
        msgEl.value = "";
        $("#wishCount").textContent = "٠ / ٤٠٠";
        wishList.firstElementChild?.classList.add("fresh");
      } catch (_) {
        err.textContent = "حصلت مشكلة، جرب تاني";
        err.hidden = false;
      } finally {
        btn.disabled = false;
      }
    });
  }

  loadStats();
})();
