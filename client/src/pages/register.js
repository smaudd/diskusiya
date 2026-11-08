import { t } from "shablon";
import layout from "../components/layout";
import { $ } from "../utils/i18n";
import toasts from "../components/toast";
import field from "../components/field";

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
        { className: "flex flex-col gap-md", onsubmit: onSubmit },
        field(
            {
                label: $("Username"),
                placeholder: $("Enter your username or email"),
                required: true,
                name: "username",
                "html-autocomplete": "username",
            },
            t.input,
        ),
        field(
            {
                label: $("Password"),
                placeholder: $("Enter your password"),
                required: true,
                type: "password",
                name: "password",
                "html-autocomplete": "new-password",
            },
            t.input,
        ),
        field(
            {
                label: $("Repeat Password"),
                placeholder: $("Repeat your password"),
                required: true,
                type: "password",
                name: "repeat-password",
                "html-autocomplete": "new-password",
            },
            t.input,
        ),
        t.button({ type: "submit", className: "btn" }, $("Submit")),
    );
    return layout(t.h1({}, $("Register"), form));
}
