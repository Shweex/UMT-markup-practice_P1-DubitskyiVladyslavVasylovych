window.FloraState = {
  appState: {
    catalog: {
      page: 1,
      limit: 8,
      search: '',
      total: 0,
      isLoading: false,
      hasMore: true,
    },
  },

  resetCatalogPage() {
    this.appState.catalog.page = 1;
    this.appState.catalog.hasMore = true;
  },

  updateCatalogState(patch) {
    Object.assign(this.appState.catalog, patch);
  },
};
