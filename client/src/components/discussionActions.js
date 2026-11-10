import { t } from "shablon";
import { $ } from "../utils/i18n";
import { pb } from "../pb";
import options from "./options";

export default function discussionActions({
    isOwner,
    onEdit,
    onDelete,
    onReport,
    deleted,
}) {
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

    return t.div({ className: "flex gap-md justify-end" }, opts);
}
