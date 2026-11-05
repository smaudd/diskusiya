import { t } from "shablon";

export default function recordMeta({ author, created, updated }) {
    // TODO: include avatar when its implemented
    let d = new Date(created);
    const dUpdate = new Date(updated);
    if (d.getTime() < dUpdate.getTime()) {
        d = new Date(updated)
    }
    return t.div({ className: "flex gap-md" }, [
        t.span({}, () => author),
        t.span({}, "@"),
        t.span({}, () => `${d.toLocaleDateString()} - ${d.toLocaleTimeString()}`),
        created != updated ? t.span({ className: "bold" }, `(${app.$("edited")})`) : null,
    ]);
}
