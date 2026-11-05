import { t, store } from "shablon";
import layout from "../components/layout";
import recordMeta from "../components/recordMeta";
import loader from "../components/loader";
import notfound from "../components/notfound";
import discussionModal from "../components/disussionModal";
import logger from "../services/logger";
import slugify from "../utils/slugify";
import randomString from "../utils/randomString";
import confirmationModal from "../components/confirmationModal";

export default function discussion(route) {
    const data = store({
        discussion: null,
        loading: false,
        notfound: false,
        isOwner: false,
        modal: discussionModal({
            title: app.$("Update discussion"),
            onSubmitDiscussion,
            values: {
                title: "",
                content: "",
            },
        }),
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
            data.modal = discussionModal({
                title: app.$("Update discussion"),
                onSubmitDiscussion,
                values: {
                    title: data.discussion.title,
                    content: data.discussion.content,
                },
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
            app.toasts.error(app.$("Something went wrong getting this discussion"));
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
                app.navigate(`/d/${item.slug}`);
            }
            app.toasts.info(app.$("Discussion updated successfully"));
        } catch (err) {
            logger(err, "error");
            app.toasts.error(app.$("Something went wrong updating the discussion"));
        } finally {
            app.modals.close(data.modal);
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
            app.navigate(`/`);
            app.cache.flushAll();
        } catch (err) {
            app.toasts.error(app.$("Something went wrong deleting this discussion"));
        } finally {
            app.toasts.info(app.$("Discussion deleted successfully"));
        }
    }

    const confirm = confirmationModal({
        onConfirm: onDeleteDiscussion,
    });

    return layout(
        t.div(
            {
                onmount: () => {
                    getDiscussion();
                },
            },
            [
                () => confirm,
                () => data.modal,
                () => {
                    if (data.loading) {
                        return loader();
                    }
                    if (data.notfound) {
                        return notfound();
                    }
                    return [
                        recordMeta({
                            author: data.discussion?.expand?.user?.name,
                            updated: data.discussion?.updated,
                            created: data.discussion?.created,
                        }),
                        t.h1({}, () => data?.discussion?.title),
                        t.p({}, () => data?.discussion?.content),
                    ];
                },
                () =>
                    data.isOwner
                        ? t.div({ className: "flex gap-md" }, [
                              t.button(
                                  {
                                      className: "btn",
                                      onclick: () => {
                                          app.modals.open(data.modal);
                                      },
                                  },
                                  app.$("Edit"),
                              ),
                              t.button(
                                  {
                                      className: "btn",
                                      onclick: () => {
                                          app.modals.open(confirm);
                                      },
                                  },
                                  app.$("Delete"),
                              ),
                          ])
                        : null,
            ],
        ),
    );
}
