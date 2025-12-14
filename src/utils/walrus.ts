import { trackError } from './analytics';

const DEFAULT_AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space';

export type WalrusStoreResult = {
  blob_id: string;
  epochs?: number;
};

export function walrusBlobUrl(blobId: string, base?: string) {
  const host = base || DEFAULT_AGGREGATOR;
  return `${host}/v1/${blobId}`;
}

export async function storeToWalrus(
  data: Blob | File | string,
  opts?: { epochs?: number; base?: string }
): Promise<WalrusStoreResult> {
  try {
    const host = opts?.base || DEFAULT_AGGREGATOR;
    const url = `${host}/v1/store`;
    const body =
      typeof data === 'string'
        ? new Blob([data], { type: 'application/json' })
        : data;

    const form = new FormData();
    form.append('file', body);
    if (opts?.epochs) form.append('epochs', String(opts.epochs));

    const res = await fetch(url, {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Walrus store failed: ${res.status} ${text}`);
    }
    const json = (await res.json()) as WalrusStoreResult;
    if (!json.blob_id) throw new Error('Missing blob_id from Walrus response');
    return json;
  } catch (e: any) {
    trackError('walrus_store_error', e);
    throw e;
  }
}
