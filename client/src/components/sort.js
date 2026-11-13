import { t } from "shablon";
import field from "./field";
import { $ } from "../utils/i18n";

export default function sort({ onSortChange, data }) {
    return field(
        {
            id: "sort",
            className: "field-row borderless",
            label: null,
            placeholder: $("Sort"),
            onchange: onSortChange,
            options: [
                {
                    label: $("Latetst"),
                    value: "-created",
                    selected: data.sort === "-created",
                },
                {
                    label: $("Oldest"),
                    value: "created",
                    selected: data.sort === "created",
                },
            ],
        },
        t.select,
    );
}
