(() => {
  const gallery = document.querySelector('.about-gallery');
  if (!gallery) return;
  const slides = [...gallery.querySelectorAll('.about-slide')];
  const dots = [...gallery.querySelectorAll('.about-dot')];
  const status = gallery.querySelector('.about-gallery-status');
  let current = 0;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    dots.forEach((dot, i) => {
      dot.setAttribute('aria-current', String(i === current));
    });
    status.textContent = `Photo ${current + 1} of ${slides.length}. ${slides[current].querySelector('figcaption').textContent}.`;
  }

  gallery.querySelector('.about-prev').addEventListener('click', () => showSlide(current - 1));
  gallery.querySelector('.about-next').addEventListener('click', () => showSlide(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));
  gallery.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showSlide(current + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
})();
