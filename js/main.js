document.addEventListener('DOMContentLoaded', function () {
  FloraMenu.init();
  FloraModal.initModals();
  FloraForms.initForms();

  FloraBestsellers.load();
  FloraTestimonials.load();
  FloraCatalog.init();

  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
    });
  }
});
