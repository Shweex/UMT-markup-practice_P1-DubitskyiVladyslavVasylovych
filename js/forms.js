window.FloraForms = {
  initForms: function () {
    const orderForm = document.querySelector('.order-modal__form');

    if (orderForm) {
      orderForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const terms = orderForm.querySelector('[name="order-terms"]');
        if (!terms || !terms.checked) {
          if (terms) terms.focus();
          return;
        }
        orderForm.reset();
      });
    }
  },
};
