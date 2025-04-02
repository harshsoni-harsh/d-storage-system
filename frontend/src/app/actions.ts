"use server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3002";

export async function fetchCID({ cid }: { cid: string }) {
  const backendURL = `${API_BASE_URL}/storage/getById?cid=${cid}`;

  const res = await fetch(backendURL);
  if (!res.ok) throw new Error(`Error retrieving file: ${res.statusText}`);
  const data = await res.blob();
  return data;
}

export async function fetchPinnedFiles(): Promise<string[]> {
  const backendURL = `${API_BASE_URL}/storage/pinned-files`;
  const res = await fetch(backendURL);
  if (!res.ok) throw new Error("Failed to fetch pinned files");

  const data: string[] = await res.json();
  return data;
}

export async function uploadChunk(
  file: Blob,
  chunkIndex: number,
  totalChunks: number,
  fileName: string
): Promise<{ success: boolean; cid?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("chunkIndex", chunkIndex.toString());
    formData.append("totalChunks", totalChunks.toString());
    formData.append("fileName", fileName);

    const res = await fetch(`${API_BASE_URL}/storage/upload-chunk`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    console.log({ data });

    if (!res.ok) {
      throw new Error(data.error || `Failed to upload chunk ${chunkIndex + 1}`);
    }

    return { success: true, cid: data.cid };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function fetchPeers() {
  const res = await fetch(`${API_BASE_URL}/peers`);
  const data = await res.json();

  return data;
}

export async function connectPeer(addr: string) {
  const res = await fetch(`${API_BASE_URL}/peers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      peerId: addr,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to connect peer");
  } else {
    return data;
  }
}

export async function getIpfsAddress() {
  const res = await fetch(`${API_BASE_URL}/ipfs`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to connect backend");
  } else {
    return data;
  }
}

export async function getPeerStats(peerId: string) {
  const res = await fetch(`${API_BASE_URL}/peers?peerId=${peerId}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to connect backend");
  } else {
    return data;
  }
}

export async function getPeerLatency(peerId: string) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/peers/get-latency?peerId=${peerId}`
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to connect backend");
    } else {
      return data;
    }
  } catch (err) {
    console.error(err);
    return '-'
  }
}
