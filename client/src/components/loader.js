import { t } from "shablon"

export default function loader() {
    // TODO: Improve loader UI
    return t.span({}, app.$("Loading..."))
}