window.FloraCatalog = (function () {
  const PAGE_LIMIT = 8;
  const list = document.querySelector('.catalog__list');
  const loadMoreBtn = document.querySelector('.catalog__more');
  const status = document.querySelector('.catalog__status');
  const emptyState = document.querySelector('.catalog__empty');

  async function loadCatalog(options) {
    options = options || {};
    const reset = options.reset || false;
    const state = FloraState.appState.catalog;

    if (!list || state.isLoading) return;

    try {
      FloraState.updateCatalogState({ isLoading: true });
      if (status) status.classList.remove('is-error');
      if (emptyState) emptyState.hidden = true;
      if (loadMoreBtn) loadMoreBtn.disabled = true;

      if (reset) {
        list.innerHTML = '';
        if (status) {
          status.classList.remove('visually-hidden');
          status.textContent = 'Loading bouquets...';
        }
      }

      const params = { _page: state.page, _limit: PAGE_LIMIT };

      const result = await FloraAPI.fetchCollection('bouquets', params);
      FloraState.updateCatalogState({ total: result.total });

      const pageItems = result.data.slice(0, PAGE_LIMIT);

      if (!pageItems.length && state.page === 1) {
        list.innerHTML = '';
        if (status) status.remove();
        if (emptyState) emptyState.hidden = false;
        if (loadMoreBtn) loadMoreBtn.hidden = true;
        FloraState.updateCatalogState({ hasMore: false, isLoading: false });
        return;
      }

      if (pageItems.length) {
        list.insertAdjacentHTML('beforeend', FloraTemplates.renderCatalogMarkup(pageItems));
        FloraProductModal.bindProductCards(list);
        if (status) status.remove();
        if (emptyState) emptyState.hidden = true;
      }

      const loadedCount = list.querySelectorAll('.catalog__item').length;
      const hasMore = loadedCount < result.total;
      FloraState.updateCatalogState({ hasMore: hasMore, isLoading: false });
      if (loadMoreBtn) {
        loadMoreBtn.hidden = !hasMore;
        loadMoreBtn.disabled = false;
      }
    } catch (error) {
      console.error(error);
      FloraState.updateCatalogState({ isLoading: false });
      if (loadMoreBtn) {
        loadMoreBtn.disabled = false;
        loadMoreBtn.hidden = true;
      }
      if (status) {
        status.textContent = 'Unable to load bouquets.';
        status.classList.remove('visually-hidden');
        status.classList.add('is-error');
      }
    }
  }

  function init() {
    FloraState.resetCatalogPage();
    FloraState.updateCatalogState({ limit: PAGE_LIMIT, page: 1, hasMore: true });

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', async function () {
        if (!FloraState.appState.catalog.hasMore) return;
        FloraState.updateCatalogState({ page: FloraState.appState.catalog.page + 1 });
        await loadCatalog();
      });
    }

    loadCatalog({ reset: true });
  }

  return { init: init, loadCatalog: loadCatalog };
})();
