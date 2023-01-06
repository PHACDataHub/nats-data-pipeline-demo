
export function replaceNonJetstreamCompatibleCharacters(filename){
    // Jeststream subjects must only contain A-Z, a-z, 0-9, `-`, `_`, `/`, `=` or `.` and cannot start with `.`
// This replaces these characters with '_' (for now)
// Need to use something like this as want to use filename as part of the subject
  const charactersReplaced = filename.replace(/[^a-z-\d_/=.]/gi, "_").replace(' ', '_');
  return charactersReplaced
}

export function capitalize(object) { 
  // https://www.quora.com/How-do-I-capitalize-keys-and-values-in-JSON-object-recursively
 var isArray = Array.isArray(object); 
 for (let key in object) { 
   let value = object[key]; 
   let newKey = key; 
   if (!isArray) { // if it is an object 
     delete object[key]; // firstly remove the key 
     newKey = key.toUpperCase(); // secondly generate new key (capitalized) 
   } 
   let newValue = value; 
   if (typeof value != "object") { // if it is not an object (array or object in fact), stops here 
     if (typeof value == "string") { 
       newValue = value.toUpperCase(); // if it is a string, capitalize it 
     } 
   } else { // if it is an object, recursively capitalize it 
     newValue = capitalize(value); 
   } 
   object[newKey] = newValue; 
 } 
 return object; 
} 
