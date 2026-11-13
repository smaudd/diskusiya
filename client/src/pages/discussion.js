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
import discussionActions from "../components/discussionActions";
import reportModal from "../components/reportModal";
import reportContent from "../services/collections/reports";

export default function discussion(route) {
    let updateModalRef = null;
    let deleteModalRef = null;
    let reportModalRef = null;
    const data = store({
        discussion: null,
        replies: [],
        loading: false,
        notfound: false,
        isOwner: false,
    });

    function onSubmitReport(e) {
        e.preventDefault();
        const [{ value: reason }, { checked: block }] = e.target.elements;
        reportContent({
            discussion: data.discussion.id,
            reason,
            user: data.reply.expand.user,
            reporter: pb.authStore.record.id,
            block,
        });
    }

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
                className: "flex flex-col gap-md",
            },
            [
                () => {
                    if (data.discussion?.id) {
                        if (data.isOwner) {
                            updateModalRef = discussionModal({
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
                            deleteModalRef = confirmationModal({
                                onConfirm: () => deleteDiscussion({ data }),
                            });
                        }
                        reportModalRef = reportModal({
                            id: "discussion-report-modal",
                            onSubmitReport,
                            record: data.discussion,
                        });
                        return [updateModalRef, deleteModalRef, reportModalRef];
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
                        t.div({ className: "content-container" }, [
                            recordMeta({
                                author: data.discussion?.expand?.user,
                                updated: data.discussion?.updated,
                                created: data.discussion?.created,
                            }),
                            t.div({ className: "discussions-header" }, [
                                t.h1({}, () => data?.discussion?.title),
                            ]),
                            markdown(data?.discussion?.content),
                        ]),
                    ];
                },
                () => {
                    if (data.discussion?.id) {
                        return replyList(
                            {
                                discussionId: data.discussion.id,
                                route,
                                metaTitle: data?.discussion?.title,
                            },
                            discussionActions({
                                isOwner: data.isOwner,
                                deleted: false,
                                onEdit: () => modals.open(updateModalRef),
                                onDelete: () => modals.open(deleteModalRef),
                                onReport: () => modals.open(reportModalRef),
                            }),
                        );
                    }
                },
            ],
        ),
    );
}
