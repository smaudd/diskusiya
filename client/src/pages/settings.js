import { t, store } from "shablon";
import { initI18n } from "../utils/i18n";
import layout from "../components/layout";
import field from "../components/field";
import { $ } from "../utils/i18n";
import toasts from "../components/toast";
import { pb } from "../pb";
import { navigate } from "../utils/navigation";
import { collections } from "../services/collections/config";
import { flushAll } from "../services/collections/discussions";
import meta from "../services/meta";
import emailResetModal from "../components/emailResetModal";
import modal from "../components/modal";
import avatar from "../components/avatar";

export default function settings() {
    const data = store({
        avatar: pb.authStore.record.avatar,
        previewAvatar: false,
    });

    console.log(pb.authStore.record);

    async function onSubmitLanguage(e) {
        e.preventDefault();
        const [{ value: language }] = e.target.elements;
        try {
            await pb.collection(collections.users).update(pb.authStore?.record?.id, {
                language,
            });
            initI18n();
            toasts.info($("Settings successfully updated!"));
            app.replaceChildren(settings());
        } catch (err) {
            const message = err.message;
            toasts.error($(message));
        }
    }

    meta({ title: $("Settings") });

    const languageOptions = [
        {
            value: "en",
            label: $("English"),
        },
        {
            value: "es",
            label: $("Spanish"),
        },
    ];

    async function onSubmitAvatar(e) {
        const [{ files }] = e.target.elements;
        if (!files[0]) {
            console.log("no file");
            return;
        }
        const file = files[0];
        try {
            const user = await pb
                .collection(collections.users)
                .update(pb.authStore.record.id, {
                    avatar: file,
                });
            pb.authStore.save(pb.authStore.token, user);
            app.replaceChildren(settings());
            toasts.info($("Avatar updated"));
        } catch (err) {
            toasts.error($("We had a problem updating your %%", $("avatar")));
        } finally {
            flushAll();
        }
    }

    function onLogout() {
        pb.authStore.clear();
        navigate("/login");
    }

    function onAvatarChange(e) {
        const files = e.target.files;
        if (!files[0]) {
            return;
        }
        const file = files[0];
        data.avatar = URL.createObjectURL(file);
        data.previewAvatar = true;
    }

    function onCancelAvatar() {
        data.avatar = pb.authStore.record.avatar;
        data.previewAvatar = false;
    }

    async function onSubmitEmail(e) {
        const [{ value: email }] = e.target.elements;
        try {
            await pb.collection("users").requestEmailChange(email);
            toasts.info($("Email request change sent"));
        } catch (err) {
            console.log();
            toasts.error($("We had a problem requesting your %% reset", $("email")));
        }
    }

    function requestReset({ type }) {
        return async (e) => {
            if (type === "password") {
                try {
                    await pb
                        .collection(collections.users)
                        .requestPasswordReset(pb.authStore.record.email);
                    toasts.info($("%% request change sent", $("password")));
                } catch (err) {
                    console.log(err);
                    toasts.error(
                        $("We had a problem requesting your %% reset", $("password")),
                    );
                }
            }
            if (type === "email") {
                const [{ value: email }] = e.target.elements;
                try {
                    await pb.collection(collections.users).requestEmailChange(email);
                    toasts.info($("%% request change sent", $("email")));
                } catch (err) {
                    console.log(err);
                    toasts.error(
                        $("We had a problem requesting your %% reset", $("password")),
                    );
                }
            }
        };
    }

    const languageForm = t.form(
        { className: "settings-form", onsubmit: onSubmitLanguage },
        field(
            {
                label: $("Language"),
                placeholder: $("Language"),
                required: true,
                options: languageOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                    selected: pb.authStore.record.language === option.value,
                })),
            },
            t.select,
        ),
        t.button({ type: "submit", className: "btn" }, $("Save")),
    );

    const avatarForm = t.form(
        { className: "settings-form", onsubmit: onSubmitAvatar },
        t.div({ className: "avatar-block" }, [
            () => {
                return avatar({
                    author: pb.authStore.record,
                    src: data.previewAvatar && data.avatar,
                });
            },
            field(
                {
                    label: $("Avatar"),
                    placeholder: $("Avatar"),
                    required: true,
                    type: "file",
                    onchange: onAvatarChange,
                    className: "flex-row",
                },
                t.input,
            ),
        ]),
        t.div({ className: "flex gap-md" }, [
            () =>
                data.previewAvatar
                    ? t.button(
                          {
                              type: "button",
                              className: "btn borderless",
                              onclick: onCancelAvatar,
                          },
                          $("Cancel"),
                      )
                    : "",
            t.button({ type: "submit", className: "btn" }, $("Save")),
        ]),
    );
    const emailResetModalRef = emailResetModal({
        onConfirm: requestReset({ type: "email" }),
    });
    return layout(
        t.h1({}, $("Settings")),
        t.div({ className: "flex flex-col gap-md", rid: "never" }, [
            languageForm,
            avatarForm,
            emailResetModalRef,
            t.div({ className: "flex flex-col gap-md" }, [
                t.button(
                    { className: "btn", onclick: requestReset({ type: "password" }) },
                    $("Request password reset"),
                ),
                t.button(
                    {
                        className: "btn",
                        onclick: () => {
                            modal.open(emailResetModalRef);
                        },
                    },
                    $("Request email reset"),
                ),
                t.button({ className: "btn", onclick: onLogout }, $("Logout")),
            ]),
        ]),
    );
}
