export const nanoid = (size = 12) => {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let id = '';
    const length = Math.max(4, size);
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i += 1) {
        id += alphabet[randomValues[i] % alphabet.length];
    }
    return id;
};
