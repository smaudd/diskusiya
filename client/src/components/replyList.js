import { t, store, watch } from "shablon";
import recordMeta from "./recordMeta";
import sort from "./sort";
import replyActions from "./replyActions";
import replyForm from "./replyForm";
import markdown from "./markdown";
import { navigateQueryParam } from "../utils/navigation";
import { $ } from "../utils/i18n";
import toasts from "../components/toast";
import modals from "../components/modal";
import logger from "../services/logger";
import confirmationModal from "./confirmationModal";


// TODO: Chunck this file into smaller modules
// TODO: Add pagination to replies
export default function replyList({ data }) {
    let deleteModal = null;
    const searchParams = new URLSearchParams(location.search);
    const localData = store({
        reply: null,
        replies: [],
        loading: false,
        focus: searchParams.get("focus"),
        currentReplyContent: "",
        mode: null,
    });
    async function onSortChange(e) {
        data.sort = e.target.value;
        navigateQueryParam([
            {
                name: "sort",
                value: data.sort,
            },
        ]);
    }
    async function getReplies() {
        if (!data.discussion) return;
        localData.loading = true;
        try {
            const filter = app.pb.filter("discussion = {:id} && replyingTo:length = 0", {
                id: data.discussion.id,
            });
            const replies = await app.pb.collection("replies").getList(1, 20, {
                filter,
                expand: "user,replies_via_replyingTo,replies_via_replyingTo.user",
                sort: data.sort,
            });
            localData.replies = replies.items;
        } catch (err) {
            console.log(err);
            toasts.error($("Something went wrong getting replies"));
        } finally {
            localData.loading = false;
        }
    }
    async function onSubmitReply(e) {
        e.preventDefault();
        const [{ value: content }] = e.target.elements;
        const replyingTo = e.target.dataset.replyingTo;
        if (localData.currentReplyContent) {
            try {
                const update = await app.pb
                    .collection("replies")
                    .update(localData.reply, {
                        content,
                    });
                toasts.info($("Reply updated successfully"));
                function updateReply(reply) {
                    if (reply.id === localData.reply) {
                        reply.content = content;
                        reply.updated = update.updated;
                    }
                    return reply;
                }
                localData.replies = localData.replies.map((reply) => {
                    reply = updateReply(reply);
                    // see if we need to update the expanded
                    if (reply.expand?.replies_via_replyingTo?.length) {
                        reply.expand.replies_via_replyingTo.map(updateReply);
                    }
                    return reply;
                });
                localData.reply = null;
                localData.currentReplyContent = null;
            } catch (err) {
                logger(err, "error");
                toasts.error($("Something went wrong updating your reply"));
            }
            return;
        }
        try {
            const reply = await app.pb.collection("replies").create({
                content,
                user: app.pb.authStore.record.id,
                discussion: data.discussion.id,
                replyingTo,
            });
            navigateQueryParam([
                {
                    name: "focus",
                    value: `reply-${reply.id}`,
                },
            ]);
            toasts.info($("Reply created successfully"));
        } catch (err) {
            logger(err, "error");
            toasts.error($("Something went wrong updating the discussion"));
        } finally {
            app.cache.flushAll();
        }
    }
    // TODO: Imporve this focus stuff
    // watch(
    //     () => [localData.focus],
    //     () => {
    //         // it seems watcher runs after elements are available in the DOM. This doens't feel ok but it seems to work
    //         setTimeout(() => {
    //             if (localData.focus) {
    //                 const el = document.getElementById(localData.focus);
    //                 if (el) {
    //                     el.scrollIntoView({
    //                         behavior: "smooth",
    //                         block: "center",
    //                     });
    //                     el.classList.add("focus");
    //                     setTimeout(() => {
    //                         el.classList.remove("focus");
    //                     }, 2000);
    //                 }
    //             }
    //         });
    //     },
    // );
    async function onDeleteReply() {
        try {
            await app.pb.collection("replies").delete(localData.reply.id);
            localData.replies = localData.replies.filter((reply) => {
                if (reply.id === localData.reply.id) {
                    return false;
                }
                // see if we need to update the expanded
                if (reply.expand?.replies_via_replyingTo?.length) {
                    reply.expand.replies_via_replyingTo =
                        reply.expand.replies_via_replyingTo.filter(
                            (reply) => reply.id !== localData.reply.id,
                        );
                }
                return true;
            });
            localData.reply = null;
            toasts.info($("Reply deleted successfully"));
            modals.close(deleteModal);
        } catch (err) {
            toasts.error($("Something went wrong deleting this reply"));
        } finally {
        }
    }
    function onReplyCreateOrUpdate(mode, reply) {
        return () => {
            localData.reply = reply.id;
            localData.currentReplyContent = mode === "update" ? reply.content : null;
            localData.mode = mode;
        };
    }
    function onCancelReply() {
        localData.reply = null;
        localData.currentReplyContent = null;
        localData.mode = null;
    }
    return t.div(
        {
            onmount: getReplies,
            rid: localData.reply,
        },
        sort({
            data,
            onSortChange,
        }),
        () => {
            deleteModal = confirmationModal({
                onConfirm: onDeleteReply,
            });
            return deleteModal;
        },
        () => {
            if (localData.loading) {
                return t.span({}, $("Loading..."));
            }
            return t.div(
                {
                    className: "flex flex-col gap-md mt-md",
                    rid: JSON.stringify(localData.reply),
                },
                localData?.replies.map((reply) => {
                    return t.div(
                        {
                            className: "reply-block",
                            rid: `${localData.reply?.id}-${reply.id}`,
                        },
                        [
                            () =>
                                t.div(
                                    {
                                        className: "reply",
                                        id: `reply-${reply.id}`,
                                    },
                                    [
                                        recordMeta({
                                            author: reply?.expand?.user?.name,
                                            updated: reply?.updated,
                                            created: reply?.created,
                                        }),
                                        markdown(reply.content),
                                    ],
                                ),
                            () =>
                                reply?.expand?.replies_via_replyingTo?.map((subReply) =>
                                    t.div(
                                        {
                                            id: `reply-${subReply.id}`,
                                            className: "subreply",
                                            rid: `${localData.reply?.id}-${subReply.id}`,
                                        },
                                        [
                                            recordMeta({
                                                author: subReply?.expand?.user?.name,
                                                updated: subReply?.updated,
                                                created: subReply?.created,
                                            }),
                                            markdown(subReply.content),
                                            () =>
                                                replyActions({
                                                    isOwner:
                                                        app.pb.authStore.record.id ===
                                                        subReply.user,
                                                    onEdit: onReplyCreateOrUpdate(
                                                        "update",
                                                        subReply,
                                                    ),
                                                    onDelete: () => {
                                                        localData.reply = subReply;
                                                        localData.mode = "delete";
                                                        modals.open(deleteModal);
                                                    },
                                                }),
                                            () => {
                                                return replyForm({
                                                    id: "subreply-form",
                                                    show: localData.reply == subReply.id,
                                                    onSubmitReply,
                                                    reply,
                                                    value: localData.currentReplyContent,
                                                    fieldLabel:
                                                        localData.mode === "update"
                                                            ? $("Update reply")
                                                            : $("Reply"),
                                                    submitLabel:
                                                        localData.mode === "update"
                                                            ? $("Update")
                                                            : $("Submit"),
                                                    onCancel: onCancelReply,
                                                });
                                            },
                                        ],
                                    ),
                                ),
                            replyActions({
                                isOwner: app.pb.authStore.record.id === reply.user,
                                onReply: onReplyCreateOrUpdate("create", reply),
                                onEdit: onReplyCreateOrUpdate("update", reply),
                                onDelete: () => {
                                    localData.reply = reply;
                                    localData.mode = "delete";
                                    modals.open(deleteModal);
                                },
                            }),
                            () => {
                                return replyForm({
                                    id: "reply-form",
                                    show: localData.reply == reply.id,
                                    onSubmitReply,
                                    reply,
                                    value: localData.currentReplyContent,
                                    fieldLabel:
                                        localData.mode === "update"
                                            ? $("Update reply")
                                            : $("Reply"),
                                    submitLabel:
                                        localData.mode === "update"
                                            ? $("Update")
                                            : $("Submit"),
                                    onCancel: onCancelReply,
                                });
                            },
                        ],
                    );
                }),
            );
        },
        replyForm({
            id: "reply-form",
            show: true,
            onSubmitReply,
            reply: null,
        }),
    );
}
