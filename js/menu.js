window.FloraMenu = {
  init: function () {
    const menu = document.getElementById('mobile-menu');
    const burger = document.querySelector('.header__burger');
    const closeBtn = document.querySelector('.mobile-menu__close');

    if (!menu || !burger || !closeBtn) return;

    function setMenuOpen(isOpen) {
      menu.classList.toggle('is-open', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      burger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    }

    burger.addEventListener('click', function () {
      setMenuOpen(!menu.classList.contains('is-open'));
    });

    closeBtn.addEventListener('click', function () {
      setMenuOpen(false);
    });

    menu.addEventListener('click', function (event) {
      if (event.target === menu) setMenuOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        setMenuOpen(false);
      }
    });

    window.addEventListener('resize', function () {
      if (window.matchMedia('(min-width: 1440px)').matches) {
        setMenuOpen(false);
      }
    });
  },
};
