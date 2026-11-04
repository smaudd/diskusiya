import { t } from "shablon";
import layout from "../components/layout";

export default function login() {
    async function onSubmit(e) {
        e.preventDefault();
        const [{ value: email }, { value: password }] = e.target.elements;
        try {
            await app.pb.collection("users").authWithPassword(email, password);
            if (app.pb.authStore.isValid) {
                app.toasts.info(app.$("Welcome back!"));
                app.navigate("/");
            }
        } catch (err) {
            const message = err.message;
            app.toasts.error(app.$(message));
        }
    };

    const form = t.form(
        { onsubmit: onSubmit },
        t.input({ placeholder: app.$("Username"), required: true }),
        t.input({ placeholder: app.$("Password"), type: "password", required: true }),
        t.button({ type: "submit" }, app.$("Submit")),
    );
    return layout(t.h1({}, app.$("Login"), form));
}
