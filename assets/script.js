const root = document.documentElement;
const saved = localStorage.getItem("theme");
const prefersLight = window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: light)").matches;

if (saved === "light" || saved === "dark") {
  root.setAttribute("data-theme", saved);
} else {
  root.setAttribute("data-theme", prefersLight ? "light" : "dark");
}

const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    const giscusFrame = document.querySelector("iframe.giscus-frame");
    if (giscusFrame) {
      giscusFrame.contentWindow.postMessage(
        { giscus: { setConfig: { theme: next } } },
        "https://giscus.app"
      );
    }
  });
}

document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (!link) return;
  const href = link.getAttribute("href");
  if (!href) return;
  if (href.startsWith("http") || href.startsWith("mailto:") ||
      href.startsWith("#") || link.target === "_blank") return;
  if (!href.endsWith(".html")) return;
  e.preventDefault();
  document.body.classList.add("fading");
  setTimeout(() => { window.location.href = href; }, 140);
});

const filter = document.getElementById("filter");
if (filter) {
  const navItems = [...document.querySelectorAll(".nav-item")];
  filter.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    navItems.forEach(a => {
      const match = a.textContent.toLowerCase().includes(q);
      a.classList.toggle("hidden", !match);
    });
  });
}

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
if (menuBtn && sidebar) {
  menuBtn.addEventListener("click", () => sidebar.classList.toggle("open"));
  document.querySelectorAll(".nav-item").forEach(a =>
    a.addEventListener("click", () => sidebar.classList.remove("open"))
  );
}

const tocLinks = [...document.querySelectorAll(".toc-link")];
const headings = [...document.querySelectorAll("h2")];

function setActiveHeading(id) {
  headings.forEach(h => h.classList.toggle("active", h.id === id));
}

tocLinks.forEach(link => {
  link.addEventListener("click", () => {
    const id = link.getAttribute("href").slice(1);
    setActiveHeading(id);
  });
});

const targets = tocLinks
  .map(a => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && targets.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        tocLinks.forEach(a =>
          a.classList.toggle("active",
            a.getAttribute("href") === "#" + e.target.id)
        );
        setActiveHeading(e.target.id);
      }
    });
  }, { rootMargin: "-30% 0px -60% 0px", threshold: 0 });
  targets.forEach(t => io.observe(t));
}

const progressBar = document.querySelector(".scroll-progress");
const toTop = document.querySelector(".to-top");

function onScroll() {
  const h = document.documentElement;
  const scrolled = h.scrollTop;
  const max = h.scrollHeight - h.clientHeight;
  const pct = max > 0 ? (scrolled / max) * 100 : 0;
  if (progressBar) progressBar.style.width = pct + "%";
  if (toTop) toTop.classList.toggle("visible", scrolled > 300);
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

if (toTop) {
  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

document.querySelectorAll(".copy-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const value = btn.getAttribute("data-copy");
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      const original = btn.textContent;
      btn.textContent = "copied";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("copied");
      }, 1400);
    } catch (_) {}
  });
});

(function calcReadingTime() {
  const h1 = document.querySelector(".content h1");
  const rt = document.querySelector(".reading-time");
  if (!h1 || !rt) return;
  const words = document.querySelector(".content").innerText.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  rt.textContent = "~" + mins + " min read";
})();

const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();
