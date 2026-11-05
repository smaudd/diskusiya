/**
 * Get discussions with cache using 5 minutes TLS. Consumers have the responsability of flushing cache as needed
 * 
 * This implementation can trigger the same request two times if two consumers fetch the data at the same time,
 * maybe it could be a good idea to cache pending requests too but it feels kind of overengineered for the usecase
 */

import logger from "./logger";

const cacheMap = new Map();

export function flushCache(key) {
    cacheMap.delete(key);
}

export async function getDiscussions({ data }) {
    data.loading = true;
    const rules = {
        sort: data.sort,
        expand: "user",
        fields: "slug,title,content:excerpt(200,true),expand.user.name,updated,created",
    };
    if (data.search) {
        rules.filter = app.pb.filter("title ~ {:search} || content ~ {:search}", {
            search: data.search,
        });
    }
    const hashSource = { ...rules, page: data.page, limit: data.limit };
    const hashedRules = JSON.stringify(hashSource);
    try {
        const cache = cacheMap.get(hashedRules);
        // we got cache using the same rules and it isn't expired
        if (cache && cache?.expires > Date.now()) {
            logger("[CACHE] Using cache for rules", hashSource, "info");
            data.totalPages = cache.data.totalPages;
            data.discussions = cache.data.items;
            data.totalItems = cache.data.totalItems;
            return hashedRules;
        }

        const list = await app.pb
            .collection("discussions")
            .getList(data.page, data.limit, rules);

        // 5 minutes from now
        const expires = Date.now() + 5 * 60 * 1000;
        cleanExpiredCache();
        cacheMap.set(hashedRules, { data: list, expires });
        data.totalPages = list.totalPages;
        data.discussions = list.items;
        data.totalItems = list.totalItems;
    } catch (err) {
        console.log(err);
        app.toasts.error(app.$("Something went wrong getting discussions"));
    } finally {
        data.loading = false;
    }
    return hashedRules;
}

function cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of cacheMap) {
        if (value.expires <= now) {
            cacheMap.delete(key);
        }
    }
}
