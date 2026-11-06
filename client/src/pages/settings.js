import { t } from "shablon";
import { initI18n } from "../utils/i18n";
import layout from "../components/layout";
import field from "../components/field";
import { $ } from "../utils/i18n"
import toasts from "../components/toast"

export default function settings() {
    async function onSubmit(e) {
        e.preventDefault();
        const [{ value: language }] = e.target.elements;
        try {
            await app.pb.collection("users").update(app.pb.authStore.record.id, {
                language,
            });
            initI18n();
            toasts.info($("Settings successfully updated!"));
            app.replaceChildren(settings());
        } catch (err) {
            const message = err.message;
            toasts.error($(message));
        }
    }

    const languageOptions = [
        {
            value: "en",
            label: $("English"),
        },
        {
            value: "es",
            label: $("Spanish"),
        },
    ];

    function onLogout() {
        app.pb.authStore.clear();
        navigate("/login");
    }

    const form = t.form(
        { onsubmit: onSubmit },
        field(
            {
                label: $("Language"),
                placeholder: $("Language"),
                required: true,
                options: languageOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                    selected: app.pb.authStore.record.language === option.value,
                })),
            },
            t.select,
        ),
        t.button({ type: "submit", className: "btn" }, $("Save")),
    );
    return layout(
        t.h1(
            {},
            $("Settings"),
            form,
            t.div({}, [
                t.button({ className: "btn", onclick: onLogout }, $("Logout")),
            ]),
        ),
    );
}
