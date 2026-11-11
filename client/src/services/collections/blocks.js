import toast from "../../components/toast";
import { pb } from "../../pb";
import { $ } from "../../utils/i18n";
import { collections, userQueryParameters } from "./config";

export async function blockUser(user) {
    try {
        await pb.collection(collections.blocks).create({
            owner: pb.authStore.record.id,
            blocking: user.id,
        });
        await pb.collection(collections.users).authRefresh(userQueryParameters);
    } catch (err) {
        console.log(err);
        toast.error($("We had a problem blocking this user"));
    }
}

export async function unblockUser(blockId) {
    try {
        await pb.collection(collections.blocks).delete(blockId);
        await pb.collection(collections.users).authRefresh(userQueryParameters);
        toast.info($("User successfully unblocked"));
    } catch (err) {
        console.log(err);
        toast.error($("We had a problem unblocking this user"));
    }
}
