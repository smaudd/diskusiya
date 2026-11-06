import { t } from "shablon";
import recordMeta from "./recordMeta";
import markdown from "./markdown";

export default function discussionCard(discussion) {
    return t.a(
        {
            href: `/d/${discussion.slug}`,
            className: "discussion-list-item",
        },
        t.h3({}, discussion.title),
        recordMeta({
            author: discussion.expand.user.name,
            updated: discussion.updated,
            created: discussion.created,
        }),
        markdown(discussion.content),
    );
}
