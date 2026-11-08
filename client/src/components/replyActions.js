import { t } from "shablon";
import { $ } from "../utils/i18n";
import { pb } from "../pb";

export default function replyActions({ isOwner, onReply, onEdit, onDelete, deleted }) {
    let actions = [];
    if (pb.authStore.isValid && onReply && !deleted) {
        actions.push([
            t.button(
                {
                    className: "btn borderless",
                    onclick: onReply,
                },
                $("Reply"),
            ),
        ]);
    }
    if (isOwner) {
        if (onEdit && !deleted) {
            actions.push(
                t.button(
                    {
                        className: "btn borderless",
                        onclick: onEdit,
                    },
                    $("Edit"),
                ),
            );
        }
        if (onDelete && !deleted) {
            actions.push(
                t.button(
                    {
                        className: "btn borderless",
                        onclick: onDelete,
                    },
                    $("Delete"),
                ),
            );
        }
    }

    return t.div({ className: "flex gap-md justify-end" }, actions);
}
