import { t, store } from "shablon";
import { $ } from "../utils/i18n";
import layout from "../components/layout";
import recordMeta from "../components/recordMeta";
import loader from "../components/loader";
import notfound from "../components/notfound";
import discussionModal from "../components/disussionModal";
import logger from "../services/logger";
import slugify from "../utils/slugify";
import randomString from "../utils/randomString";
import confirmationModal from "../components/confirmationModal";
import replyList from "../components/replyList";
import markdown from "../components/markdown";
import { navigate } from "../utils/navigation";
import toasts from "../components/toast";
import modals from "../components/modal";

export default function discussion(route) {
    const searchParams = new URLSearchParams(location.search);
    let updateModal = null;
    let deleteModal = null;
    const data = store({
        discussion: null,
        replies: [],
        loading: false,
        notfound: false,
        isOwner: false,
        sort: searchParams.get("sort") || "-updated",
    });

    async function getDiscussion() {
        data.loading = true;
        try {
            const filter = app.pb.filter("slug = {:slug}", {
                slug: route.params.slug,
            });
            data.discussion = await app.pb
                .collection("discussions")
                .getFirstListItem(filter, {
                    expand: "user",
                });

            if (data.discussion.expand.user.id === app.pb.authStore.record.id) {
                data.isOwner = true;
            }
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

    async function onSubmitDiscussion(e) {
        // this isn't necessary but this function shouldn't even try if user isnt the owner
        if (!data.isOwner) {
            return;
        }
        e.preventDefault();
        const [{ value: title }, { value: content }] = e.target.elements;
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
            const item = await app.pb
                .collection("discussions")
                .update(data.discussion.id, updates);
            data.discussion = item;
            if (shouldRedirect) {
                navigate(`/d/${item.slug}`);
            }
            toasts.info($("Discussion updated successfully"));
        } catch (err) {
            logger(err, "error");
            toasts.error($("Something went wrong updating the discussion"));
        } finally {
            modals.close(data.editModal);
            app.cache.flushAll();
        }
    }

    async function onDeleteDiscussion() {
        // this isn't necessary but this function shouldn't even try if user isnt the owner
        if (!data.isOwner) {
            return;
        }
        try {
            await app.pb.collection("discussions").delete(data.discussion.id);
            navigate(`/`);
            app.cache.flushAll();
        } catch (err) {
            toasts.error($("Something went wrong deleting this discussion"));
        } finally {
            toasts.info($("Discussion deleted successfully"));
        }
    }

    return layout(
        t.div(
            {
                onmount: () => {
                    getDiscussion();
                },
                rid: data.discussion?.id,
                className: "flex flex-col gap-xl",
            },
            [
                () => {
                    if (data.discussion?.id && data.isOwner) {
                        updateModal = discussionModal({
                            title: $("Update discussion"),
                            onSubmitDiscussion,
                            values: {
                                title: data.discussion.title,
                                content: data.discussion.content,
                            },
                        });
                        deleteModal = confirmationModal({
                            onConfirm: onDeleteDiscussion,
                        });
                        return [updateModal, deleteModal];
                    }
                },
                () => {
                    if (data.loading) {
                        return loader();
                    }
                    if (data.notfound) {
                        return notfound();
                    }
                    return [
                        t.div({ className: "flex gap-md justify-between" }, [
                            t.h1({}, () => data?.discussion?.title),
                            t.div({ className: "flex gap-md" }, [
                                () => {
                                    if (data.isOwner) {
                                        return [
                                            t.button(
                                                {
                                                    className: "btn",
                                                    onclick: () => {
                                                        modals.open(updateModal);
                                                    },
                                                },
                                                $("Edit"),
                                            ),
                                            t.button(
                                                {
                                                    className: "btn",
                                                    onclick: () => {
                                                        modals.open(deleteModal);
                                                    },
                                                },
                                                $("Delete"),
                                            ),
                                        ];
                                    }
                                },
                            ]),
                        ]),
                        markdown(data?.discussion?.content),
                        recordMeta({
                            author: data.discussion?.expand?.user?.name,
                            updated: data.discussion?.updated,
                            created: data.discussion?.created,
                        }),
                    ];
                },
                () => {
                    if (data.discussion?.id) {
                        return replyList({ data });
                    }
                },
            ],
        ),
    );
}
