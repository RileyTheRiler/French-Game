export const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Never';

    const now = Date.now();
    const diff = now - timestamp;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return 'just now';
    if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
    if (diff < day) return `${Math.floor(diff / hour)}h ago`;
    if (diff < 30 * day) return `${Math.floor(diff / day)}d ago`;

    return new Date(timestamp).toLocaleDateString();
};

export const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
};
