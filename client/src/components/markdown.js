import { t } from "shablon";
import renderMarkdown from "../utils/markdown";

export default function markdown(content) {
    return t.div({ className: "content", innerHTML: renderMarkdown(content) });
}
