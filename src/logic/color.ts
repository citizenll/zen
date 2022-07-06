const getHash = (str: string, seed = 10) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
const getRandomColor = (str: string = '') => {
    const hash = getHash(str);
    let color = '#';
    for (let i = 0; i < 3; i++) {
        // get 7 bits in range, and cast them to hex, so we have 0..127 of rgb in hex for each color
        color += ('00' + (((hash >> (i * 7)) & 0b1111111) + 8).toString(16)).substr(-2);
    }
    return color;
}

export {
    getRandomColor, getHash
}