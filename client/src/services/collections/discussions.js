/**
 * Get discussions with cache using 5 minutes TLS. Consumers have the responsability of flushing cache as needed
 *
 * This implementation can trigger the same request two times if two consumers fetch the data at the same time,
 * maybe it could be a good idea to cache pending requests too but it feels kind of overengineered for the usecase
 */

import toasts from "../../components/toast";
import { navigate } from "../../utils/navigation";
import slugify from "../../utils/slugify";
import randomString from "../../utils/randomString";
import logger from "../logger";
import { $ } from "../../utils/i18n";
import { collections } from "./config";
import { pb } from "../../pb";

const cacheMap = new Map();
const fiveMinues = 5 * 60 * 1000;

export const discussionFields =
    "slug,title,content:excerpt(200,true),expand.user.name,updated,created";

export function flushCache(key) {
    cacheMap.delete(key);
}

export async function getDiscussions({ data }) {
    data.loading = true;
    const rules = {
        sort: data.sort,
        expand: collections.user,
        fields: discussionFields,
    };
    if (data.search) {
        rules.filter = pb.filter("title ~ {:search} || content ~ {:search}", {
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
            return cache.data;
        }

        const list = await pb
            .collection(collections.discussions)
            .getList(data.page, data.limit, rules);

        // 5 minutes from now
        const expires = Date.now() + fiveMinues;
        cleanExpiredCache();
        const dataToCache = {
            totalPages: list.totalPages,
            discussions: list.items,
            totalItems: list.totalItems,
        };
        cacheMap.set(hashedRules, { data: dataToCache, expires });
        return dataToCache;
    } catch (err) {
        console.log(err);
        toasts.error($("Something went wrong getting discussions"));
    } finally {
        data.loading = false;
    }
    return hashedRules;
}

export async function getDiscussion({ data, route }) {
    data.loading = true;
    try {
        const filter = pb.filter("slug = {:slug}", {
            slug: route.params.slug,
        });
        const discussion = await pb
            .collection(collections.discussions)
            .getFirstListItem(filter, {
                expand: collections.user,
            });
        return discussion;
    } catch (err) {
        if (err.status === 404) {
            data.notfound = true;
            data.loading = false;
            return;
        }
        toasts.error($("Something went wrong getting this discussion"));
    } finally {
        data.loading = false;
    }
}

export async function createDiscussion({ event }) {
    event.preventDefault();
    const [{ value: title }, { value: content }] = event.target.elements;
    try {
        const item = await pb.collection("discussions").create(
            {
                title,
                content,
                slug: `${slugify(title)}-${randomString()}`,
                user: pb.authStore.record.id,
            },
            {
                fields: "slug",
            },
        );
        toasts.info($("Discussion created!"));
        cacheMap.clear();
        navigate(`/d/${item.slug}`);
        event.target.reset();
    } catch (err) {
        console.log(err);
        toasts.error($("Something went wrong saving the discussion"));
    }
}

export async function updateDiscussion({ data, event }) {
    // this isn't necessary but this function shouldn't even try if user isnt the owner
    if (!data.isOwner) {
        return;
    }
    event.preventDefault();
    const [{ value: title }, { value: content }] = event.target.elements;
    try {
        const updates = {};
        let shouldRedirect = false;
        if (title !== data.discussion.title) {
            updates.title = title;
            updates.slug = `${slugify(title)}-${randomString()}`;
            shouldRedirect = true;
        }
        if (content !== data.discussion.content) {
            updates.content = content;
        }
        const item = await pb
            .collection(collections.discussions)
            .update(data.discussion.id, updates);
        if (shouldRedirect) {
            navigate(`/d/${item.slug}`);
        }
        toasts.info($("Discussion updated successfully"));
        return item;
    } catch (err) {
        logger(err, "error");
        toasts.error($("Something went wrong updating the discussion"));
    } finally {
        flushAll();
    }
}

export async function deleteDiscussion({ data }) {
    // this isn't necessary but this function shouldn't even try if user isnt the owner
    if (!data.isOwner) {
        return;
    }
    try {
        await pb.collection(collections.discussions).delete(data.discussion.id);
        navigate(`/`);
        flushAll();
    } catch (err) {
        toasts.error($("Something went wrong deleting this discussion"));
    } finally {
        toasts.info($("Discussion deleted successfully"));
    }
}

function cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of cacheMap) {
        if (value.expires <= now) {
            cacheMap.delete(key);
        }
    }
}

function flushAll() {
    cacheMap.clear();
}
