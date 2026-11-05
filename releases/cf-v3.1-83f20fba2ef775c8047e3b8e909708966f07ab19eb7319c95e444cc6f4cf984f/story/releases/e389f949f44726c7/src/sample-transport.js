/** Fetch/decode transport only. Callers retain cache, timing and playback ownership. */
export async function decodeLocalSample({url, context, fetcher = globalThis.fetch, signal, maxBytes = Infinity}) {
  const response = await fetcher(url, {signal});
  if (!response?.ok) throw new Error('Local audio recording unavailable');
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > maxBytes) throw new Error('Local audio recording exceeds byte budget');
  if (signal?.aborted) throw new Error('Local audio load cancelled');
  const buffer = await context.decodeAudioData(bytes);
  if (signal?.aborted) throw new Error('Local audio decode cancelled');
  return buffer;
}
