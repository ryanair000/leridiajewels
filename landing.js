const body = document.body;
const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.getElementById("siteNav");
const navLinks = siteNav ? siteNav.querySelectorAll("a") : [];
const revealItems = document.querySelectorAll("[data-reveal]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

body.classList.add("js-ready");

function closeNav() {
    body.classList.remove("nav-open");

    if (navToggle) {
        navToggle.setAttribute("aria-expanded", "false");
    }
}

if (navToggle) {
    navToggle.addEventListener("click", () => {
        const isOpen = body.classList.toggle("nav-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });
}

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        closeNav();
    });
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
        closeNav();
    }
});

function updateHeaderState() {
    if (!header) {
        return;
    }

    header.classList.toggle("is-scrolled", window.scrollY > 10);
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

if (!reduceMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, instance) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("is-visible");
            instance.unobserve(entry.target);
        });
    }, {
        threshold: 0.18
    });

    revealItems.forEach((item) => observer.observe(item));
} else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
}
