export const nanoid = (size = 12) => {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let id = '';
    const length = Math.max(4, size);

    // Use a larger buffer to avoid modulo bias (rejection sampling)
    while (id.length < length) {
        const randomValues = new Uint8Array(length * 2);
        crypto.getRandomValues(randomValues);

        for (let i = 0; i < randomValues.length && id.length < length; i++) {
            const byte = randomValues[i];
            // Only accept bytes that map evenly into the alphabet range to avoid bias
            // 256 % 62 = 8. So we reject values >= 256 - 8 = 248.
            if (byte < 248) {
                id += alphabet[byte % alphabet.length];
            }
        }
    }

    return id;
};
