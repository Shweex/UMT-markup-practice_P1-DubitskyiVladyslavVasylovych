window.FloraTestimonials = {
  list: null,
  status: null,
  form: null,
  formStatus: null,

  load: async function () {
    const list = this.list || document.querySelector('.testimonials__list');
    const status = this.status || document.querySelector('.testimonials__status');
    if (!list) return;

    try {
      if (status) {
        status.classList.remove('is-error', 'visually-hidden');
        status.textContent = 'Loading reviews...';
      }

      const result = await FloraAPI.fetchCollection('testimonials', { _limit: 3 });

      list.innerHTML = '';

      if (!result.data.length) {
        if (status) status.textContent = 'No reviews yet.';
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

  handleSubmit: async function (event) {
    event.preventDefault();

    const form = this.form;
    const formStatus = this.formStatus;
    if (!form) return;

    const authorInput = form.querySelector('[name="feedback-author"]');
    const textInput = form.querySelector('[name="feedback-text"]');
    const submitBtn = form.querySelector('[type="submit"]');
    const author = authorInput ? authorInput.value.trim() : '';
    const text = textInput ? textInput.value.trim() : '';

    if (!author || !text) {
      if (formStatus) {
        formStatus.textContent = 'Please fill in your name and review.';
        formStatus.classList.add('is-error');
      }
      return;
    }

    if (formStatus) {
      formStatus.classList.remove('is-error');
      formStatus.textContent = 'Sending review...';
    }

    if (submitBtn) submitBtn.disabled = true;

    try {
      await FloraAPI.createItem('testimonials', { author: author, text: text });
      form.reset();
      if (formStatus) formStatus.textContent = 'Thank you! Your review has been added.';
      await this.load();
    } catch (error) {
      console.error(error);
      if (formStatus) {
        formStatus.textContent = 'Unable to send review. Start json-server and try again.';
        formStatus.classList.add('is-error');
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  },

  init: function () {
    this.list = document.querySelector('.testimonials__list');
    this.status = document.querySelector('.testimonials__status');
    this.form = document.querySelector('.testimonials__form');
    this.formStatus = document.querySelector('.testimonials__form-status');

    this.load();

    if (this.form) {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }
  },
};
