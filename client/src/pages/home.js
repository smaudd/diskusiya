import { t, store } from "shablon";
import layout from "../components/layout";
import discussionModal from "../components/disussionModal";
import loader from "../components/loader";
import pagination from "../components/pagination";
import { $ } from "../utils/i18n";
import discussionCard from "../components/discussionCard";
import sort from "../components/sort";
import modals from "../components/modal";
import { navigateQueryParam } from "../utils/navigation";
import { createDiscussion, getDiscussions } from "../services/collections/discussions";

export default function home() {
    const searchParams = new URLSearchParams(location.search);
    const data = store({
        discussions: [],
        search: searchParams.get("search") || "",
        sort: searchParams.get("sort") || "-updated",
        page: +searchParams.get("page") || 1, // if page is forced to 0 it will evaluate false and always render page 1
        totalItems: null,
        limit: 3,
        totalPages: null,
    });

    const modal = discussionModal({
        onSubmitDiscussion: async (e) => {
            await createDiscussion({ event: e });
            modals.close(modal);
        },
    });

    async function onSortChange(e) {
        data.sort = e.target.value;
        await getDiscussions({ data });
        navigateQueryParam([
            {
                name: "sort",
                value: data.sort,
            },
        ]);
    }

    async function onSearch(e) {
        e.preventDefault();
        e.stopPropagation();
        const value = e.target.elements[0].value?.trim();
        if (value === data.search) {
            return;
        }
        data.search = e.target.elements[0].value?.trim() || "";
        navigateQueryParam([
            {
                name: "search",
                value: data.search,
            },
            {
                name: "page",
                value: 1,
            },
            {
                name: "sort",
                value: data.sort,
            },
        ]);
    }

    async function onSearchInput(e) {
        if (e.target.value === "" && data.search !== "") {
            data.search = "";
            navigateQueryParam([
                {
                    name: "search",
                    value: "",
                },
                {
                    name: "page",
                    value: 1,
                },
                {
                    name: "sort",
                    value: data.sort,
                },
            ]);
        }
    }

    return layout(
        t.div(
            {
                className: "flex justify-between",
                onmount: async () => {
                    const res = await getDiscussions({ data });
                    data.totalPages = res.totalPages;
                    data.discussions = res.discussions;
                    data.totalItems = res.totalItems;
                },
            },
            [
                t.h1({ className: "flex gap-md" }, () => [
                    t.span({}, $("Discussions")),
                    data.totalItems ? t.span({}, `(${data.totalItems})`) : null,
                ]),
                t.button(
                    {
                        className: "btn",
                        onclick: () => {
                            modals.open(modal);
                        },
                    },
                    $("Create discussion"),
                ),
            ],
        ),
        modal,
        t.div({ className: "flex justify-between" }, [
            t.form({ role: "search", className: "flex gap-md", onsubmit: onSearch }, [
                t.div({ className: "field field-row" }, [
                    t.input({
                        placeholder: $("Search"),
                        type: "search",
                        value: data.search,
                        oninput: onSearchInput,
                        name: "search",
                        id: "search",
                    }),
                    t.button({ type: "submit", className: "btn" }, $("Search")),
                ]),
            ]),
            sort({
                onSortChange,
                data,
            }),
        ]),
        t.div({ className: "flex flex-col gap-md", rid: data.discussions }, () => {
            if (data.loading) {
                return loader();
            }
            if (data.discussions?.length === 0) {
                if (data.search) {
                    return t.span({}, $("No results found for '%%'", data.search));
                }
                return t.span({}, $("Create your first discussion"));
            }
            return t.div({}, [
                data.discussions?.map(discussionCard),
                pagination({ data }),
            ]);
        }),
    );
}
