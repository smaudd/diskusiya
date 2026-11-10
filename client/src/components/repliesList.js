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
import replyBlock from "./replyBlock";
import reportModal from "./reportModal";
import reportContent from "../services/collections/reports";

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
            return [data.focus, data.mode];
        },
        () => {
            // focus
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

            // check reports
            if (data.mode === "report") {
                modals.open(reportModalRef);
                reportModalRef.onafterclose = clearReportModal;
            }
        },
    );

    let reportModalRef;

    function clearReportModal() {
        data.reply = null;
        data.mode = null;
    }

    function onSubmitReport(e) {
        e.preventDefault();
        const [{ value: reason }, { checked: block }] = e.target.elements;
        reportContent({
            reply: data.reply.id,
            reason,
            user: data.reply.expand.user,
            reporter: pb.authStore.record.id,
            block,
        });
        clearReportModal();
    }

    return t.div(
        {
            onmount: async () => {
                data.replies = await getReplies({ data });
            },
            rid: discussionId,
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
            if (data.reply && data.mode === "report") {
                reportModalRef = reportModal({
                    id: "reply-report-modal",
                    onSubmitReport,
                    record: data.reply,
                    onClose: () => {
                        data.reply = null;
                        data.mode = null;
                    },
                });
                return reportModalRef;
            }
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
                            replyBlock({ reply, className: "reply" }),
                            reply?.expand?.replies_via_replyingTo?.map((subreply) =>
                                t.div(
                                    {},
                                    replyBlock(
                                        {
                                            reply: subreply,
                                            className: "reply subreply",
                                        },
                                        [
                                            replyActions({
                                                isOwner:
                                                    pb?.authStore?.record?.id ===
                                                    subreply?.user,
                                                onEdit: onReplyCreateOrUpdate(
                                                    "update",
                                                    subreply,
                                                ),
                                                onReport: () => {
                                                    data.reply = subreply;
                                                    data.mode = "report";
                                                },
                                                onDelete: () => {
                                                    data.reply = subreply;
                                                    data.mode = "delete";
                                                    modals.open(deleteModal);
                                                },
                                                deleted: subreply.deleted,
                                            }),
                                            replyForm({
                                                id: "subreply-form",
                                                show:
                                                    data.reply?.id === subreply?.id &&
                                                    ["update", "create"].includes(
                                                        data.mode,
                                                    ),
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
                                onReport: () => {
                                    data.reply = reply;
                                    data.mode = "report";
                                },
                                deleted: reply.deleted,
                            }),
                            () => {
                                return replyForm({
                                    id: "reply-form",
                                    show:
                                        data.reply?.id == reply.id &&
                                        ["update", "create"].includes(data.mode),
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
