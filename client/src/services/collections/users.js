import toast from "../../components/toast";
import { pb } from "../../pb";
import { collections } from "./config";

export default async function getBlockedUsers({ data }) {
    try {
        data.loading = true;
        const filter = pb.filter("owner = {:owner}", {
            owner: pb.authStore.record.id,
        });
        const res = await pb
            .collection(collections.blocks)
            .getList(data.page, data.limit, {
                filter,
                expand: "blocking",
            });
        return res;
    } catch (err) {
        toast.error($("We had a problem getting your list of blocked users"));
    } finally {
        data.loading = false;
    }
}
