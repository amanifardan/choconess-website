(() => {
  const pages = Array.from(document.querySelectorAll("[data-page]"));
  const menuShell = document.querySelector(".menu-shell");
  const menuButton = menuShell?.querySelector(".menu-button");
  const productPage = document.querySelector(".page-product");
  const products = new Map();
  // Turn a product name into a simple address, like crispy-chocolate-fingers.
  const slugify = (name) => name.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Read each menu item, make it a link, and save its details for its page.
  document.querySelectorAll(".menu-category").forEach((category) => {
    const categoryName = category.querySelector("h2").textContent.trim();
    const packaging = category.querySelector(".menu-category__packaging")?.textContent.trim() || "";

    category.querySelectorAll(".menu-item").forEach((item) => {
      const name = item.querySelector("h3").textContent.trim();
      const slug = slugify(name);
      if (products.has(slug)) throw new Error(`Duplicate product URL: ${slug}`);

      const link = document.createElement("a");
      link.className = "menu-item__link";
      link.href = `#product/${slug}`;
      while (item.firstChild) link.appendChild(item.firstChild);
      item.appendChild(link);
      products.set(slug, { name, categoryName, packaging, item });
    });
  });

  // Finds a product by its address and fills in its picture, details and
  // related items. If it doesnt exist, shows a not-found message instead.
  // Sharing is only enabled for web addresses, not local files.
  const showProduct = (slug) => {
    const product = products.get(slug);
    const main = productPage.querySelector(".product-page__main");
    const details = productPage.querySelector(".product-page__details");
    const related = productPage.querySelector(".product-page__related");
    const notFound = productPage.querySelector(".product-page__not-found");
    productPage.querySelector(".product-page").setAttribute("aria-labelledby", product ? "product-title" : "product-not-found-title");
    main.hidden = !product;
    details.hidden = !product;
    related.hidden = !product;
    notFound.hidden = Boolean(product);
    if (!product) {
      document.title = "Product not found | Choconess";
      return;
    }

    const image = product.item.querySelector("img");
    const productImage = productPage.querySelector(".product-page__image");
    productImage.src = image.src;
    productImage.alt = product.name;
    productPage.querySelector(".product-page__category").textContent = product.categoryName;
    productPage.querySelector("#product-title").textContent = product.name;
    productPage.querySelector(".product-page__description").textContent = `Explore ${product.name} from our ${product.categoryName} collection.`;
    const packaging = productPage.querySelector(".product-page__packaging");
    packaging.textContent = product.packaging;
    packaging.hidden = !product.packaging;
    const share = productPage.querySelector(".product-page__share");
    share.hidden = !["http:", "https:"].includes(window.location.protocol);
    if (!share.hidden) {
      share.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${product.name} - ${window.location.href}`)}`;
    }

    const relatedItems = related.querySelector(".menu-category__items");
    relatedItems.replaceChildren();
    const relatedProducts = Array.from(products.values()).filter((other) => other.categoryName === product.categoryName && other !== product).slice(0, 4);
    relatedProducts.forEach((other) => relatedItems.appendChild(other.item.cloneNode(true)));
    related.hidden = relatedProducts.length === 0;
    document.title = `${product.name} | Choconess`;
  };
  const pageNames = {
    home: "Choconess",
    about: "Our Story | Choconess",
    menu: "Menu | Choconess",
    contact: "Get in Touch | Choconess"
  };
  const validPages = new Set(pages.map((page) => page.dataset.page));
  const errorPage = document.querySelector(".page-error");
  const errorDetails = {
    "400": {
      title: "Bad request",
      message: "This link looks incomplete or invalid. Check it and try again."
    },
    "404": {
      title: "Page not found",
      message: "Sorry, we couldn't find the page you were looking for."
    },
    "500": {
      title: "Something went wrong",
      message: "Something went wrong on our end. Please try again later."
    }
  };
  const showError = (code) => {
    const error = errorDetails[code];
    errorPage.querySelector(".error-page__code").textContent = code;
    errorPage.querySelector("#error-page-title").textContent = error.title;
    errorPage.querySelector(".error-page__message").textContent = error.message;
    document.title = `${error.title} | Choconess`;
  };

  // Reads the part after # in the address and shows that page or product.
  // Updates the title and active link, closes the menu and goes to the top.
  const showCurrentPage = () => {
    const requestedPage = window.location.hash.slice(1).toLowerCase();
    const productRoute = requestedPage.startsWith("product/");
    const productSlug = productRoute ? requestedPage.slice("product/".length) : "";
    const malformedProductRoute = productRoute && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(productSlug);
    const errorCode = ["400", "404", "500"].includes(requestedPage)
      ? requestedPage
      : malformedProductRoute
        ? "400"
        : "404";
    const currentPage = !requestedPage
      ? "home"
      : ["400", "404", "500"].includes(requestedPage) || malformedProductRoute
        ? "error"
        : productRoute
          ? "product"
          : validPages.has(requestedPage)
            ? requestedPage
            : "error";

    pages.forEach((page) => {
      page.hidden = page.dataset.page !== currentPage;
    });

    document.body.classList.remove("page-home", "page-about", "page-menu", "page-contact", "page-product", "page-error");
    document.body.classList.add(`page-${currentPage}`);
    if (currentPage === "product") {
      showProduct(productSlug);
    } else if (currentPage === "error") {
      showError(errorCode);
    } else {
      document.title = pageNames[currentPage];
    }

    document.querySelectorAll(".nav-menu a, .site-footer__navigation a").forEach((link) => {
      if (link.hash === `#${currentPage === "product" ? "menu" : currentPage}`) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    menuShell?.classList.remove("menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("header-hidden", "has-scrolled");
    window.scrollTo(0, 0);
  };

  const initialRoute = window.location.hash.slice(1).toLowerCase();
  if (!initialRoute) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#home`);
  }

  window.addEventListener("hashchange", showCurrentPage);
  showCurrentPage();
})();
