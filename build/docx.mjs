import { inflateRawSync } from 'node:zlib';

// Offsets follow the ZIP application note (PKWARE APPNOTE.TXT, sections 4.3.7, 4.3.12, 4.3.16).
const END_OF_CENTRAL_DIRECTORY = 0x06054b50;
const DEFLATED = 8;

function findEndOfCentralDirectory(zip) {
  for (let at = zip.length - 22; at >= 0; at -= 1) {
    if (zip.readUInt32LE(at) === END_OF_CENTRAL_DIRECTORY) return at;
  }
  throw new Error('not a zip archive');
}

function* centralEntries(zip) {
  const end = findEndOfCentralDirectory(zip);
  const count = zip.readUInt16LE(end + 10);
  let at = zip.readUInt32LE(end + 16);
  for (let i = 0; i < count; i += 1) {
    const nameLength = zip.readUInt16LE(at + 28);
    yield {
      name: zip.toString('utf8', at + 46, at + 46 + nameLength),
      method: zip.readUInt16LE(at + 10),
      localOffset: zip.readUInt32LE(at + 42),
    };
    at += 46 + nameLength + zip.readUInt16LE(at + 30) + zip.readUInt16LE(at + 32);
  }
}

// A deflate stream marks its own end (RFC 1951, section 3.2.3: BFINAL and the end-of-block code), so the entry's size field is not needed.
function readEntry(zip, name) {
  const entry = centralEntries(zip).find((e) => e.name === name);
  if (!entry) throw new Error(`docx has no ${name}`);
  if (entry.method !== DEFLATED) throw new Error(`${name} uses compression method ${entry.method}, expected deflate`);
  const local = entry.localOffset;
  return inflateRawSync(zip.subarray(local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28)));
}

export function pageCount(docx) {
  const match = /<Pages>(\d+)<\/Pages>/.exec(readEntry(docx, 'docProps/app.xml').toString('utf8'));
  if (!match) throw new Error('docProps/app.xml has no <Pages> count');
  return Number(match[1]);
}
