/* eslint-disable */

// @ts-ignore
export function fisherYates(array) {
  var count = array.length,
    randomnumber,
    temp;
  while (count) {
    randomnumber = Math.random() * count-- | 0;
    temp = array[count];
    array[count] = array[randomnumber];
    array[randomnumber] = temp
  }
}
/* eslint-enable */
