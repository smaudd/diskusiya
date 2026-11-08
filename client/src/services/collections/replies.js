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

export const repliesExpand = "user,replies_via_replyingTo,replies_via_replyingTo.user";

export async function getReplies({ data }) {
    if (!data.discussionId) return;
    data.loading = true;
    try {
        const filter = pb.filter("discussion = {:id} && replyingTo:length = 0", {
            id: data.discussionId,
        });
        // TODO: Replies pagination
        const replies = await pb.collection("replies").getList(1, 20, {
            filter,
            expand: repliesExpand,
            sort: data.sort,
        });
        return replies.items;
    } catch (err) {
        toasts.error($("Something went wrong getting replies"));
    } finally {
        data.loading = false;
    }
}

export async function deleteReply({ data }) {
    try {
        await pb.collection(collections.replies).update(data.reply.id, {
            deleted: true,
            user: "",
            content: "[DELETED]",
        });
        data.replies = data.replies.map((reply) => {
            if (reply.id === data.reply.id) {
                return {
                    ...reply,
                    deleted: true,
                };
            }
            // see if we need to update the expanded
            if (reply.expand?.replies_via_replyingTo?.length) {
                reply.expand.replies_via_replyingTo =
                    reply.expand.replies_via_replyingTo.map((subreply) => {
                        if (subreply.id !== data.reply.id) {
                            return {
                                ...subreply,
                                deleted: true,
                            };
                        }
                    });
            }
            return reply;
        });
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
        const replies = data.replies.map((reply) => {
            reply = updateReply(reply);
            // see if we need to update the expanded
            if (reply.expand?.replies_via_replyingTo?.length) {
                reply.expand.replies_via_replyingTo.map(updateReply);
            }

            return reply;
        });
        toasts.info($("Reply updated successfully"));
        return replies;
    } catch (err) {
        logger(err, "error");
        toasts.error($("Something went wrong updating your reply"));
    }
    return;
}
export async function createOrUpdateReply({ data, event }) {
    event.preventDefault();
    const [{ value: content }] = event.target.elements;
    const replyingTo = event.target.dataset.replyingTo;
    if (data.currentReplyContent) {
        const replies = await updateReply({ content, data });
        return {
            replies,
            id: data.reply.id,
        };
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
        if (!replyingTo) {
            return {
                replies: [newReply, ...data.replies],
                id: newReply.id,
            };
        }
        return {
            replies: data.replies.map((reply) => {
                if (replyingTo === reply.id) {
                    if (!reply.expand.replies_via_replyingTo) {
                        reply.expand.replies_via_replyingTo = [];
                    }
                    reply.expand.replies_via_replyingTo.push(newReply);
                }
                return reply;
            }),
            id: newReply.id,
        };
    } catch (err) {
        logger(err, "error");
        toasts.error($("Something went wrong updating the discussion"));
    }
}
