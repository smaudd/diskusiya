import { t, store, watch } from "shablon";
import sort from "./sort";
import replyActions from "./replyActions";
import replyForm from "./replyForm";
import { navigate, navigateQueryParam } from "../utils/navigation";
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
import pagination from "./pagination";

export const modes = {
    edit: "edit",
    delete: "delete",
    report: "report",
};

// TODO: Add pagination to replies
export default function replyList({ metaTitle, route, discussionId }, actions) {
    let deleteModalRef = null;
    let reportModalRef = null;
    const searchParams = new URLSearchParams(location.search);
    const data = store({
        reply: null,
        replies: [],
        loading: false,
        focus: searchParams.get("focus"),
        mode: null,
        discussionId: discussionId,
        sort: searchParams.get("sort") || "created",
        page: +searchParams.get("page") || 1,
        limit: 3,
    });

    async function onSortChange(e) {
        navigateQueryParam([
            {
                name: "sort",
                value: e.target.value,
            },
            {
                name: "page",
                value: data.page,
            },
        ]);
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
            mode: data.mode,
        });
        data.focus = id;
        data.reply = null;
        data.mode = null;
        data.replies = replies;
    }
    watch(
        () => {
            return [data.focus, data.mode, data.reply];
        },
        () => {
            // focus
            setTimeout(() => {
                if (data.mode === modes.reply) {
                    const el = document.getElementById("reply-form");
                    el.querySelector("textarea").focus();
                }
            });

            // check reports
            if (data.mode === modes.report) {
                modals.open(reportModalRef);
                reportModalRef.onafterclose = clearReportModal;
            }
        },
    );

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

    function setMode(mode, reply) {
        data.mode = mode;
        data.reply = reply;
        if (mode === modes.report) {
            modals.open(reportModalRef);
        }
        if (mode === modes.delete) {
            modals.open(deleteModalRef);
        }
    }

    async function onMount({ showLastPage } = {}) {
        const res = await getReplies({ data });
        if (showLastPage) {
            navigateQueryParam([
                {
                    name: "page",
                    value: res.totalPages,
                },
                {
                    name: "sort",
                    value: data.sort,
                },
            ]);
            return;
        }
        if (res.totalPages < data.page && res.totalPages) {
            navigateQueryParam([
                {
                    name: "page",
                    value: 1,
                },
            ]);
            return;
        }
        data.replies = res.replies;
        data.totalPages = res.totalPages;
        data.totalItems = res.totalItems;
    }
    return t.div(
        {
            onmount: onMount,
            rid: discussionId,
        },
        t.div({ className: "replies-list-actions" }, [
            t.span({}, $("Replies")),
            t.div(
                {
                    className: "flex gap-sm",
                },
                [
                    sort({
                        data,
                        onSortChange,
                    }),
                    actions,
                ],
            ),
        ]),
        () => {
            deleteModalRef = confirmationModal({
                onConfirm: async () => {
                    data.reply = await deleteReply({ data });
                    modals.close(deleteModalRef);
                    onMount();
                },
            });
            return deleteModalRef;
        },
        () => {
            if (data.reply && data.mode === modes.report) {
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
            if (data.replies.length === 0) {
                return t.div({ className: "empty-results" }, $("Be the first one to join this conversation"));
            }
            return t.div(
                {
                    className: "flex flex-col gap-md mt-md",
                    rid: `list-${data.replies.length}`,
                },
                data?.replies?.map((reply) =>
                    t.div(
                        {
                            className: "reply-block",
                            rid: `never`,
                        },
                        replyBlock({
                            reply,
                            data,
                            className: "reply",
                            onSubmitEdit: onSubmitReply,
                            onReply: () => setMode(modes.reply, reply),
                            onEdit: () => setMode(modes.edit, reply),
                            onDelete: () => setMode(modes.delete, reply),
                            onReport: () => setMode(modes.report, reply),
                        }),
                    ),
                ),
            );
        },
        () =>
            replyForm({
                id: "reply-form",
                onSubmitReply,
                onCancel: onCancelReply,
                reply: Object.keys(modes).includes(data.mode) ? null : data.reply,
            }),
        () =>
            pagination({
                metaTitle,
                data,
                collection: `d/${route.params.slug}`,
            }),
    );
}
