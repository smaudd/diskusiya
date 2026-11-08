import { t } from "shablon";
import { $ } from "../utils/i18n";

export default function notfound() {
    return t.div({}, [
        t.h1({}, $("The requested page wasn't found :(")),
        t.a({ href: "/" }, $("Go home")),
    ]);
}
