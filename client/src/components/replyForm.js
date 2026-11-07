import { t } from "shablon";
import field from "./field";
import { $ } from "../utils/i18n";

export default function replyForm({
    id,
    show,
    onSubmitReply,
    onCancel,
    reply,
    submitLabel = $("Submit"),
    fieldLabel = $("Reply"),
    value = "",
}) {
    if (show) {
        return t.form(
            {
                id: id,
                "html-data-replying-to": reply?.id || "",
                onsubmit: onSubmitReply,
                className: "reply-form",
                rid: `${value}-${submitLabel}`,
            },
            [
                () =>
                    t.div({ className: "flex flex-col gap-md" }, [
                        field(
                            {
                                label: fieldLabel,
                                id: "content",
                                name: "content",
                                required: true,
                                placeholder: $("Write your thoughts. Be mindful"),
                                value: value,
                            },
                            t.textarea,
                        ),
                    ]),
                t.div({ className: "flex gap-md justify-end" }, [
                    t.button(
                        { className: "btn borderless", type: "submit" },
                        submitLabel,
                    ),
                    onCancel
                        ? t.button(
                              {
                                  className: "btn borderless",
                                  type: "button",
                                  onclick: onCancel,
                              },
                              $("Cancel"),
                          )
                        : null,
                ]),
            ],
        );
    }
}
