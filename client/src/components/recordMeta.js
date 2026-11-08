import { t } from "shablon";
import { $ } from "../utils/i18n";
import { pb } from "../pb";

export default function recordMeta({ author, created, updated }) {
    let d = new Date(created);
    const dUpdate = new Date(updated);
    if (d.getTime() < dUpdate.getTime()) {
        d = new Date(updated);
    }
    return t.div({ className: "record-meta" }, [
        t.div({ className: "flex gap-md items-center" }, [
            t.img({
                src: pb.files.getURL(author, author.avatar, {
                    thumb: "100x250",
                }),
            }),
            t.span({ className: "bold" }, () => author.name),
        ]),
        t.div({ className: "flex gap-md" }, [
            created != updated ? t.span({ className: "bold" }, `(${$("edited")})`) : null,
            t.span({}, () => `${d.toLocaleDateString()} - ${d.toLocaleTimeString()}`),
        ]),
    ]);
}
