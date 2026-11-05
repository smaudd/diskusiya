import { t, store } from "shablon";
import layout from "../components/layout";
import recordMeta from "../components/recordMeta";
import loader from "../components/loader";
import notfound from "../components/notfound";

export default function discussion(route) {
    const data = store({
        discussion: null,
        loading: false,
        notfound: false,
    });

    async function getDiscussion() {
        data.loading = true;
        try {
            data.discussion = await app.pb
                .collection("discussions")
                .getFirstListItem(`slug='${route.params.slug}'`, {
                    expand: "user",
                });
        } catch (err) {
            if (err.status === 404) {
                data.notfound = true
                data.loading = false
                return
            }
            app.toasts.error(app.$("Something went wrong getting this discussion"));
        } finally {
            data.loading = false;
        }
    }

    return layout(
        t.div({ onmount: () => getDiscussion() }, () => {
            if (data.loading) {
                return loader();
            }
            if (data.notfound) {
                return notfound();
            }
            return [
                recordMeta({
                    author: data.discussion?.expand?.user?.name,
                    date: data.discussion?.updated,
                }),
                t.h1({}, () => data.discussion?.title),
                t.p({}, () => data.discussion?.content),
            ];
        }),
    );
}
