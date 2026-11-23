(() => {
  const menuShell = document.querySelector(".menu-shell");
  const heroHeader = document.querySelector(".hero-header");
  const menuButton = document.querySelector(".menu-button");
  let lastScrollY = window.scrollY;
  let frameRequested = false;

  // Reads the color and transparency, then combines the red, green and blue
  // brightness to decide if the surface is light enough for a dark logo.
  const isLightColor = (color) => {
    const values = color.match(/[\d.]+/g)?.map(Number);
    if (!values || values.length < 3 || (values.length > 3 && values[3] < 0.95)) return false;

    const luminance = values.slice(0, 3).map((value) => {
      const channel = value / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });

    return luminance[0] * 0.2126 + luminance[1] * 0.7152 + luminance[2] * 0.0722 >= 0.4;
  };

  // Finds whats behind a screen point, skipping the header itself, then checks
  // the first shape or background color. Images and missing colors count as dark.
  const isLightSurfaceAt = (x, y) => {
    const elements = document.elementsFromPoint(x, y)
      .filter((element) => !element.closest(".hero-header, .menu-button"));

    for (const element of elements) {
      for (let current = element; current && current !== document.body; current = current.parentElement) {
        if (current.tagName === "IMG") return false;

        const style = window.getComputedStyle(current);
        if (style.backgroundImage !== "none") return false;
        if (current.namespaceURI === "http://www.w3.org/2000/svg" && current.tagName.toLowerCase() !== "svg" && style.fill !== "none") {
          return isLightColor(style.fill);
        }
        if (style.backgroundColor !== "rgba(0, 0, 0, 0)" && style.backgroundColor !== "transparent") {
          return isLightColor(style.backgroundColor);
        }
      }
    }

    return false;
  };

  // Checks the surface at the logo's center and sets the logo and menu colors
  // through page styles, so they stay readable on a light background.
  const updateHeaderTheme = () => {
    const logoRect = heroHeader?.getBoundingClientRect();
    const logoTop = heroHeader ? Number.parseFloat(window.getComputedStyle(heroHeader).top) : 0;

    document.body.classList.toggle(
      "logo-on-light",
      Boolean(logoRect && isLightSurfaceAt(logoRect.left + logoRect.width / 2, logoTop + logoRect.height / 2))
    );
    document.body.classList.toggle("menu-on-light", document.body.classList.contains("logo-on-light"));
  };

  // Compares the new scroll position with the last one to hide or show the
  // header, keeping it visible at the top or when the menu is open.
  // It also refreshes the colors and saves the position for next time.
  const updateHeader = () => {
    const scrollY = window.scrollY;
    document.body.classList.toggle("has-scrolled", scrollY > 0);

    if (menuShell?.classList.contains("menu-open") || scrollY <= 0) {
      document.body.classList.remove("header-hidden");
    } else if (Math.abs(scrollY - lastScrollY) > 6) {
      document.body.classList.toggle("header-hidden", scrollY > lastScrollY);
    }

    updateHeaderTheme();
    lastScrollY = scrollY;
    frameRequested = false;
  };

  // Recheck the color after changing pages and when the site first loads.
  window.addEventListener("hashchange", () => window.requestAnimationFrame(updateHeaderTheme));
  window.requestAnimationFrame(updateHeaderTheme);
  // limit scroll updates to one per frame
  window.addEventListener("scroll", () => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateHeader);
  }, { passive: true });
})();

