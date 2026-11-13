import { t, store } from "shablon";
import { $ } from "../utils/i18n";
import modals from "../components/modal";
import field from "./field";
import { pb } from "../pb";

export default function emailResetModal({ onConfirm }) {
    const data = store({
        currentEmail: pb.authStore.record.email,
    });
    return t.div(
        {
            className: "modal",
        },
        [
            t.header({ className: "modal-header" }, $("Change your email")),
            t.form(
                { id: "email-form", className: "modal-content", onsubmit: onConfirm },
                field(
                    {
                        label: $("Email"),
                        placeholder: $("Email"),
                        required: true,
                        type: "email",
                        value: pb.authStore.record.email,
                        oninput: (e) => {
                            data.currentEmail = e.target.value;
                        },
                    },
                    t.input,
                ),
            ),
            t.footer({ className: "modal-footer" }, [
                t.button(
                    // TODO: Not sure how this usage works here but it does
                    {
                        className: "btn transparent",
                        onclick: () => modals.close(this),
                    },
                    $("Cancel"),
                ),
                () =>
                    t.button(
                        {
                            type: "submit",
                            className: "btn",
                            "html-form": "email-form",
                            disabled: data.currentEmail === pb.authStore.record.email,
                        },
                        $("Request"),
                    ),
            ]),
        ],
    );
}
