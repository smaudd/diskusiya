/**
 * Get discussions with cache using 5 minutes TLS. Consumers have the responsability of flushing cache as needed
 *
 * This implementation can trigger the same request two times if two consumers fetch the data at the same time,
 * maybe it could be a good idea to cache pending requests too but it feels kind of overengineered for the usecase
 */

import logger from "../logger";
import toasts from "../../components/toast";
import { $ } from "../../utils/i18n";
import { collections } from "./config";
import { pb } from "../../pb";
import { modes } from "../../components/repliesList";

export const repliesExpand = "user,replyingTo,replyingTo.user";

export async function getReplies({ data }) {
    if (!data.discussionId) return;
    data.loading = true;
    try {
        const filter = pb.filter("discussion = {:id}", {
            id: data.discussionId,
        });
        // TODO: Replies pagination
        const list = await pb.collection("replies").getList(data.page, data.limit, {
            filter,
            expand: repliesExpand,
            sort: data.sort,
        });
        const dataToCache = {
            totalPages: list.totalPages,
            replies: list.items,
            totalItems: list.totalItems,
        };
        return dataToCache;
    } catch (err) {
        toasts.error($("Something went wrong getting replies"));
    } finally {
        data.loading = false;
    }
}

export async function deleteReply({ data }) {
    try {
        await pb.collection(collections.replies).delete(data.reply.id);
        toasts.info($("Reply deleted successfully"));
        return null;
    } catch (err) {
        toasts.error($("Something went wrong deleting this reply"));
    }
}

async function updateReply({ content, data }) {
    try {
        const update = await pb.collection("replies").update(data.reply.id, {
            content,
        });
        function updateReply(reply) {
            if (reply.id === data.reply.id) {
                reply.content = content;
                reply.updated = update.updated;
            }
            return reply;
        }
        const replies = data.replies.map(updateReply);
        toasts.info($("Reply updated successfully"));
        return {
            replies,
            id: data.reply.id,
        };
    } catch (err) {
        logger(err, "error");
        toasts.error($("Something went wrong updating your reply"));
    }
    return {
        replies: [],
        id: null,
    };
}
export async function createOrUpdateReply({ data, event, mode }) {
    event.preventDefault();
    const { value: content } = event.target.querySelector("textarea");
    const replyingTo = event.target.dataset.replyingTo;
    if (mode === modes.edit) {
        return updateReply({ content, data });
    }
    try {
        const newReply = await pb.collection(collections.replies).create(
            {
                content,
                user: pb.authStore?.record?.id,
                discussion: data.discussionId,
                replyingTo,
            },
            {
                expand: repliesExpand,
            },
        );
        toasts.info($("Reply created successfully"));
        event.target.reset();
        data.replies.push(newReply);
        return {
            replies: data.replies,
            id: newReply.id,
        };
    } catch (err) {
        logger(err, "error");
        toasts.error($("Something went wrong updating the discussion"));
    }
    return {
        replies: [],
        id: null,
    };
}
