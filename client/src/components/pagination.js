import { t, watch } from "shablon";
import { $ } from "../utils/i18n";
import meta from "../services/meta";

export default function pagination({ data, collection = "" }) {
    const params = new URLSearchParams(window.location.search);
    params.delete("page");

    watch(
        () => [data.page],
        () => {
            meta({ title: $("Page (%%)", data.page) });
        },
    );

    // important for UX if this isn't set user will lose every query param except the current page
    const paramsString = params.size >= 1 ? `&${params}` : "";
    return t.div({ className: "flex gap-md justify-center mt-md" }, [
        // first page
        t.a(
            {
                href: `/${collection}?page=1${paramsString}`,
                ariaDisabled: data.page <= 1,
            },
            $("<<"),
        ),
        t.a(
            {
                href: `/${collection}?page=${+data.page - 1}${paramsString}`,
                ariaDisabled: data.page === 1,
            },
            $("<"),
        ),
        () => t.span({}, "..."),
        t.span({}, data.page),
        () => t.span({}, "..."),
        () =>
            t.a(
                {
                    href: `/${collection}?page=${+data.page + 1}${paramsString}`,
                    ariaDisabled: data.page >= data.totalPages,
                },
                $(">"),
            ),
        () =>
            t.a(
                {
                    href: `/${collection}?page=${data.totalPages}${paramsString}`,
                    ariaDisabled: data.page === data.totalPages,
                },
                $(">>"),
            ),
    ]);
}
