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
        t.h1({}, $("Settings")),
        t.div({ className: "flex flex-col gap-md", rid: "never" }, [
            tabs({
                id: "settings-tabs",
                defaultTab: "general",
                tabs: [
                    {
                        id: "general",
                        label: $("General"),
                        content: generalSettings()
                    },
                    {
                        id: "blocks1",
                        label: $("Blocked users"),
                        content: blockedUsers()
                    },
                     {
                        id: "blocks2",
                        label: $("Blocked users"),
                        content: blockedUsers()
                    },
                     {
                        id: "blocks3",
                        label: $("Blocked users"),
                        content: blockedUsers()
                    },
                     {
                        id: "blocks4",
                        label: $("Blocked users"),
                        content: blockedUsers()
                    },
                     {
                        id: "blocks5",
                        label: $("Blocked users"),
                        content: blockedUsers()
                    },
                     {
                        id: "blocks6",
                        label: $("Blocked users"),
                        content: blockedUsers()
                    },
                     {
                        id: "blocks7",
                        label: $("Blocked users"),
                        content: blockedUsers()
                    },
                     {
                        id: "blocks8",
                        label: $("Blocked users"),
                        content: blockedUsers()
                    }
                ],
            }),
        ]),
    );
}
