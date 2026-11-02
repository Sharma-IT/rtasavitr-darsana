const DOCUMENT = /^RD_v(\d+)\.docx$/;

export function findDocument(filenames) {
  const documents = filenames.filter((name) => DOCUMENT.test(name));
  if (documents.length === 0) throw new Error('site/ has no RD_v<N>.docx');
  if (documents.length > 1) throw new Error(`site/ must hold exactly one document, found: ${documents.join(', ')}`);
  const [file] = documents;
  return { file, version: Number(DOCUMENT.exec(file)[1]) };
}

export function formatSize(bytes) {
  return `${(Math.round(bytes / 100000) / 10).toFixed(1)} MB`;
}

export function pagesLabel(pages) {
  return `${pages} ${pages === 1 ? 'page' : 'pages'}`;
}

export function render(template, values) {
  return template.replace(/\{\{(\w+)\}\}/g, (placeholder, key) => {
    if (!(key in values)) throw new Error(`template placeholder ${placeholder} has no value`);
    return values[key];
  });
}
