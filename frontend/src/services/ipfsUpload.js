export async function uploadEncryptedToBackend(ciphertext, filename) {
    const form = new FormData();
    form.append("file", new Blob([ciphertext]), filename);

    const res = await fetch("http://localhost:3001/upload", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upload failed: ${text}`);
    }

    return res.json(); // { cid }
  }