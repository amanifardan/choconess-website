(() => {
  const shell = document.querySelector(".menu-shell");
  const menuButton = shell?.querySelector(".menu-button");
  const closeButton = shell?.querySelector(".nav-close");

  if (!shell || !menuButton || !closeButton) return;

  // Opens or closes the menu and updates its state for screen readers.
  // If closed while hovering, it stays closed until the mouse leaves.
  const setMenuOpen = (open) => {
    shell.classList.toggle("menu-open", open);
    shell.classList.toggle("menu-dismissed", !open && shell.matches(":hover"));
    menuButton.setAttribute("aria-expanded", String(open));
  };

  // Hover opens it on devices with a mouse, unless it was just dismissed.
  shell.addEventListener("mouseenter", () => {
    if (window.matchMedia("(hover: hover)").matches && !shell.classList.contains("menu-dismissed")) {
      menuButton.setAttribute("aria-expanded", "true");
    }
  });
  // Leaving lets hover open the menu again; clicks can keep it open.
  shell.addEventListener("mouseleave", () => {
    shell.classList.remove("menu-dismissed");
    menuButton.setAttribute("aria-expanded", String(shell.classList.contains("menu-open")));
  });

  // The menu button switches state; the X and page links close it.
  menuButton.addEventListener("click", () => {
    setMenuOpen(!shell.classList.contains("menu-open"));
  });
  closeButton.addEventListener("click", () => setMenuOpen(false));
  shell.querySelectorAll(".nav-menu a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });
})();
