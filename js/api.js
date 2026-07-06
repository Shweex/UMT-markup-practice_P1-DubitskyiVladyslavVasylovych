window.FloraAPI = (function () {
  const BOUQUETS_API = 'https://flora-api-qtqi.onrender.com/api/bouquets';
  const DB_URL = new URL('db.json', window.location.href).href;

  let localDb = null;
  let bouquetsCache = null;
  let localImageMap = null;

  function getHttp() {
    return window.axios;
  }

  function isPlaceholderPhoto(url) {
    return !url || /gravatar\.com/i.test(url);
  }

  async function getLocalImageMap() {
    if (localImageMap) return localImageMap;

    const db = await getLocalDb();
    const map = {};

    (db.bouquets || []).concat(db.bestsellers || []).forEach(function (entry) {
      const key = (entry.name || entry.title || '').toLowerCase().trim();
      if (key && entry.image) map[key] = entry.image;
    });

    localImageMap = map;
    return localImageMap;
  }

  function mapBouquet(item, imageMap) {
    const title = item.title || '';
    const localImage = imageMap[(title || '').toLowerCase().trim()];
    const image = isPlaceholderPhoto(item.photoURL) && localImage ? localImage : item.photoURL;

    return {
      id: item.id,
      name: title,
      title: title,
      description: item.description || '',
      price: Number(item.price),
      image: image,
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
    const imageMap = await getLocalImageMap();
    bouquetsCache = response.data.map(function (item) {
      return mapBouquet(item, imageMap);
    });
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
        const imageMap = await getLocalImageMap();
        return mapBouquet(response.data, imageMap);
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
