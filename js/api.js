window.FloraAPI = (function () {
  const API_BASE = 'http://localhost:3000';
  const IS_LOCAL =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const DB_URL = new URL('db.json', window.location.href).href;

  let localDb = null;
  let serverAvailable = null;

  function getHttp() {
    return window.axios;
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

    throw new Error('No data source available. Use Live Server or run json-server.');
  }

  async function checkServer() {
    if (!IS_LOCAL || !getHttp()) return false;
    if (serverAvailable !== null) return serverAvailable;

    try {
      await getHttp().get(API_BASE + '/bestsellers', {
        params: { _limit: 1 },
        timeout: 800,
      });
      serverAvailable = true;
    } catch (error) {
      serverAvailable = false;
    }

    return serverAvailable;
  }

  function filterLocalItems(items, query) {
    if (!query) return items;

    const normalized = query.toLowerCase();
    return items.filter(function (item) {
      const haystack = [item.name, item.text, item.author, item.alt]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }

  function paginateLocalItems(items, params) {
    const page = Number(params._page) || 1;
    const limit = Number(params._limit) > 0 ? Number(params._limit) : 8;
    const start = (page - 1) * limit;
    return {
      data: items.slice(start, start + limit),
      total: items.length,
    };
  }

  async function fetchFromDbJson(resource, params) {
    const db = await getLocalDb();
    const items = filterLocalItems(db[resource] || [], params.q);
    return paginateLocalItems(items, params);
  }

  async function fetchFromServer(resource, params) {
    const http = getHttp();
    const response = await http.get(API_BASE + '/' + resource, {
      params: params,
      timeout: 3000,
    });
    const limit = Number(params._limit) > 0 ? Number(params._limit) : 0;
    const page = Number(params._page) || 1;
    const total = Number(response.headers['x-total-count'] || response.data.length);
    let data = response.data;

    if (limit > 0 && data.length > limit) {
      const start = (page - 1) * limit;
      data = data.slice(start, start + limit);
    }

    return { data: data, total: total };
  }

  async function fetchCollection(resource, params) {
    params = params || {};

    if (await checkServer()) {
      try {
        return await fetchFromServer(resource, params);
      } catch (error) {
        console.warn('json-server request failed, using local data', error);
      }
    }

    return fetchFromDbJson(resource, params);
  }

  async function findLocalItem(resource, id) {
    const db = await getLocalDb();
    return (db[resource] || []).find(function (entry) {
      return String(entry.id) === String(id);
    });
  }

  async function enrichProduct(item, resource, id) {
    if (!item) return item;

    if (item.description) return item;

    const db = await getLocalDb();
    const sameCollection = (db[resource] || []).find(function (entry) {
      return String(entry.id) === String(id);
    });

    if (sameCollection && sameCollection.description) {
      return Object.assign({}, item, { description: sameCollection.description });
    }

    const bouquetMatch = (db.bouquets || []).find(function (entry) {
      return String(entry.id) === String(id) || (item.name && entry.name === item.name);
    });

    if (bouquetMatch && bouquetMatch.description) {
      return Object.assign({}, item, { description: bouquetMatch.description });
    }

    const bestsellerMatch = (db.bestsellers || []).find(function (entry) {
      return String(entry.id) === String(id) || (item.name && entry.name === item.name);
    });

    if (bestsellerMatch && bestsellerMatch.description) {
      return Object.assign({}, item, { description: bestsellerMatch.description });
    }

    return item;
  }

  async function fetchItem(resource, id) {
    let item = null;

    if (await checkServer()) {
      try {
        const response = await getHttp().get(API_BASE + '/' + resource + '/' + id, {
          timeout: 3000,
        });
        item = response.data;
      } catch (error) {
        console.warn('json-server request failed, using local data', error);
      }
    }

    if (!item) {
      item = await findLocalItem(resource, id);
    }

    if (!item) throw new Error('Item not found');
    return enrichProduct(item, resource, id);
  }

  async function createItem(resource, payload) {
    if (await checkServer()) {
      try {
        const response = await getHttp().post(API_BASE + '/' + resource, payload, {
          timeout: 3000,
        });
        return response.data;
      } catch (error) {
        console.warn('json-server POST failed, using local data', error);
      }
    }

    const db = await getLocalDb();
    const items = db[resource] || [];
    const nextId =
      items.reduce(function (max, entry) {
        return Math.max(max, Number(entry.id) || 0);
      }, 0) + 1;
    const newItem = Object.assign({}, payload, { id: nextId });

    items.push(newItem);
    db[resource] = items;
    localDb = db;

    return newItem;
  }

  return {
    fetchCollection: fetchCollection,
    fetchItem: fetchItem,
    createItem: createItem,
  };
})();
