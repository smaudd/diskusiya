import toast from "../../components/toast";
import { pb } from "../../pb";
import { collections, userQueryParameters } from "./config";

export async function blockUser(user) {
    try {
        const blocksInPlace = pb.authStore.record.expand.blocks_via_owner.blocks;
        if (blocksInPlace.includes(user.id)) {
            return;
        }
        await pb
            .collection(collections.blocks)
            .update(pb.authStore.record.expand.blocks_via_owner.id, {
                blocks: [...blocksInPlace, user.id],
            });
        await pb.collection(collections.users).authRefresh(userQueryParameters);
    } catch (err) {
        toast.error($("We had a problem blocking this user"));
    }
}

export async function unblockUser(user) {
    try {
        const filteredBlocks = pb.authStore.record.expand.blocks_via_owner.blocks.filter(
            (block) => block === user.id,
        );
        if (blocksInPlace.includes(user.id)) {
            return;
        }
        await pb
            .collection(collections.blocks)
            .update(pb.authStore.record.expand.blocks_via_owner.id, {
                blocks: filteredBlocks,
            });
        await pb.collection(collections.users).authRefresh(userQueryParameters);
    } catch (err) {
        toast.error($("We had a problem blocking this user"));
    }
}
