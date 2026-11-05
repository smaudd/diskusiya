import { t } from "shablon";

export default function recordMeta({ author, created, updated }) {
    // TODO: include avatar when its implemented
    const d = new Date(created);
    return t.div({ className: "flex gap-md" }, [
        t.span({}, () => author),
        t.span({}, "@"),
        t.span({}, () => `${d.toLocaleDateString()} - ${d.toLocaleTimeString()}`),
        created != updated ? t.span({ className: "bold" }, `(${app.$("edited")})`) : null,
    ]);
}
