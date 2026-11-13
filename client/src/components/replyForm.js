import { t } from "shablon";
import field from "./field";
import { $ } from "../utils/i18n";
import markdown from "./markdown";
import recordMeta from "./recordMeta";

export default function replyForm({
    id,
    onSubmitReply,
    onCancel,
    reply,
    submitLabel = $("Submit"),
    value = "",
}) {
    return t.form(
        {
            id: id,
            "html-data-replying-to": reply?.id || "",
            onsubmit: onSubmitReply,
            className: `reply-form ${reply?.id ? reply.id : ""}`,
            rid: `${value}-${submitLabel}-${reply?.id}`,
        },
        [
            () =>
                t.div({ className: "flex flex-col gap-md field" }, [
                    t.label({}, [
                        t.span({}, reply?.id ? $("Replying to") : $("Reply")),
                        reply
                            ? t.div(
                                  { className: "quote" },
                                  recordMeta({
                                      author: reply?.expand?.user,
                                      updated: reply?.created,
                                      created: reply?.updated,
                                  }),
                                  markdown(reply?.content.slice(0, 120)),
                              )
                            : "",
                        t.textarea({
                            id: "content",
                            name: "content",
                            required: true,
                            placeholder: $("Write your thoughts. Be mindful"),
                            value: value,
                            rows: 8,
                        }),
                    ]),
                ]),
            t.div({ className: "flex justify-end gap-sm" }, [
                onCancel && reply
                    ? t.button(
                          {
                              className: "btn transparent",
                              type: "button",
                              onclick: onCancel,
                          },
                          $("Cancel"),
                      )
                    : null,
                t.button({ className: "btn transparent", type: "submit" }, submitLabel),
            ]),
        ],
    );
}
