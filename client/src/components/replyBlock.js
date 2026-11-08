import { t } from "shablon";
import { $ } from "../utils/i18n";
import recordMeta from "./recordMeta";
import markdown from "./markdown";

export default function replyBlock({ reply, className }, children) {
    let blocks = [
        recordMeta({
            author: reply?.expand?.user,
            updated: reply?.updated,
            created: reply?.created,
        }),
        markdown(reply.content),
    ];
    if (reply.deleted) {
        blocks = t.div({ className: "flex flex-col gap-md" }, [
            t.span(
                {
                    className: "font-italic bold",
                },
                `(${$("deleted")})`,
            ),
            t.span(
                {
                    className: "text-xs font-italic bold",
                },
                $("deleted"),
            ),
        ]);
    }
    return t.div(
        {
            className: className,
            id: `reply-${reply.id}`,
        },
        blocks,
        children,
    );
}
