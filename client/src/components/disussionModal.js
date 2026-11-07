import { t, store } from "shablon";
import { $ } from "../utils/i18n"
import field from "./field";
import modals from "../components/modal"

export default function discussionModal({
    title = $("Create discussion"),
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
                                label: $("Title"),
                                id: "title",
                                name: "title",
                                required: true,
                                placeholder: $("Title"),
                                value: values?.title,
                            },
                            t.input,
                        ),
                        field(
                            {
                                label: $("Content"),
                                id: "content",
                                name: "content",
                                required: true,
                                placeholder: $("Content"),
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
                { className: "btn borderless", onclick: () => modals.close(this) },
                $("Cancel"),
            ),
            t.button({ className: "btn", "html-form": "discussion-form" }, () =>
                data.loading ? $("Loading...") : $("Save"),
            ),
        ]),
    );
}
