import { t, store, watch } from "shablon";
import recordMeta from "./recordMeta";
import sort from "./sort";
import replyActions from "./replyActions";
import replyForm from "./replyForm";
import markdown from "./markdown";
import { navigate } from "../utils/navigation";
import { $ } from "../utils/i18n";
import modals from "./modal";
import confirmationModal from "./confirmationModal";
import {
    createOrUpdateReply,
    deleteReply,
    getReplies,
} from "../services/collections/replies";
import { pb } from "../pb";
import toast from "./toast";

// TODO: Add pagination to replies
export default function replyList({ discussionId }) {
    let deleteModal = null;
    const searchParams = new URLSearchParams(location.search);
    const data = store({
        reply: null,
        replies: [],
        loading: false,
        focus: searchParams.get("focus"),
        currentReplyContent: "",
        mode: null,
        discussionId: discussionId,
        sort: searchParams.get("sort"),
    });
    async function onSortChange(e) {
        data.sort = e.target.value;
        data.replies = await getReplies({ data });
    }
    function onReplyCreateOrUpdate(mode, reply) {
        return () => {
            if (data.reply && mode === data.mode && reply.id === data.reply.id) {
                data.reply = null;
                data.currentReplyContent = null;
                data.mode = null;
                return;
            }
            data.reply = reply;
            data.currentReplyContent = mode === "update" ? reply.content : null;
            data.mode = mode;
        };
    }
    function onCancelReply() {
        data.reply = null;
        data.currentReplyContent = null;
        data.mode = null;
    }
    async function onSubmitReply(e) {
        if (!pb.authStore?.isValid) {
            toast.info("Login to be part of the conversation");
            navigate("/login");
            return;
        }
        const { replies, id } = await createOrUpdateReply({
            data,
            event: e,
        });
        data.replies = replies;
        data.focus = id;
        data.reply = null;
        data.currentReplyContent = null;
    }
    watch(
        () => {
            data.focus;
        },
        () => {
            // get latest reply
            setTimeout(() => {
                if (data.focus) {
                    const el = document.getElementById(`reply-${data.focus}`);
                    el.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
                data.focus = null;
            });
        },
    );

    function replyBlock({ reply, className }, children) {
        return t.div(
            {
                className: className,
                id: `reply-${reply.id}`,
            },
            [
                reply.deleted
                    ? t.span(
                          {
                              className: "text-xs font-italic",
                          },
                          $("deleted"),
                      )
                    : recordMeta({
                          author: reply?.expand?.user,
                          updated: reply?.updated,
                          created: reply?.created,
                      }),
                markdown(reply.content),
            ],
            children,
        );
    }

    return t.div(
        {
            onmount: async () => {
                data.replies = await getReplies({ data });
            },
            rid: discussionId
        },
        sort({
            data,
            onSortChange,
        }),
        () => {
            deleteModal = confirmationModal({
                onConfirm: async () => {
                    data.reply = await deleteReply({ data });
                    modals.close(deleteModal);
                },
            });
            return deleteModal;
        },
        () => {
            if (data.loading) {
                return t.span({}, $("Loading..."));
            }
            return t.div(
                {
                    className: "flex flex-col gap-md mt-md",
                },
                data?.replies?.map((reply) =>
                    t.div(
                        {
                            className: "reply-block",
                            rid: JSON.stringify(reply),
                        },
                        [
                            () => replyBlock({ reply, className: "reply" }),
                            () =>
                                reply?.expand?.replies_via_replyingTo?.map((subReply) =>
                                    t.div(
                                        {},
                                        replyBlock(
                                            {
                                                reply: subReply,
                                                className: "reply subreply",
                                            },
                                            [
                                                replyActions({
                                                    isOwner:
                                                        pb?.authStore?.record?.id ===
                                                        subReply.user,
                                                    onEdit: onReplyCreateOrUpdate(
                                                        "update",
                                                        subReply,
                                                    ),
                                                    onDelete: () => {
                                                        data.reply = subReply;
                                                        data.mode = "delete";
                                                        modals.open(deleteModal);
                                                    },
                                                }),
                                                replyForm({
                                                    id: "subreply-form",
                                                    show: data.reply?.id === subReply.id,
                                                    onSubmitReply,
                                                    reply,
                                                    value: data.currentReplyContent,
                                                    fieldLabel:
                                                        data.mode === "update"
                                                            ? $("Update reply")
                                                            : $("Reply"),
                                                    submitLabel:
                                                        data.mode === "update"
                                                            ? $("Update")
                                                            : $("Submit"),
                                                    onCancel: onCancelReply,
                                                }),
                                            ],
                                        ),
                                    ),
                                ),
                            replyActions({
                                isOwner: pb.authStore?.record?.id === reply.user,
                                onReply: onReplyCreateOrUpdate("create", reply),
                                onEdit: onReplyCreateOrUpdate("update", reply),
                                onDelete: () => {
                                    data.reply = reply;
                                    data.mode = "delete";
                                    modals.open(deleteModal);
                                },
                            }),
                            () => {
                                return replyForm({
                                    id: "reply-form",
                                    show: data.reply?.id == reply.id,
                                    onSubmitReply,
                                    reply,
                                    value: data.currentReplyContent,
                                    fieldLabel:
                                        data.mode === "update"
                                            ? $("Update reply")
                                            : $("Reply"),
                                    submitLabel:
                                        data.mode === "update"
                                            ? $("Update")
                                            : $("Submit"),
                                    onCancel: onCancelReply,
                                });
                            },
                        ],
                    ),
                ),
            );
        },
        () => {
            if (!data.loading) {
                return replyForm({
                    id: "reply-form",
                    show: true,
                    onSubmitReply,
                    reply: null,
                });
            }
        },
    );
}
