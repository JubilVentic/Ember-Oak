const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const mobileNav = document.getElementById("mobile-nav");

function setMobileNavOpen(open) {
  if (!navToggle || !mobileNav) return;
  navToggle.setAttribute("aria-expanded", String(open));
  mobileNav.hidden = !open;
  mobileNav.classList.toggle("is-open", open);
  document.body.classList.toggle("mobile-nav-open", open);
}

function closeMobileNav() {
  setMobileNavOpen(false);
}

function updateHeader() {
  if (!header) return;
  const hero = document.querySelector(".hero");
  const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 0;
  const overHero = window.scrollY < heroBottom - 80;
  header.classList.toggle("site-header--scrolled", window.scrollY > 24);
  header.classList.toggle("site-header--over-hero", overHero);
  document.body.classList.toggle("header-over-hero", overHero && window.scrollY <= 24);
}

window.addEventListener("scroll", updateHeader);
window.addEventListener("resize", updateHeader);
updateHeader();

const heroVideo = document.querySelector(".hero__video");
const heroSection = document.querySelector(".hero");

if (heroVideo && heroSection) {
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const syncHeroVideo = () => {
    if (reducedMotionQuery.matches) {
      heroVideo.pause();
      heroVideo.removeAttribute("autoplay");
      heroSection.classList.remove("hero--video-ready");
      return;
    }

    heroVideo.setAttribute("autoplay", "");
    heroVideo.play().catch(() => {});
  };

  heroVideo.addEventListener("playing", () => {
    heroSection.classList.add("hero--video-ready");
  });

  heroVideo.addEventListener("error", () => {
    heroSection.classList.remove("hero--video-ready");
  });

  syncHeroVideo();
  reducedMotionQuery.addEventListener("change", syncHeroVideo);
}

document.querySelector(".mobile-nav__brand")?.addEventListener("click", (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
  closeMobileNav();
  window.setTimeout(updateHeader, 400);
});

document.querySelector(".nav__logo")?.addEventListener("click", (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
  closeMobileNav();
  window.setTimeout(updateHeader, 400);
});

navToggle?.addEventListener("click", () => {
  const open = navToggle.getAttribute("aria-expanded") === "true";
  setMobileNavOpen(!open);
});

document.querySelector(".mobile-nav__close")?.addEventListener("click", closeMobileNav);

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileNav);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMobileNav();
});

const revealSections = document.querySelectorAll(".section-reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
);

revealSections.forEach((section) => revealObserver.observe(section));

const navLinks = document.querySelectorAll("[data-nav]");
const navSections = [...new Set(
  [...navLinks].map((link) => link.dataset.nav).filter(Boolean)
)]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

function updateActiveNav() {
  if (!navLinks.length || !navSections.length) return;

  const offset = 120;
  let current = null;

  navSections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - offset) {
      current = section.id;
    }
  });

  navLinks.forEach((link) => {
    const active = current !== null && link.dataset.nav === current;
    link.classList.toggle("nav__link--active", link.classList.contains("nav__link") && active);
    link.classList.toggle("mobile-nav__link--active", link.classList.contains("mobile-nav__link") && active);
  });
}

window.addEventListener("scroll", updateActiveNav, { passive: true });
updateActiveNav();

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
