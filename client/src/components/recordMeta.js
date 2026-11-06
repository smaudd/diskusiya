import { t } from "shablon";
import { $ } from "../utils/i18n"

export default function recordMeta({ author, created, updated }) {
    // TODO: include avatar when its implemented
    let d = new Date(created);
    const dUpdate = new Date(updated);
    if (d.getTime() < dUpdate.getTime()) {
        d = new Date(updated)
    }
    return t.div({ className: "record-meta" }, [
        t.span({ className: "bold" }, () => author),
        t.span({}, () => `${d.toLocaleDateString()} - ${d.toLocaleTimeString()}`),
        created != updated ? t.span({ className: "bold" }, `(${$("edited")})`) : null,
    ]);
}
