import { t } from "shablon";
import { $ } from "../utils/i18n";
import modals from "../components/modal";
import markdown from "./markdown";
import recordMeta from "./recordMeta";
import field from "./field";

export default function reportModal({ id, onSubmitReport, record }) {
    if (!record && !record?.expand?.user) return null;
    return t.div(
        {
            className: "modal",
        },
        t.header({ className: "modal-header" }, $("Report")),
        t.div({ className: "modal-content flex flex-col gap-md" }, [
            recordMeta({
                author: record?.expand?.user,
                created: record.created,
                updated: record.updated,
            }),
            t.div({ className: "quote" }, () => markdown(record.content.slice(0, 250))),
            t.form(
                {
                    id,
                    role: "search",
                    className: "flex flex-col gap-md",
                    onsubmit: onSubmitReport,
                },
                [
                    field(
                        {
                            label: $("Report reason"),
                            placeholder: $("Tell us what is wrong with this content"),
                            type: "text",
                            name: "reason",
                            id: "reason",
                            required: true,
                        },
                        t.input,
                    ),
                    field(
                        {
                            label: $("Block user"),
                            placeholder: $("Block"),
                            type: "checkbox",
                            name: "block-content",
                            id: `${id}-block-content"`,
                            required: true,
                        },
                        t.input,
                    ),
                ],
            ),
        ]),
        t.footer({ className: "modal-footer" }, [
            t.button(
                // TODO: Not sure how this usage works here but it does
                {
                    className: "btn transparent",
                    onclick: () => {
                        modals.close(this);
                    },
                },
                $("Cancel"),
            ),
            t.button({ className: "btn", "html-form": id }, $("Report")),
        ]),
    );
}
