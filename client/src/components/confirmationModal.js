import { t, store } from "shablon";
import { $ } from "../utils/i18n";

export default function confirmationModal({ onConfirm }) {
    const data = store({
        loading: false,
    });
    return t.div(
        {
            className: "modal",
        },
        [
            t.header({ className: "modal-header" }, $("Confirm")),
            t.div({ className: "modal-content" }, t.span({}, $("Are you sure?"))),
            t.footer({ className: "modal-footer" }, [
                t.button(
                    // TODO: Not sure how this usage works here but it does
                    {
                        className: "btn borderless",
                        onclick: () => app.modals.close(this),
                    },
                    $("Cancel"),
                ),
                t.button(
                    {
                        className: "btn",
                        onclick: async (e) => {
                            data.loading = true;
                            await onConfirm(e);
                            data.loading = false;
                        },
                    },
                    () => (data.loading ? $("Loading...") : $("Ok")),
                ),
            ]),
        ],
    );
}
