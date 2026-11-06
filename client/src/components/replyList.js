import { t, store, watch } from "shablon";
import recordMeta from "./recordMeta";
import sort from "./sort";
import replyActions from "./replyActions";
import replyForm from "./replyForm";
import markdown from "./markdown";
import { navigateQueryParam } from "../utils/navigation";
import { $ } from "../utils/i18n"
import toasts from "../components/toast"

export default function replyList({ data }) {
    const searchParams = new URLSearchParams(location.search);
    const localData = store({
        reply: null,
        replies: [],
        loading: false,
        focus: searchParams.get("focus"),
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
    watch(
        () => [localData.focus],
        () => {
            // it seems watcher runs after elements are available in the DOM. This doens't feel ok but it seems to work
            setTimeout(() => {
                if (localData.focus) {
                    const el = document.getElementById(localData.focus);
                    if (el) {
                        el.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        });
                        el.classList.add("focus");
                        setTimeout(() => {
                            el.classList.remove("focus");
                        }, 2000);
                    }
                }
            });
        },
    );
    return t.div(
        {
            onmount: getReplies,
            rid: localData.replies.length,
        },
        sort({
            data,
            onSortChange,
        }),
        () => {
            if (localData.loading) {
                return t.span({}, $("Loading..."));
            }
            return t.div(
                { className: "flex flex-col gap-md mt-md" },
                localData?.replies.map((reply) => {
                    return t.div({ className: "reply-block" }, [
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
                        () => {
                            if (!reply.expand.replies_via_replyingTo) {
                                return;
                            }
                            return reply.expand.replies_via_replyingTo.map((subReply) => {
                                return t.div(
                                    {
                                        id: `reply-${subReply.id}`,
                                        className: "subreply",
                                    },
                                    [
                                        recordMeta({
                                            author: subReply?.expand?.user?.name,
                                            updated: subReply?.updated,
                                            created: subReply?.created,
                                        }),
                                        markdown(subReply.content),
                                    ],
                                );
                            });
                        },
                        replyActions({
                            isOwner: app.pb.authStore.record.id === reply.user,
                            onReply: () => {
                                if (localData.reply === reply.id) {
                                    localData.reply = null;
                                    return;
                                }
                                localData.reply = reply.id;
                            },
                            onEdit: () => {},
                            onDelete: () => {},
                        }),
                        replyForm({
                            id: "subreply-form",
                            show: localData.reply == reply.id,
                            onSubmitReply,
                            reply,
                        }),
                    ]);
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
