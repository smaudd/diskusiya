import { t, store } from "shablon";
import field from "./field";

export default function discussionModal({
    title = app.$("Create discussion"),
    onSubmitDiscussion,
    values,
}) {
    const data = store({
        loading: false,
    });
    return t.div(
        {
            className: "modal",
        },
        t.header({ className: "modal-header" }, title),
        t.div(
            { className: "modal-content" },
            t.form(
                {
                    id: "discussion-form",
                    onsubmit: async (e) => {
                        data.loading = true;
                        await onSubmitDiscussion(e);
                        data.loading = false;
                    },
                },
                [
                    t.div({ className: "flex flex-col gap-md" }, [
                        field(
                            {
                                label: app.$("Title"),
                                id: "title",
                                name: "title",
                                required: true,
                                placeholder: app.$("Title"),
                                value: values?.title,
                            },
                            t.input,
                        ),
                        field(
                            {
                                label: app.$("Content"),
                                id: "content",
                                name: "content",
                                required: true,
                                placeholder: app.$("Content"),
                                value: values?.content,
                            },
                            t.textarea,
                        ),
                    ]),
                ],
            ),
        ),
        t.footer({ className: "modal-footer" }, [
            t.button(
                // TODO: Not sure how this usage works here but it does
                { className: "btn borderless", onclick: () => app.modals.close(this) },
                app.$("Cancel"),
            ),
            t.button({ className: "btn", "html-form": "discussion-form" }, () =>
                data.loading ? app.$("Loading...") : app.$("Save"),
            ),
        ]),
    );
}
