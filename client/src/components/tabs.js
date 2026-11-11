import { store, t } from "shablon";

export default function tabsComponent({ defaultTab, tabs }) {
    const data = store({
        currentTab: defaultTab,
    });

    return t.div(
        { className: "tabs" },
        t.div(
            {
                className: "tabs-header",
                rid: data.currentTab,
            },
            tabs.map((tab) =>
                t.button(
                    {
                        className: "tab btn",
                        "html-data-active": () => data.currentTab === tab.id,
                        onclick: () => (data.currentTab = tab.id),
                    },
                    tab.label,
                ),
            ),
        ),
        t.div({ className: "tab-content", rid: data.currentTab }, () => {
            const tab = tabs.find((tab) => data.currentTab === tab.id);
            return tab.content;
        }),
    );
}
