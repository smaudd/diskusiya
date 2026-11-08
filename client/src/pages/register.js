import { t } from "shablon";
import layout from "../components/layout";
import { $ } from "../utils/i18n"
import toasts from "../components/toast"

export default function register() {
    async function onSubmit(e) {
        e.preventDefault();
        const [{ value: email }, { value: password }, { value: passwordConfirm }] =
            e.target.elements;
        if (password !== passwordConfirm) {
            toasts.error($("Passwords doens't match, try again"));
            return;
        }
        try {
            await pb.collection("users").create({
                email,
                password,
                passwordConfirm,
            });
            await pb.collection("users").authWithPassword(email, password);
            if (pb.authStore.isValid) {
                toasts.info($("Welcome!"));
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
        t.input({
            placeholder: $("Repeat password"),
            type: "password",
            required: true,
        }),
        t.button({ type: "submit" }, $("Submit")),
    );
    return layout(t.h1({}, $("Register"), form));
}
