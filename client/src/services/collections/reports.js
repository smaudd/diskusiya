import { t } from "shablon";
import toast from "../../components/toast";
import { pb } from "../../pb";
import { $ } from "../../utils/i18n";
import { collections } from "./config";
import { blockUser } from "./blocks";

const reportStatuses = {
    pending: "PENDING",
    resolved: "RESOLVED",
    ignored: "IGNORED",
};

export default async function reportContent({
    reason,
    discussion,
    reply,
    user,
    reporter,
    block,
}) {
    try {
        await pb.collection(collections.reports).create({
            reason,
            discussion,
            reply,
            user,
            reporter,
            status: reportStatuses.pending,
        });
        toast.info(
            t.div({ className: "flex flex-col gap-md" }, [
                t.span({}, $("Thanks for reporting this content.")),
                t.span({}, $("We will take a look and take some actions")),
                t.span({}, $("You can see the status of your report in your profile")),
            ]),
            { duration: 10000 },
        );
    } catch (err) {
        const { data } = err.data;
        if (
            [data.discussion.code, data.reply.code, data.user.code].includes(
                "validation_not_unique",
            )
        ) {
            toast.error($("You already reported this content"));
            return;
        }
        toast.error($("Something went wrong reporting this content"));
    }

    if (block) blockUser(user);
}
