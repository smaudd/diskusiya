import { t, store } from "shablon";

export default function confirmationModal({ onConfirm }) {
    const data = store({
        loading: false,
    });
    return t.div(
        {
            className: "modal",
        },
        [
            t.header({ className: "modal-header" }, app.$("Confirm")),
            t.div({ className: "modal-content" }, t.span({}, app.$("Are you sure?"))),
            t.footer({ className: "modal-footer" }, [
                t.button(
                    // TODO: Not sure how this usage works here but it does
                    {
                        className: "btn borderless",
                        onclick: () => app.modals.close(this),
                    },
                    app.$("Cancel"),
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
                    () => (data.loading ? app.$("Loading...") : app.$("Ok")),
                ),
            ]),
        ],
    );
}
