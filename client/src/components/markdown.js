import { t } from "shablon"
import renderMarkdown from "../utils/markdown"

export default function markdown(content) {
    return t.div({ innerHTML: renderMarkdown(content) })
}