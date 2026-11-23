(() => {
  const track = document.querySelector(".product-carousel__track");
  const viewport = document.querySelector(".product-carousel__viewport");
  const signatureSlideshow = document.querySelector(".signature-section__slideshow");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (signatureSlideshow && !reducedMotion) {
    const images = Array.from(signatureSlideshow.querySelectorAll(".signature-section__image"));

    if (images.length > 1) {
      let activeIndex = 0;
      let timer = 0;

      // Hide the current picture, then show the next one (or start again).
      const advanceSlide = () => {
        images[activeIndex].classList.remove("is-active");
        images[activeIndex].setAttribute("aria-hidden", "true");
        activeIndex = (activeIndex + 1) % images.length;
        images[activeIndex].classList.add("is-active");
        images[activeIndex].removeAttribute("aria-hidden");
      };

      // Start a timer only if one isnt already running.
      const startSlideshow = () => {
        if (!timer) {
          signatureSlideshow.classList.add("is-playing");
          timer = window.setInterval(advanceSlide, 4000);
        }
      };

      // Stop the timer so pictures dont keep changing off screen.
      const stopSlideshow = () => {
        window.clearInterval(timer);
        timer = 0;
        signatureSlideshow.classList.remove("is-playing");
      };

      if ("IntersectionObserver" in window) {
        // Start or stop the timer as the slideshow enters or leaves the screen.
        const observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) {
            startSlideshow();
          } else {
            stopSlideshow();
          }
        }, { threshold: 0.25 });
        observer.observe(signatureSlideshow);
      } else {
        startSlideshow();
      }
    }
  }

  if (!track || !viewport || reducedMotion) return;

  const slides = Array.from(track.children);
  // Copy a slide for the loop, but hide the duplicate from screen readers.
  const cloneSlide = (slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelector("img").alt = "";
    return clone;
  };
  const leadingClones = Math.min(3, slides.length);

  slides.slice(-leadingClones).reverse().forEach((slide) => {
    track.insertBefore(cloneSlide(slide), track.firstChild);
  });
  slides.forEach((slide) => track.appendChild(cloneSlide(slide)));

  let index = 0;
  // Work out how far to move the row to put a slide in the middle.
  const centeredOffset = (slideIndex) => {
    const trackStyle = window.getComputedStyle(track);
    const gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
    const paddingLeft = parseFloat(trackStyle.paddingLeft) || 0;
    const slideWidth = slides[0].getBoundingClientRect().width;
    return viewport.clientWidth / 2 - paddingLeft - slideIndex * (slideWidth + gap) - slideWidth / 2;
  };

  track.style.transform = `translateX(${centeredOffset(leadingClones)}px)`;

  // Waits four seconds, moves to the next slide, and repeats. At the end it
  // jumps back to the real slides without animation, so the loop looks smooth.
  const pauseThenAdvance = () => {
    track.classList.add("is-resting");
    window.setTimeout(() => {
      track.classList.remove("is-resting");
      if (index === slides.length) {
        track.style.transition = "none";
        track.style.transform = `translateX(${centeredOffset(leadingClones)}px)`;
        index = 0;
      }

      const currentOffset = centeredOffset(leadingClones + index);
      track.style.transition = "transform 10ms linear";
      track.style.transform = `translateX(${currentOffset - 3}px)`;

      window.setTimeout(() => {
        index += 1;
        track.style.transition = "transform 2390ms cubic-bezier(0.22, 0.72, 0.24, 1)";
        track.style.transform = `translateX(${centeredOffset(leadingClones + index)}px)`;
        window.setTimeout(pauseThenAdvance, 2400);
      }, 10);
    }, 4000);
  };

  pauseThenAdvance();
})();
