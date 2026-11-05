import { t } from "shablon";

export default function discussionModal({ onSubmitDiscussion }) {
    return t.div(
        {
            className: "modal",
        },
        t.header({ className: "modal-header" }, app.$("Create discussion")),
        t.div(
            { className: "modal-content" },
            t.form({ id: "discussion-form", onsubmit: onSubmitDiscussion }, [
                t.div({ className: "flex flex-col gap-md" }, [
                    t.div(
                        { className: "field" },
                        t.label({ for: "title" }, app.$("Title")),
                        t.input({
                            id: "title",
                            name: "title",
                            required: true,
                            placeholder: app.$("Title"),
                        }),
                    ),
                    t.div(
                        { className: "field" },
                        t.label({ for: "content" }, app.$("Content")),
                        t.textarea({
                            id: "content",
                            name: "content",
                            required: true,
                            placeholder: app.$("Content"),
                        }),
                    ),
                ]),
            ]),
        ),
        t.footer({ className: "modal-footer" }, [
            t.button(
                // TODO: Not sure how this usage works here but it does
                { className: "btn borderless", onclick: () => app.modals.close(this) },
                app.$("Cancel"),
            ),
            t.button({ className: "btn", "html-form": "discussion-form" }, app.$("Save")),
        ]),
    );
}
