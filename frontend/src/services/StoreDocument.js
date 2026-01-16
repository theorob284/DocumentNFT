export function saveDocRecord(tokenId, record) {
  localStorage.setItem(`doc:${tokenId}`, JSON.stringify(record));
}

export function loadDocRecord(tokenId) {
  const raw = localStorage.getItem(`doc:${tokenId}`);
  return raw ? JSON.parse(raw) : null;
}

export function listDocRecords() {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith("doc:"));
  return keys
    .map((k) => JSON.parse(localStorage.getItem(k)))
    .sort((a, b) => (a?.createdAt || "").localeCompare(b?.createdAt || ""));
}
