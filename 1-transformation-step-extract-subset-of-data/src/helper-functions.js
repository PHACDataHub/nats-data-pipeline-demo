import { JSONCodec } from 'nats';
const jc = JSONCodec();

export function replaceNonJetstreamCompatibleCharacters(filename){
    // Jeststream subjects must only contain A-Z, a-z, 0-9, `-`, `_`, `/`, `=` or `.` and cannot start with `.`
// This replaces these characters with '_' (for now)
// Need to use something like this as want to use filename as part of the subject
  const charactersReplaced = filename.replace(/[^a-z-\d_/=.]/gi, "_").replace(' ', '_');
  return charactersReplaced
}

