import { loadConfig } from "@caffeineai/core-infrastructure";
import { StorageClient } from "@caffeineai/object-storage";
import { HttpAgent } from "@icp-sdk/core/agent";

/**
 * Object-storage bridge for `FileRef` fields.
 *
 * The generated bindings type `FileRef` as raw `Uint8Array` and do not run the
 * platform upload/download conversion for it, so the app performs both sides
 * here: uploads return the sentinel-prefixed reference bytes the backend
 * stores, and stored references resolve to a gateway direct URL for display.
 */

const SENTINEL = "!caf!";

let storageClientPromise: Promise<StorageClient> | null = null;

/** Lazily build the platform storage client from the deployed config. */
async function getStorageClient(): Promise<StorageClient> {
  if (!storageClientPromise) {
    storageClientPromise = (async () => {
      const config = await loadConfig();
      const agent = HttpAgent.createSync({ host: config.backend_host });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => undefined);
      }
      return new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
    })();
  }
  return storageClientPromise;
}

/** Upload a browser File and return the sentinel-prefixed reference bytes. */
export async function uploadFileRef(file: File): Promise<Uint8Array> {
  const client = await getStorageClient();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { hash } = await client.putFile(bytes, undefined, file.type, file.name);
  return new TextEncoder().encode(SENTINEL + hash);
}

/** Convert a stored reference into a displayable direct URL. */
export async function fileRefToUrl(ref: Uint8Array): Promise<string | null> {
  const text = new TextDecoder().decode(ref);
  if (!text.startsWith(SENTINEL)) return null;
  const client = await getStorageClient();
  return client.getDirectURL(text.slice(SENTINEL.length));
}
