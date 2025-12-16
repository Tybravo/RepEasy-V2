
import { Transaction } from '@mysten/sui/transactions';
import {
    REPEASY_PACKAGE_ID,
    DAPP_REGISTRY_ID,
    CLOCK_OBJECT_ID
} from '../config/repeasy';

export const verifyDapp = async (
    name: string,
    domainUrl: string,
    twitterUsername: string,
    bannerBlobId: string,
    iconBlobId: string,
    descriptionBlobId: string,
) => {
    const tx = new Transaction();

    tx.moveCall({
        target: `${REPEASY_PACKAGE_ID}::repeasy_verify::verify_dapp`,
        arguments: [
            tx.object(DAPP_REGISTRY_ID),
            tx.pure.string(name),
            tx.pure.string(domainUrl),
            tx.pure.string(twitterUsername),
            tx.pure.string(bannerBlobId),
            tx.pure.string(iconBlobId),
            tx.pure.string(descriptionBlobId),
            tx.object(CLOCK_OBJECT_ID),
        ],
    });

    return tx;
};  
