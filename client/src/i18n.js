import es from "../i18n/es.json";

const labels = {
    es,
};

function i18n(lang) {
    return (key, replacement) => {
        // TODO: Improve readability
        if (replacement) {
            return labels[lang]
                ? labels[lang][key]?.replace("%%", replacement) ||
                      key.replace("%%", replacement)
                : key.replace("%%", replacement);
        }
        return labels[lang] ? labels[lang][key] || key : key;
    };
}

export function initI18n() {
    window.app = window.app || {};
    window.app.language = app.pb?.authStore?.record?.language || "en";
    window.app.$ = i18n(window.app.language);
}

initI18n();
