import { t } from "shablon";
import layout from "../components/layout";
import { $ } from "../utils/i18n";
import toasts from "../components/toast";
import field from "../components/field";
import meta from "../services/meta";
import { pb } from "../pb";
import { navigate } from "../utils/navigation";
import { userQueryParameters } from "../services/collections/config";

export default function register() {
    async function onSubmit(e) {
        e.preventDefault();
        const [
            { value: email },
            { value: name },
            { value: password },
            { value: passwordConfirm },
        ] = e.target.elements;
        if (password !== passwordConfirm) {
            toasts.error($("Passwords doens't match, try again"));
            return;
        }
        try {
            await pb.collection("users").create({
                name,
                email,
                password,
                passwordConfirm,
            });
            await pb
                .collection("users")
                .authWithPassword(email, password, userQueryParameters);
            if (pb.authStore.isValid) {
                toasts.info($("Welcome!"));
                navigate("/");
            }
        } catch (err) {
            const message = err.message;
            toasts.error($(message));
        }
    }

    meta({ title: $("Register") });

    const form = t.form(
        { className: "flex flex-col gap-md", onsubmit: onSubmit },
        field(
            {
                label: $("Email"),
                placeholder: $("Enter your email"),
                required: true,
                name: "email",
                "html-autocomplete": "email",
            },
            t.input,
        ),
        field(
            {
                label: $("Name"),
                placeholder: $("Enter your name (prioritize an alias)"),
                required: true,
                name: "name",
                "html-autocomplete": "name",
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
