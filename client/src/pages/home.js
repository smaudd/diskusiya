import { t, store } from "shablon";
import layout from "../components/layout";
import notfound from "../components/notfound";
import discussionModal from "../components/disussionModal";
import slugify from "../utils/slugify";
import randomString from "../utils/randomString";
import recordMeta from "../components/recordMeta";
import loader from "../components/loader";
import pagination from "../components/pagination";
import field from "../components/field";
import discussionCard from "../components/discussionCard";

// TODO: Split this file into smaller modules
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

    async function getDiscussions() {
        data.loading = true;
        try {
            const rules = {
                sort: data.sort,
                expand: "user",
                fields: "slug,title,content:excerpt(200,true),expand.user.name,updated,created",
            };
            if (data.search) {
                rules.filter = `title~ '${data.search}' || content~ '${data.search}'`;
            }
            const list = await app.pb
                .collection("discussions")
                .getList(data.page, data.limit, rules);
            data.totalPages = list.totalPages;
            data.discussions = list.items;
            data.totalItems = list.totalItems;
            if (data.page > data.totalPages) {
                app.navigateQueryParam([
                    {
                        name: "page",
                        value: 1,
                    },
                ]);
            }
        } catch (err) {
            console.log(err);
            app.toasts.error(app.$("Something went wrong getting discussions"));
        } finally {
            data.loading = false;
        }
    }

    async function onSubmitDiscussion(e) {
        e.preventDefault();
        const [{ value: title }, { value: content }] = e.target.elements;
        try {
            await app.pb.collection("discussions").create({
                title,
                content,
                slug: `${slugify(title)}-${randomString()}`,
                user: app.pb.authStore.record.id,
            });
            app.toasts.info(app.$("Discussion created!"));
            app.modals.close(modal);
            // cleanup filters to let user see their post on the first position
            data.sort = "-updated";
            data.search = "";
            await getDiscussions();
            e.target.reset();
        } catch (err) {
            console.log(err);
            app.toasts.error(app.$("Something went wrong saving the discussion"));
        }
    }

    const modal = discussionModal({
        onSubmitDiscussion,
    });

    async function onSortChange(e) {
        data.sort = e.target.value;
        await getDiscussions();
        app.navigateQueryParam([
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
        await getDiscussions();
        // always set query param after request is done to prevent aborts
        app.navigateQueryParam([
            {
                name: "search",
                value: data.search,
            },
        ]);
    }

    async function onSearchInput(e) {
        if (e.target.value === "" && data.search !== "") {
            data.search = "";
            await getDiscussions();
            // always set query param after request is done to prevent aborts
            app.navigateQueryParam([
                {
                    name: "search",
                    value: "",
                },
            ]);
        }
    }

    return layout(
        t.div({ className: "flex justify-between", onmount: () => getDiscussions() }, [
            t.h1({ className: "flex gap-md" }, () => [
                t.span({}, app.$("Discussions")),
                data.totalItems ? t.span({}, `(${data.totalItems})`) : null,
            ]),
            t.button(
                {
                    className: "btn",
                    onclick: () => {
                        app.modals.open(modal);
                    },
                },
                app.$("Create discussion"),
            ),
        ]),
        modal,
        t.div({ className: "flex justify-between" }, [
            t.form({ role: "search", className: "flex gap-md", onsubmit: onSearch }, [
                t.div({ className: "field field-row" }, [
                    t.input({
                        placeholder: app.$("Search"),
                        type: "search",
                        value: data.search,
                        oninput: onSearchInput,
                        name: "search",
                        id: "search",
                    }),
                    t.button({ type: "submit", className: "btn" }, app.$("Search")),
                ]),
            ]),
            field(
                {
                    id: "sort",
                    className: "field-row",
                    label: app.$("Sort"),
                    placeholder: app.$("Sort"),
                    onchange: onSortChange,
                    options: [
                        {
                            label: app.$("Latetst"),
                            value: "-updated",
                            selected: data.sort === "-updated",
                        },
                        {
                            label: app.$("Oldest"),
                            value: "updated",
                            selected: data.sort === "updated",
                        },
                    ],
                },
                t.select,
                    ),
                ]),
            ]),
        ]),
        t.div({ className: "flex flex-col gap-md", rid: data.discussions }, () => {
            if (data.loading) {
                return loader();
            }
            if (data.discussions.length === 0) {
                if (data.search) {
                    return t.span({}, app.$("No results found for '%%'", data.search));
                }
                return t.span({}, app.$("Create your first discussion"));
            }
            return [
                t.div({}, [
                    data.discussions.map(discussionCard),
                    pagination({ data }),
                ]),
            ];
        }),
    );
}
