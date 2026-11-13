import { t } from "shablon";
import { $ } from "../utils/i18n";
import { pb } from "../pb";
import options from "./options";

export default function replyActions({
    isOwner,
    onReply,
    onEdit,
    onDelete,
    onReport,
    deleted,
}) {
    let replyAction = null;
    if (deleted) {
        return null
    }
    if (pb.authStore.isValid && onReply && !deleted) {
        replyAction = t.button(
            {
                className: "btn transparent",
                onclick: onReply,
            },
            $("Reply"),
        );
    }

    const actions = [];
    if (isOwner) {
        if (onEdit && !deleted) {
            actions.push({
                attrs: {
                    onclick: onEdit,
                },
                value: $("Edit"),
            });
        }
        if (onDelete && !deleted) {
            actions.push({
                attrs: {
                    onclick: onDelete,
                },
                value: $("Delete"),
            });
        }
    }
    if (pb.authStore.isValid && onReport && !deleted && !isOwner) {
        actions.push({
            attrs: {
                onclick: onReport,
            },
            value: $("Report"),
        });
    }
    const opts = options({
        options: actions,
    });

    return t.div({ className: "reply-actions" }, [opts, replyAction]);
}
