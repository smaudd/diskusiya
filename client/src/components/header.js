import { t, store } from "shablon";
import { $ } from "../utils/i18n";
import { pb } from "../pb";

export default function header(title) {
    const data = store({
        authStore: pb.authStore,
    });

    const headerLinks = [
        () => !data.authStore.isValid && t.a({ href: "/login" }, $("Login")),
        () => !data.authStore.isValid && t.a({ href: "/register" }, $("Register")),
        () => data.authStore.isValid && t.a({ href: "/settings" }, $("Settings")),
    ].filter((link) => link());
    return t.header(
        {},
        t.nav({}, t.a({ href: "/" }, $("Home")), headerLinks),
        t.h1({}, title),
    );
}
