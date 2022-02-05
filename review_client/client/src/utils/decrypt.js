import CryptoJS from "crypto-js";

export function decryption(encStr) {
  const key = "aaaaaaaaaabbbbbb";
  const iv = "aaaaaaaaaabbbbbb";

  const keyutf = CryptoJS.enc.Utf8.parse(key);
  //console.log("키유티에프:", keyutf);
  const ivutf = CryptoJS.enc.Utf8.parse(iv);
  //console.log("아이브이유티에프:", ivutf);

  //CryptoJS AES 128 복호화
  const decObj = CryptoJS.AES.decrypt(
    { ciphertext: CryptoJS.enc.Base64.parse(encStr) },
    keyutf,
    { iv: ivutf }
  );
  //console.log("decObj가 나올라나", decObj);

  const decStr = CryptoJS.enc.Utf8.stringify(decObj);
  //const parsedDecStr = JSON.parse(decStr)
  console.log("decStr : " + decStr);

  return decStr;
}
