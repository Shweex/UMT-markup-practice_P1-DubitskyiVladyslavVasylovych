window.FloraTestimonials = {
  load: async function () {
    const list = document.querySelector('.testimonials__list');
    const status = document.querySelector('.testimonials__status');
    if (!list) return;

    try {
      if (status) {
        status.classList.remove('is-error', 'visually-hidden');
        status.textContent = 'Loading reviews...';
      }

      const result = await FloraAPI.fetchCollection('testimonials', { _limit: 3 });

      if (!result.data.length) {
        if (status) status.textContent = 'No reviews yet.';
        list.innerHTML = '';
        return;
      }

      list.insertAdjacentHTML('beforeend', FloraTemplates.renderTestimonialsMarkup(result.data));
      if (status) status.remove();
    } catch (error) {
      console.error(error);
      if (status) {
        status.textContent = 'Unable to load reviews.';
        status.classList.remove('visually-hidden');
        status.classList.add('is-error');
      }
    }
  },
};
