export const nanoid = (size = 12) => {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let id = '';
    const length = Math.max(4, size);

    // Use a larger buffer to avoid modulo bias (rejection sampling)
    // We need 'length' characters.
    // We'll generate a batch of random bytes and filter them.

    while (id.length < length) {
        const randomValues = new Uint8Array(length * 2); // Fetch more than needed
        crypto.getRandomValues(randomValues);

        for (let i = 0; i < randomValues.length && id.length < length; i++) {
            const byte = randomValues[i];
            // Only accept bytes that map evenly into the alphabet range to avoid bias
            // 256 % 62 = 8. So we reject values >= 256 - 8 = 248.
            // 248 is the largest multiple of 62 less than 256.
            if (byte < 248) {
                id += alphabet[byte % alphabet.length];
            }
        }
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i += 1) {
        id += alphabet[randomValues[i] % alphabet.length];
    }

    return id;
};
