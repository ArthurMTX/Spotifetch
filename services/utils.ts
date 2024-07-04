export function convertDuration(durationMs: number): string {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m${seconds}s`;
}

export function convertDurationTotal(durationMs: number): string {
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    if (hours > 0) {
        return `${hours}h${minutes}m${seconds}s`;
    }
    return `${minutes}m${seconds}s`;
}
