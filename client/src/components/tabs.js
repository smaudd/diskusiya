import { store, t } from "shablon";

export default function tabsComponent({ id, defaultTab, tabs }) {
    const savedTab = localStorage.getItem(`tabs[${id}]`)
    const data = store({
        currentTab: tabs.some(tab => tab.id === savedTab) && savedTab || defaultTab,
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
                        onclick: () => {
                            data.currentTab = tab.id;
                            localStorage.setItem(`tabs[${id}]`, tab.id);
                        },
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
