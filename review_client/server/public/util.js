// 16진수의 값을 2진수 쉽게 바꾸기 위한 함수
// 16진수 값을 인자로 받는다.
const hexToBinary = (s) => {
  // 계산하는 시간을 줄이기 위해,
  // 16진수의 각 값에 해당하는 2진수 값을 미리 계산하여 lookup table를 만든다.
  const lookupTable = {
    '0': '0000', '1': '0001', '2': '0010', '3': '0011',
    '4': '0100', '5': '0101', '6': '0110', '7': '0111',
    '8': '1000', '9': '1001', 'a': '1010', 'b': '1011',
    'c': '1100', 'd': '1101', 'e': '1110', 'f': '1111'
  };

  // 2진수로 변환된 값을 담을 변수
  let ret = '';

  // 0부터 시작하여 인자의 길이 만큼 반복
  for (let i = 0; i < s.length; i = i + 1) {

    // s[0]  : 인자의 첫번째 글자 
    // s[1]  : 인자의 두번째 글자 
    // 인자의 각 글자에 해당하는 글자를 lookupTable 의 key에서 찾아 key에 해당하는 value를 가져온다
    if (lookupTable[s[i]]) {

      // 찾은 값을 이전에 찾은 값에 이어 나열한다. 
      ret += lookupTable[s[i]];

    } else {

      return null;
    }
  }

  //2진수로 변환된 값을 반환
  return ret;
};

module.exports = { hexToBinary };
