import { t } from "shablon"
import { $ } from "../utils/i18n"

export default function loader() {
    // TODO: Improve loader UI
    return t.div({ className: "loader" }, $("Loading..."))
}