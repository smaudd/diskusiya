import { t } from "shablon";
import { $ } from "../utils/i18n";
import { pb } from "../pb";

export default function replyActions({ isOwner, onReply, onEdit, onDelete }) {
    let actions = [];
    if (pb.authStore.isValid && onReply) {
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
        actions = [
            ...actions,
            t.button(
                {
                    className: "btn borderless",
                    onclick: onEdit,
                },
                $("Edit"),
            ),
            t.button(
                {
                    className: "btn borderless",
                    onclick: onDelete,
                },
                $("Delete"),
            ),
        ];
    }

    return t.div({ className: "flex gap-md justify-end" }, actions);
}
