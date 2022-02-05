import CryptoJS from "crypto-js";

export function encryption(data) {
  const key = "aaaaaaaaaabbbbbb";
  const iv = "aaaaaaaaaabbbbbb";

  const keyutf = CryptoJS.enc.Utf8.parse(key);
  //console.log("키유티에프:", keyutf);
  const ivutf = CryptoJS.enc.Utf8.parse(iv);
  //console.log("아이브이유티에프:", ivutf);

  const encObj = CryptoJS.AES.encrypt(JSON.stringify(data), keyutf, {
    iv: ivutf,
  });
  //console.log("key : toString(CryptoJS.enc.Utf8)" + encObj.key.toString(CryptoJS.enc.Utf8));
  //console.log("iv : toString(CryptoJS.enc.Utf8)" + encObj.iv.toString(CryptoJS.enc.Utf8));
  //console.log("salt : " + encObj.salt);
  //console.log("ciphertext : " + encObj.ciphertext);

  const encStr = encObj + "";
  console.log("encStr : " + encStr);

  return encStr;
}