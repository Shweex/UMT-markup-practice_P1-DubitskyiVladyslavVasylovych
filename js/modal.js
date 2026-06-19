window.FloraModal = (function () {
  const openModals = new Set();

  function lockBody() {
    if (openModals.size > 0) document.body.classList.add('modal-open');
  }

  function unlockBody() {
    if (openModals.size === 0) document.body.classList.remove('modal-open');
  }

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    openModals.add(modal);
    lockBody();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    openModals.delete(modal);
    unlockBody();
  }

  function initModals() {
    document.querySelectorAll('[data-modal]').forEach(function (modal) {
      const backdrop = modal.querySelector('.modal__backdrop');
      const closeBtn = modal.querySelector('.modal__close');

      if (backdrop) backdrop.addEventListener('click', function () { closeModal(modal); });
      if (closeBtn) closeBtn.addEventListener('click', function () { closeModal(modal); });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      const lastModal = Array.from(openModals).pop();
      if (lastModal) closeModal(lastModal);
    });
  }

  function getModal(id) {
    return document.getElementById(id);
  }

  return {
    initModals: initModals,
    openModal: openModal,
    closeModal: closeModal,
    getModal: getModal,
  };
})();
