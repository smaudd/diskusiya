import { t } from "shablon";
import { $ } from "../utils/i18n";
import recordMeta from "./recordMeta";
import markdown from "./markdown";
import field from "./field";
import replyActions from "./replyActions";
import { modes } from "./repliesList";

export default function replyBlock(
    { reply, className, onSubmitEdit, data, onReply, onEdit, onDelete, onReport },
    children,
) {
    let blocks = [
        recordMeta({
            author: reply?.expand?.user,
            updated: reply?.updated,
            created: reply?.created,
        }),
        reply?.replyingToDeleted
            ? t.div({ className: "quote" }, [t.span({}, $("This reply was deleted"))])
            : null,
        reply?.replyingTo
            ? t.div({ className: "quote" }, [
                  recordMeta({
                      author: reply?.expand?.replyingTo.expand.user,
                      updated: reply?.expand.replyingTo.created,
                      created: reply?.expand.replyingTo.updated,
                  }),
                  t.div({}, markdown(reply.expand.replyingTo.content)),
              ])
            : "",
        () =>
            data.mode === modes.edit && data.reply.id === reply.id
                ? t.form({ id: `edit-reply-${reply.id}`, onsubmit: onSubmitEdit }, [
                      field(
                          {
                              label: $("Edit reply"),
                              value: reply.content,
                              className: "mt-md",
                              name: `edit-reply-${reply.id}-textarea`,
                              id: `edit-reply-${reply.id}-textarea`,
                          },
                          t.textarea,
                      ),
                  ])
                : markdown(reply.content),
    ];
    if (reply.deleted) {
        blocks = t.div({ className: "flex flex-col gap-md" }, [
            t.span(
                {
                    className: "font-italic bold",
                },
                `(${$("deleted")})`,
            ),
            t.span(
                {
                    className: "text-xs font-italic bold",
                },
                $("deleted"),
            ),
        ]);
    }
    return t.div(
        {
            className: className,
            id: `reply-${reply.id}`,
        },
        blocks,
        () => {
            if (data.mode === modes.edit && data.reply?.id === reply.id) {
                return t.div({ className: "reply-actions" }, [
                    t.button(
                        {
                            className: "btn",
                            onclick: () => {
                                data.reply = null;
                                data.mode = null;
                            },
                        },
                        $("Cancel"),
                    ),
                    t.button(
                        {
                            className: "btn",
                            type: "submit",
                            "html-form": `edit-reply-${data.reply.id}`,
                        },
                        $("Save"),
                    ),
                ]);
            }
            return replyActions({
                isOwner: pb.authStore?.record?.id === reply.user,
                onReply,
                onEdit,
                onDelete,
                onReport,
                deleted: reply.deleted,
            });
        },
        children,
    );
}
