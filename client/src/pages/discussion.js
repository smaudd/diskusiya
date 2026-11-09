import { t, store } from "shablon";
import { $ } from "../utils/i18n";
import layout from "../components/layout";
import recordMeta from "../components/recordMeta";
import loader from "../components/loader";
import notfound from "../components/notfound";
import discussionModal from "../components/disussionModal";
import confirmationModal from "../components/confirmationModal";
import replyList from "../components/repliesList";
import markdown from "../components/markdown";
import modals from "../components/modal";
import {
    deleteDiscussion,
    updateDiscussion,
    getDiscussion,
} from "../services/collections/discussions";
import { pb } from "../pb";
import meta from "../services/meta";

export default function discussion(route) {
    let updateModal = null;
    let deleteModal = null;
    const data = store({
        discussion: null,
        replies: [],
        loading: false,
        notfound: false,
        isOwner: false,
    });

    return layout(
        t.div(
            {
                onmount: async () => {
                    data.discussion = await getDiscussion({ data, route });
                    if (data?.discussion?.expand.user.id === pb?.authStore?.record?.id) {
                        data.isOwner = true;
                    }
                    meta({ title: data.discussion?.title });
                },
                rid: data.discussion?.slug,
                className: "flex flex-col gap-xl mt-xl",
            },
            [
                () => {
                    if (data.discussion?.id && data.isOwner) {
                        updateModal = discussionModal({
                            title: $("Update discussion"),
                            onSubmitDiscussion: async (e) => {
                                data.discussion = await updateDiscussion({
                                    data,
                                    event: e,
                                });
                            },
                            values: {
                                title: data.discussion.title,
                                content: data.discussion.content,
                            },
                        });
                        deleteModal = confirmationModal({
                            onConfirm: () => deleteDiscussion({ data }),
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
                        t.div({ className: "discussions-header" }, [
                            t.h1({}, () => data?.discussion?.title),
                        ]),
                        markdown(data?.discussion?.content),
                        recordMeta({
                            author: data.discussion?.expand?.user,
                            updated: data.discussion?.updated,
                            created: data.discussion?.created,
                        }),
                        t.div({ className: "flex gap-md justify-end" }, [
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
                    ];
                },
                () => {
                    if (data.discussion?.id) {
                        return replyList({ discussionId: data.discussion.id });
                    }
                },
            ],
        ),
    );
}
