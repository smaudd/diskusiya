import { t } from "shablon";
import { initI18n } from "../i18n";
import layout from "../components/layout";
import field from "../components/field";

export default function settings() {
    async function onSubmit(e) {
        e.preventDefault();
        const [{ value: language }] = e.target.elements;
        try {
            await app.pb.collection("users").update(app.pb.authStore.record.id, {
                language,
            });
            initI18n();
            app.toasts.info(app.$("Settings successfully updated!"));
            app.replaceChildren(settings());
        } catch (err) {
            const message = err.message;
            app.toasts.error(app.$(message));
        }
    }

    const languageOptions = [
        {
            value: "en",
            label: app.$("English"),
        },
        {
            value: "es",
            label: app.$("Spanish"),
        },
    ];

    function onLogout() {
        app.pb.authStore.clear();
        app.navigate("/login");
    }

    const form = t.form(
        { onsubmit: onSubmit },
        field(
            {
                label: app.$("Language"),
                placeholder: app.$("Language"),
                required: true,
                options: languageOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                    selected: app.pb.authStore.record.language === option.value,
                })),
            },
            t.select,
        ),
        t.button({ type: "submit", className: "btn" }, app.$("Save")),
    );
    return layout(
        t.h1(
            {},
            app.$("Settings"),
            form,
            t.div({}, [
                t.button({ className: "btn", onclick: onLogout }, app.$("Logout")),
            ]),
        ),
    );
}
