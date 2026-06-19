window.FloraBestsellers = {
  load: async function () {
    const list = document.querySelector('.bestsellers__list');
    const status = document.querySelector('.bestsellers__status');
    if (!list) return;

    try {
      if (status) {
        status.classList.remove('is-error', 'visually-hidden');
        status.textContent = 'Loading bestsellers...';
      }

      const result = await FloraAPI.fetchCollection('bestsellers', { _limit: 3 });

      if (!result.data.length) {
        if (status) status.textContent = 'No bestsellers found.';
        list.innerHTML = '';
        return;
      }

      list.insertAdjacentHTML('beforeend', FloraTemplates.renderBestsellersMarkup(result.data));
      if (status) status.remove();
      FloraProductModal.bindProductCards(list);
    } catch (error) {
      console.error(error);
      if (status) {
        status.textContent = 'Unable to load bestsellers.';
        status.classList.remove('visually-hidden');
        status.classList.add('is-error');
      }
    }
  },
};
