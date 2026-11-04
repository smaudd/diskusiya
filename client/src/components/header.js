import { t, store } from "shablon";

export default function header(title) {
    const data = store({
        authStore: app.pb.authStore,
    });
    function onLogout() {
        app.pb.authStore.clear();
        app.navigate("/login");
    }
    const headerLinks = [
        () => !data.authStore.isValid && t.a({ href: "/login" }, app.$("Login")),
        () => !data.authStore.isValid && t.a({ href: "/register" }, app.$("Register")),
        () => data.authStore.isValid && t.a({ href: "/settings" }, app.$("Settings")),
        () =>
            data.authStore.isValid &&
            t.a({ href: "#", onclick: onLogout }, app.$("Logout")),
    ].filter((link) => link());
    return t.header(
        {},
        t.nav({}, t.a({ href: "/" }, "Home"), headerLinks),
        t.h1({}, title),
    );
}
