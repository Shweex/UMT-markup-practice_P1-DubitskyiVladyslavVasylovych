window.FloraAPI = (function () {
  const BOUQUETS_API = 'https://flora-api-qtqi.onrender.com/api/bouquets';
  const DB_URL = new URL('db.json', window.location.href).href;

  let localDb = null;
  let bouquetsCache = null;

  const LOCAL_IMAGE_MAP = (function buildLocalImageMap() {
    const map = {
      'floral melody': 'images/bouquet-peach-meadow.jpg',
      'blush romance': 'images/bouquet-blush-romance.jpg',
      'pastel garden': 'images/bouquet-pastel-garden.jpg',
      'spring elegance': 'images/bouquet-spring-elegance-1.jpg',
    };

    const source = window.FloraDB;
    if (!source) return map;

    (source.bouquets || []).concat(source.bestsellers || []).forEach(function (entry) {
      const key = (entry.name || entry.title || '').toLowerCase().trim();
      if (key && entry.image) map[key] = entry.image;
    });

    return map;
  })();

  function getHttp() {
    return window.axios;
  }

  function isPlaceholderPhoto(url) {
    return !url || /gravatar\.com/i.test(url);
  }

  function resolveBouquetImage(item) {
    const title = (item.title || item.name || '').toLowerCase().trim();
    const remoteImage = item.photoURL || item.image;

    if (isPlaceholderPhoto(remoteImage) && LOCAL_IMAGE_MAP[title]) {
      return LOCAL_IMAGE_MAP[title];
    }

    return remoteImage;
  }

  function mapBouquet(item) {
    const title = item.title || item.name || '';

    return {
      id: item.id,
      name: title,
      title: title,
      description: item.description || '',
      price: Number(item.price),
      image: resolveBouquetImage(item),
      photoURL: item.photoURL,
      alt: (title || 'Bouquet') + ' bouquet',
      favorite: Boolean(item.favorite),
    };
  }

  async function getLocalDb() {
    if (localDb) return localDb;

    if (window.FloraDB) {
      localDb = window.FloraDB;
      return localDb;
    }

    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      try {
        const http = getHttp();
        if (http) {
          const response = await http.get(DB_URL);
          localDb = response.data;
          return localDb;
        }

        const response = await fetch(DB_URL);
        if (!response.ok) throw new Error('db.json not found');
        localDb = await response.json();
        return localDb;
      } catch (error) {
        console.warn('db.json unavailable, using embedded data if present', error);
      }
    }

    if (window.FloraDB) {
      localDb = window.FloraDB;
      return localDb;
    }

    throw new Error('No local data source available.');
  }

  async function fetchBouquetsFromApi() {
    if (bouquetsCache) return bouquetsCache;

    const http = getHttp();
    if (!http) throw new Error('axios is not loaded');

    const response = await http.get(BOUQUETS_API, { timeout: 20000 });
    bouquetsCache = response.data.map(mapBouquet);
    return bouquetsCache;
  }

  function filterLocalItems(items, query) {
    if (!query) return items;

    const normalized = query.toLowerCase();
    return items.filter(function (item) {
      const haystack = [item.name, item.title, item.text, item.author, item.alt]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }

  function paginateItems(items, params) {
    const page = Number(params._page) || 1;
    const limit = Number(params._limit) > 0 ? Number(params._limit) : items.length;
    const start = (page - 1) * limit;

    return {
      data: items.slice(start, start + limit),
      total: items.length,
    };
  }

  async function fetchFromDbJson(resource, params) {
    const db = await getLocalDb();
    const items = filterLocalItems(db[resource] || [], params.q);
    return paginateItems(items, params);
  }

  async function findLocalItem(resource, id) {
    const db = await getLocalDb();
    return (db[resource] || []).find(function (entry) {
      return String(entry.id) === String(id);
    });
  }

  async function fetchCollection(resource, params) {
    params = params || {};

    if (resource === 'bouquets') {
      try {
        const all = await fetchBouquetsFromApi();
        return paginateItems(all, params);
      } catch (error) {
        console.warn('Bouquets API failed, using local data', error);
        return fetchFromDbJson('bouquets', params);
      }
    }

    if (resource === 'bestsellers') {
      try {
        const all = await fetchBouquetsFromApi();
        const limit = Number(params._limit) > 0 ? Number(params._limit) : 3;
        const favorites = all.filter(function (item) {
          return item.favorite;
        });
        const others = all.filter(function (item) {
          return !item.favorite;
        });
        const data = favorites.concat(others).slice(0, limit);

        return { data: data, total: data.length };
      } catch (error) {
        console.warn('Bestsellers API failed, using local data', error);
        return fetchFromDbJson('bestsellers', params);
      }
    }

    return fetchFromDbJson(resource, params);
  }

  async function fetchItem(resource, id) {
    if (resource === 'bouquets' || resource === 'bestsellers') {
      try {
        const http = getHttp();
        if (!http) throw new Error('axios is not loaded');

        const response = await http.get(BOUQUETS_API + '/' + id, { timeout: 20000 });
        return mapBouquet(response.data);
      } catch (error) {
        console.warn('Bouquet API item failed, using local data', error);
      }
    }

    const item = await findLocalItem(resource, id);
    if (!item) throw new Error('Item not found');
    return item;
  }

  return {
    fetchCollection: fetchCollection,
    fetchItem: fetchItem,
  };
})();
