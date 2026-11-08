import { t } from "shablon";
import { $ } from "../utils/i18n";
import { pb } from "../pb";

function formatDate(date) {
    return `${date.toLocaleDateString().slice(0, 5)}@${date.toLocaleTimeString().slice(0, 5)}`
}

export default function recordMeta({ author, created, updated }) {
    if (!author) {
        return null
    }
    let d = new Date(created);
    const dUpdate = new Date(updated);
    if (d.getTime() < dUpdate.getTime()) {
        d = new Date(updated);
    }
    return t.div({ className: "record-meta" }, [
        t.div({ className: "flex gap-md items-center" }, [
            t.img({
                src: pb.files.getURL(author, author?.avatar, {
                    thumb: "100x250",
                }),
            }),
            t.span({ className: "bold" }, () => author?.name),
        ]),
        t.div({ className: "flex gap-md items-center" }, [
            created != updated ? t.span({ className: "text-xs bold" }, `(${$("edited")})`) : null,
            t.span({ className: "italic" }, () => formatDate(d)),
        ]),
    ]);
}
