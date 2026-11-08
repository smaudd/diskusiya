import { t } from "shablon";
import { $ } from "../utils/i18n";
import modals from "../components/modal";

export default function searchModalMobile({ onSearch, search }) {
    return t.div(
        {
            className: "modal",
        },
        t.header({ className: "modal-header" }, $("Search")),
        [
            t.form(
                {
                    id: "search-form",
                    role: "search",
                    className: "discussions-search",
                    onsubmit: onSearch,
                },
                [
                    t.div({ className: "field field-row w-full" }, [
                        t.input({
                            placeholder: $("Search"),
                            type: "search",
                            value: search,
                            name: "search",
                            id: "search",
                        }),
                    ]),
                ],
            ),
        ],
        t.footer({ className: "modal-footer" }, [
            t.button(
                // TODO: Not sure how this usage works here but it does
                { className: "btn borderless", onclick: () => modals.close(this) },
                $("Cancel"),
            ),
            t.button({ className: "btn", "html-form": "search-form" }, $("Search")),
        ]),
    );
}
