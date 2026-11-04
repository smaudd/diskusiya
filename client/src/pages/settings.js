import { t } from "shablon";
import { initI18n } from "../i18n"
import layout from "../components/layout";

export default function settings() {
    async function onSubmit(e) {
        e.preventDefault();
        const [{ value: language }] = e.target.elements;
        try {
            await app.pb.collection("users").update(app.pb.authStore.record.id, {
                language,
            });
            initI18n()
            app.toasts.info(app.$("Settings successfully updated!"));
            app.replaceChildren(settings())
        } catch (err) {
            const message = err.message;
            app.toasts.error(app.$(message));
        }
    };

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

    const form = t.form(
        { onsubmit: onSubmit },
        t.select(
            { placeholder: app.$("Language"), required: true },
            languageOptions.map((option) =>
                t.option(
                    {
                        value: option.value,
                        selected: app.pb.authStore.record.language === option.value,
                    },
                    option.label,
                ),
            ),
        ),
        t.button({ type: "submit" }, app.$("Save")),
    );
    return layout(t.h1({}, app.$("Settings"), form));
}
