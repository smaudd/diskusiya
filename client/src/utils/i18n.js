import es from "../../i18n/es.json";
import { pb } from "../pb";

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

export let $ = null;

export function initI18n() {
    $ = i18n(pb.authStore.record?.language || "en");
}

initI18n();
