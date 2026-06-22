window.FloraProductModal = (function () {
  const productModal = document.getElementById('product-modal');
  const orderModal = document.getElementById('order-modal');
  const productContent = productModal
    ? productModal.querySelector('.product-modal__content')
    : null;

  async function openProductModal(resource, id) {
    if (!productModal || !productContent) return;

    try {
      productContent.innerHTML = '<p class="modal__loading">Loading...</p>';
      FloraModal.openModal(productModal);

      const product = await FloraAPI.fetchItem(resource, id);
      productContent.innerHTML = FloraTemplates.renderProductModalContent(product);

      const buyBtn = productContent.querySelector('.product-modal__buy');
      if (buyBtn) {
        buyBtn.addEventListener('click', function () {
          FloraModal.closeModal(productModal);
          FloraModal.openModal(orderModal);
        });
      }
    } catch (error) {
      console.error(error);
      productContent.innerHTML =
        '<p class="modal__error">Unable to load product details. Please try again.</p>';
    }
  }

  function bindProductCards(container) {
    if (!container || container.dataset.cardsBound) return;
    container.dataset.cardsBound = 'true';

    container.addEventListener('click', function (event) {
      const card = event.target.closest('[data-product-id]');
      if (!card || !container.contains(card)) return;

      openProductModal(card.dataset.productType, card.dataset.productId);
    });

    container.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;

      const card = event.target.closest('[data-product-id]');
      if (!card || !container.contains(card)) return;

      event.preventDefault();
      openProductModal(card.dataset.productType, card.dataset.productId);
    });
  }

  return {
    openProductModal: openProductModal,
    bindProductCards: bindProductCards,
  };
})();
