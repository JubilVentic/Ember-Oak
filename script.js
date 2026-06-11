const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const mobileNav = document.getElementById("mobile-nav");

function closeMobileNav() {
  if (!navToggle || !mobileNav) return;
  navToggle.setAttribute("aria-expanded", "false");
  mobileNav.hidden = true;
}

function updateHeader() {
  if (!header) return;
  const hero = document.querySelector(".hero");
  const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 0;
  const overHero = window.scrollY < heroBottom - 80;
  header.classList.toggle("site-header--scrolled", window.scrollY > 24);
  header.classList.toggle("site-header--over-hero", overHero);
}

window.addEventListener("scroll", updateHeader);
window.addEventListener("resize", updateHeader);
updateHeader();

document.querySelector(".nav__logo")?.addEventListener("click", (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
  closeMobileNav();
  window.setTimeout(updateHeader, 400);
});

navToggle?.addEventListener("click", () => {
  const open = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!open));
  mobileNav.hidden = open;
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileNav);
});

const menuFilters = document.querySelectorAll(".menu__filter");
const menuCards = document.querySelectorAll(".menu-card");

menuFilters.forEach((filter) => {
  filter.addEventListener("click", () => {
    const category = filter.dataset.filter;

    menuFilters.forEach((btn) => {
      const active = btn === filter;
      btn.classList.toggle("menu__filter--active", active);
      btn.setAttribute("aria-selected", String(active));
    });

    menuCards.forEach((card) => {
      const show = category === "all" || card.dataset.category === category;
      card.hidden = !show;
    });
  });
});

const aboutCarousel = document.querySelector(".about__carousel");
const aboutTrack = document.querySelector(".about__carousel-track");

if (aboutCarousel && aboutTrack) {
  const columns = [...aboutTrack.children];
  columns.forEach((column) => {
    aboutTrack.appendChild(column.cloneNode(true));
  });

  const BASE_SPEED = 90;
  const SLOW_FACTOR = 0.5;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let offset = 0;
  let loopHalf = 0;
  let hovering = false;
  let inView = true;
  let lastTime = 0;

  function measureLoop() {
    loopHalf = aboutTrack.scrollWidth / 2;
  }

  function autoScroll(time) {
    if (!reducedMotion && inView && loopHalf > 0) {
      const delta = lastTime ? Math.min(time - lastTime, 50) : 16;
      lastTime = time;

      const speed = (hovering ? BASE_SPEED * SLOW_FACTOR : BASE_SPEED) * (delta / 1000);
      offset -= speed;

      if (-offset >= loopHalf) {
        offset += loopHalf;
      }

      aboutTrack.style.transform = `translate3d(${offset}px, 0, 0)`;
    }

    requestAnimationFrame(autoScroll);
  }

  aboutCarousel.addEventListener(
    "mouseover",
    (event) => {
      hovering = !!event.target.closest(".about__tile");
    },
    true
  );

  aboutCarousel.addEventListener(
    "mouseout",
    (event) => {
      hovering = !!event.relatedTarget?.closest?.(".about__tile");
    },
    true
  );

  const observer = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
    },
    { threshold: 0.1 }
  );
  observer.observe(aboutCarousel);

  measureLoop();
  window.addEventListener("load", measureLoop);
  window.addEventListener("resize", measureLoop);
  requestAnimationFrame(autoScroll);
}

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = lightbox?.querySelector(".lightbox__close");
const lightboxBackdrop = lightbox?.querySelector(".lightbox__backdrop");
let lightboxTrigger = null;

function openLightbox(img, caption) {
  if (!lightbox || !lightboxImg || !lightboxCaption || !img?.src) return;

  lightboxTrigger = document.activeElement;
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt || caption || "Menu item";
  lightboxCaption.textContent = caption || img.alt || "";
  lightbox.hidden = false;
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  lightboxClose?.focus();
}

function closeLightbox() {
  if (!lightbox || !lightboxImg) return;

  lightbox.hidden = true;
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.removeAttribute("src");
  document.body.style.overflow = "";
  lightboxTrigger?.focus();
  lightboxTrigger = null;
}

document.querySelectorAll(".about__tile").forEach((tile) => {
  tile.setAttribute("tabindex", "0");
  tile.setAttribute("role", "button");

  const label = tile.querySelector("figcaption")?.textContent?.trim();
  if (label) {
    tile.setAttribute("aria-label", `View ${label}`);
  }
});

document.addEventListener("click", (event) => {
  const tile = event.target.closest(".about__tile");
  const media = event.target.closest(".menu-card__media");

  if (tile) {
    const img = tile.querySelector("img");
    const caption = tile.querySelector("figcaption")?.textContent?.trim();
    openLightbox(img, caption);
    return;
  }

  if (media) {
    const img = media.querySelector("img");
    const card = media.closest(".menu-card");
    const caption = card?.querySelector(".menu-card__title")?.textContent?.trim();
    openLightbox(img, caption);
  }
});

document.addEventListener("keydown", (event) => {
  const tile = event.target.closest(".about__tile");

  if (tile && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    const img = tile.querySelector("img");
    const caption = tile.querySelector("figcaption")?.textContent?.trim();
    openLightbox(img, caption);
    return;
  }

  if (!lightbox?.hidden && event.key === "Escape") {
    closeLightbox();
  }
});

lightboxClose?.addEventListener("click", closeLightbox);
lightboxBackdrop?.addEventListener("click", closeLightbox);
