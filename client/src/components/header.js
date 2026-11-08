import { t, store } from "shablon";
import { $ } from "../utils/i18n";
import { pb } from "../pb";
import discussionModal from "./disussionModal";
import modals from "../components/modal";

import { createDiscussion } from "../services/collections/discussions";
import { navigate } from "../utils/navigation";

export default function header(title) {
    const data = store({
        authStore: pb.authStore,
    });

    const createDiscussionModal = discussionModal({
        onSubmitDiscussion: async (e) => {
            await createDiscussion({ event: e });
            modals.close(createDiscussionModal);
        },
    });

    const headerLinks = [
        () => !data.authStore.isValid && t.a({ href: "/login" }, $("Login")),
        () => !data.authStore.isValid && t.a({ href: "/register" }, $("Register")),
        () => data.authStore.isValid && t.a({ href: "/settings" }, $("Settings")),
    ].filter((link) => link());
    return t.header(
        { className: "flex items-center justify-between" },
        t.nav({}, t.a({ href: "/" }, $("Home")), headerLinks),
        createDiscussionModal,
        t.button(
            {
                className: "btn",
                onclick: () => {
                    if (!pb.authStore.isValid) {
                        toast.info("Login to be part of the conversation");
                        navigate("/login");
                        return;
                    }
                    modals.open(createDiscussionModal);
                },
            },
            $("Create discussion"),
        ),
    );
}
