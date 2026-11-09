import { t } from "shablon";
import { $ } from "../utils/i18n";
import { pb } from "../pb";
import options from "./options";

export default function replyActions({ isOwner, onReply, onEdit, onDelete, deleted }) {
    let replyAction = null;
    if (pb.authStore.isValid && onReply && !deleted) {
        replyAction = t.button(
            {
                className: "btn borderless",
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
    const opts = options({
        options: actions,
    });

    return t.div({ className: "flex gap-md justify-end" }, [replyAction, opts]);
}
