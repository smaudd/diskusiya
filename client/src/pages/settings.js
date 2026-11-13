import { t } from "shablon";
import layout from "../components/layout";
import { $ } from "../utils/i18n";
import meta from "../services/meta";
import tabs from "../components/tabs";
import generalSettings from "../components/generalSettings";
import blockedUsers from "../components/blockedUsers";

export default function settings() {
    meta({ title: $("Settings") });

    return layout(
        t.div({ className: "content-container", rid: "never" }, [
            t.h1({}, $("Settings")),
            tabs({
                id: "settings-tabs",
                defaultTab: "general",
                tabs: [
                    {
                        id: "general",
                        label: $("General"),
                        content: generalSettings(),
                    },
                    {
                        id: "blocks",
                        label: $("Blocked users"),
                        content: blockedUsers(),
                    },
                ],
            }),
        ]),
    );
}
