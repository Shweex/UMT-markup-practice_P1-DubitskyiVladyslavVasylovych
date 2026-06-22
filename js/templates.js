window.FloraTemplates = (function () {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function imageSrcset(imagePath) {
    const base = imagePath.replace(/\.jpg$/, '');
    return imagePath + ' 1x, ' + base + '@2x.jpg 2x';
  }

  function hiddenBestsellerClass(index) {
    if (index === 1) return ' bestsellers__item--hidden-mobile';
    if (index === 2) return ' bestsellers__item--hidden-tablet';
    return '';
  }

  function hiddenTestimonialClass(index) {
    if (index === 1) return ' testimonials__item--hidden-mobile';
    if (index === 2) return ' testimonials__item--hidden-tablet';
    return '';
  }

  function renderBestsellersMarkup(items) {
    return items
      .map(function (item, index) {
        return (
          '<li class="bestsellers__item' +
          hiddenBestsellerClass(index) +
          '" data-product-id="' +
          item.id +
          '" data-product-type="bestsellers" data-aos="fade-up" data-aos-delay="' +
          (index + 1) * 100 +
          '">' +
          '<article class="product-card">' +
          '<img class="product-card__image" src="' +
          escapeHtml(item.image) +
          '" srcset="' +
          imageSrcset(item.image) +
          '" alt="' +
          escapeHtml(item.alt) +
          '" width="300" height="375" loading="lazy" />' +
          '<h3 class="product-card__name">' +
          escapeHtml(item.name) +
          '</h3>' +
          '<p class="product-card__price">$' +
          escapeHtml(item.price) +
          '</p>' +
          '</article></li>'
        );
      })
      .join('');
  }

  function renderCatalogMarkup(items) {
    return items
      .map(function (item, index) {
        return (
          '<li class="catalog__item" data-product-id="' +
          item.id +
          '" data-product-type="bouquets" data-aos="fade-up" data-aos-delay="' +
          index * 50 +
          '">' +
          '<article class="catalog-card">' +
          '<img class="catalog-card__image" src="' +
          escapeHtml(item.image) +
          '" srcset="' +
          imageSrcset(item.image) +
          '" alt="' +
          escapeHtml(item.alt) +
          '" width="300" height="300" loading="lazy" />' +
          '<h3 class="catalog-card__name">' +
          escapeHtml(item.name) +
          '</h3>' +
          '<p class="catalog-card__price">$' +
          escapeHtml(item.price) +
          '</p>' +
          '</article></li>'
        );
      })
      .join('');
  }

  function renderTestimonialsMarkup(items) {
    return items
      .map(function (item, index) {
        return (
          '<li class="testimonials__item' +
          hiddenTestimonialClass(index) +
          '" data-aos="fade-up" data-aos-delay="' +
          (index + 1) * 100 +
          '">' +
          '<blockquote class="testimonial-card">' +
          '<p class="testimonial-card__text">"' +
          escapeHtml(item.text) +
          '"</p>' +
          '<footer class="testimonial-card__author">' +
          '<cite class="testimonial-card__name">' +
          escapeHtml(item.author) +
          '</cite></footer></blockquote></li>'
        );
      })
      .join('');
  }

  function renderProductModalContent(product) {
    const description =
      product.description ||
      'Each stem is carefully selected to create a bouquet that radiates freshness, elegance, and the gentle charm of spring.';

    return (
      '<img class="product-modal__image" src="' +
      escapeHtml(product.image) +
      '" srcset="' +
      imageSrcset(product.image) +
      '" alt="' +
      escapeHtml(product.alt) +
      '" width="400" height="400" />' +
      '<div class="product-modal__body">' +
      '<h2 class="product-modal__title" id="product-modal-title">' +
      escapeHtml(product.name) +
      '</h2>' +
      '<p class="product-modal__price">$' +
      escapeHtml(product.price) +
      '</p>' +
      '<p class="product-modal__description">' +
      escapeHtml(description) +
      '</p>' +
      '<div class="product-modal__actions">' +
      '<button type="button" class="btn btn--primary product-modal__buy">Buy now</button>' +
      '<label class="visually-hidden" for="product-quantity">Quantity</label>' +
      '<input class="product-modal__quantity" type="number" id="product-quantity" name="product-quantity" value="1" min="1" max="99" />' +
      '</div></div>'
    );
  }

  return {
    renderBestsellersMarkup: renderBestsellersMarkup,
    renderCatalogMarkup: renderCatalogMarkup,
    renderTestimonialsMarkup: renderTestimonialsMarkup,
    renderProductModalContent: renderProductModalContent,
  };
})();
