import { t, store } from "shablon";
import layout from "../components/layout";
import discussionModal from "../components/disussionModal";
import loader from "../components/loader";
import pagination from "../components/pagination";
import { $ } from "../utils/i18n";
import discussionCard from "../components/discussionCard";
import sort from "../components/sort";
import modals from "../components/modal";
import { navigate, navigateQueryParam } from "../utils/navigation";
import { createDiscussion, getDiscussions } from "../services/collections/discussions";
import searchModalMobile from "../components/searchModalMobile";
import metatitle from "../services/meta";
import meta from "../services/meta";

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

    const searchDiscussionModal = searchModalMobile({
        search: data.search,
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

    function onClearSearch() {
        data.search = "";
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

    function clearFiltersBlock({ title }) {
        return t.div({ className: "flex gap-md items-center" }, [
            t.span({ className: "flex-1" }, title),
            t.button(
                {
                    className: "btn borderless",
                    onclick: onClearSearch,
                },
                $("Clear filters"),
            ),
        ]);
    }

    return layout(
        t.div(
            {
                onmount: async () => {
                    const res = await getDiscussions({ data });
                    data.totalPages = res.totalPages;
                    data.discussions = res.discussions;
                    data.totalItems = res.totalItems;
                    meta({ title: $("Page (%%)", data.page) })
                },
            },
            t.div({ className: "discussions-header" }, [
                t.h1({}, () => [
                    t.span({}, $("Discussions")),
                    data.totalItems ? t.span({}, `(${data.totalItems})`) : null,
                ]),
            ]),
        ),
        searchDiscussionModal,
        t.div({ className: "discussions-filters" }, [
            t.form(
                {
                    role: "search",
                    className: "discussions-search-md",
                    onsubmit: onSearch,
                },
                [
                    t.div({ className: "field field-row w-full" }, [
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
                ],
            ),
            sort({
                onSortChange,
                data,
            }),
            t.button(
                {
                    className: "btn discussions-search",
                    onclick: () => {
                        modals.open(searchDiscussionModal);
                    },
                },
                $("Search"),
            ),
        ]),
        t.div({ className: "flex flex-col gap-md", rid: data.discussions }, () => {
            if (data.loading) {
                return loader();
            }
            if (data.discussions?.length === 0) {
                if (data.search) {
                    return clearFiltersBlock({
                        title: $("No results found for '%%'", data.search),
                    });
                }
                return t.span({}, $("Create your first discussion"));
            }
            return t.div({}, [
                () => {
                    if (data.search) {
                        return clearFiltersBlock({
                            title: $("Search results for '%%'", data.search),
                        });
                    }
                },
                data.discussions?.map(discussionCard),
                pagination({ data }),
            ]);
        }),
    );
}
