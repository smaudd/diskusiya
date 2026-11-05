import { t } from "shablon";

export default function recordMeta({ author, date }) {
    const d = new Date(date);
    return (
        t.span({}, author),
        t.span({}, "@"),
        t.span({}, `${d.toLocaleDateString()} - ${d.toLocaleTimeString()}`)
    );
}
