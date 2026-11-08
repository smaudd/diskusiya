import { t } from "shablon";
import layout from "../components/layout";
import { $ } from "../utils/i18n"
import toasts from "../components/toast"
import { pb } from "../pb";

export default function login() {
    async function onSubmit(e) {
        e.preventDefault();
        const [{ value: email }, { value: password }] = e.target.elements;
        try {
            await pb.collection("users").authWithPassword(email, password);
            if (pb.authStore.isValid) {
                toasts.info($("Welcome back!"));
                navigate("/");
            }
        } catch (err) {
            const message = err.message;
            toasts.error($(message));
        }
    }

    const form = t.form(
        { onsubmit: onSubmit },
        t.input({ placeholder: $("Username"), required: true }),
        t.input({ placeholder: $("Password"), type: "password", required: true }),
        t.button({ type: "submit" }, $("Submit")),
    );
    return layout(t.h1({}, $("Login"), form));
}
