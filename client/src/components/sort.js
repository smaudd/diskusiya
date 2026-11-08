import { t } from "shablon";
import field from "./field";
import { $ } from "../utils/i18n";

export default function sort({ onSortChange, data }) {
    return field(
        {
            id: "sort",
            className: "field-row",
            label: $("Sort"),
            placeholder: $("Sort"),
            onchange: onSortChange,
            options: [
                {
                    label: $("Latetst"),
                    value: "-updated",
                    selected: data.sort === "-updated",
                },
                {
                    label: $("Oldest"),
                    value: "updated",
                    selected: data.sort === "updated",
                },
            ],
        },
        t.select,
    );
}
