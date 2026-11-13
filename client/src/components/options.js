import { t, store } from "shablon";
import { $ } from "../utils/i18n";

// TODO: Aria labels for accesibility
export default function optionsComponent({ options, className = "" }) {
    const data = store({
        open: false,
    });

    function onDocumentClick(e) {
        if (!trigger.contains(e.target) && data.open) {
            data.open = false;
        }
    }

    const trigger = t.button(
        {
            rid: "never",
            className: `btn transparent options-kebab-trigger ${className}`,
            // 'html-data-open': data.open,
            onclick: () => {
                data.open = !data.open;
                setTimeout(() => {
                    document.addEventListener("click", onDocumentClick, { once: true });
                });
            },
        },
        () => (data.open ? $("Less") : $("More")),
        () =>
            t.div(
                { className: `options-kebab-list${data.open ? " open" : ""}` },
                options.map((option) =>
                    t.button(
                        { ...option.attrs, className: "btn transparent" },
                        option.value,
                    ),
                ),
            ),
    );

    return trigger;
}
