// upload to ifps Pinata server
export async function uploadEncryptedToBackend(ciphertext, filename) { // takes cyphertext and file name
    const form = new FormData();
    form.append("file", new Blob([ciphertext]), filename);

    const res = await fetch("http://localhost:3001/upload", {method: "POST",body: form,}); //using localhost for demo purposes

    if (!res.ok) {const text = await res.text();throw new Error(`Upload failed: ${text}`);}

    return res.json(); // { cid }
  }