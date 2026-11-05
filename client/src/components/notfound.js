import { t } from "shablon";

export default function notfound() {
    return t.div({}, [
        t.h1({}, app.$("The requested page wasn't found :(")),
        t.a({ href: "/" }, app.$("Go home")),
    ]);
}
