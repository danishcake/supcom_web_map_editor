/**
 * string to ASCII array helper.
 * @param {string} str String to translate
 * @returns {array} An array of ASCII characters. No null terminator is used
 */
export const sc_string_to_ascii_array = function(str: string): number[] {
  let arr: number[] = [];
  for (let i = 0; i < str.length; i++) {
    arr.push(str.charCodeAt(i));
  }
  return arr;
};