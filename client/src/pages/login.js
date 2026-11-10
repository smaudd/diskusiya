import { t } from "shablon";
import layout from "../components/layout";
import { $ } from "../utils/i18n";
import toasts from "../components/toast";
import { pb } from "../pb";
import field from "../components/field";
import { navigate } from "../utils/navigation";
import meta from "../services/meta";

export default function login() {
    async function onSubmit(e) {
        e.preventDefault();
        const [{ value: email }, { value: password }] = e.target.elements;
        try {
            await pb
                .collection("users")
                .authWithPassword(email, password, { expand: "blocks_via_owner" });
            if (pb.authStore.isValid) {
                toasts.info($("Welcome back!"));
                navigate("/");
            }
        } catch (err) {
            const message = err.message;
            toasts.error($(message));
        }
    }

    meta({ title: $("Login") });

    const form = t.form(
        { className: "flex flex-col gap-md", onsubmit: onSubmit },
        field(
            {
                label: $("Username"),
                placeholder: $("Enter your username or email"),
                required: true,
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
                "html-autocomplete": "password",
            },
            t.input,
        ),
        t.button({ className: "btn", type: "submit" }, $("Submit")),
    );
    return layout(t.h1({}, $("Login"), form));
}
