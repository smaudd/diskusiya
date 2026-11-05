import { t } from "shablon";

export default function recordMeta({ author, date }) {
    // TODO: include avatar when its implemented 
    const d = new Date(date);
    return t.div({ className: "flex gap-md" }, [
        t.span({}, () => author),
        t.span({}, "@"),
        t.span({}, () => `${d.toLocaleDateString()} - ${d.toLocaleTimeString()}`),
    ]);
}
