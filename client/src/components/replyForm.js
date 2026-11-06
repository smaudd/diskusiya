import { t } from "shablon";
import field from "./field";
import { $ } from "../utils/i18n"

export default function replyForm({ id, show, onSubmitReply, reply }) {
    if (show) {
        return t.form(
            {
                id: id,
                "html-data-replying-to": reply?.id || "",
                onsubmit: onSubmitReply,
                className: "reply-form"
            },
            [
                t.div({ className: "flex flex-col gap-md" }, [
                    field(
                        {
                            label: $("Comment"),
                            id: "content",
                            name: "content",
                            required: true,
                            placeholder: $("Write your thoughts. Be mindful"),
                            value: "",
                        },
                        t.textarea,
                    ),
                ]),
                t.button({ className: "btn", type: "submit" }, $("Submit")),
            ],
        );
    }
}
