export const nanoid = (size = 12) => {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let id = '';
    const length = Math.max(4, size);
    for (let i = 0; i < length; i += 1) {
        id += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return id;
};
