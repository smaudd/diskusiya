import { t } from "shablon";
import recordMeta from "./recordMeta";
import markdown from "./markdown";

export default function discussionCard(discussion) {
    return t.a(
        {
            href: `/d/${discussion.slug}`,
            className: "discussion-list-item",
        },
        recordMeta({
            author: discussion.expand.user,
            updated: discussion.updated,
            created: discussion.created,
        }),
        t.h3({}, discussion.title),
        markdown(discussion.content),
    );
}
