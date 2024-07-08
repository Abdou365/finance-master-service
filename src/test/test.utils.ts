export const wait = async (time? : number) => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
        resolve();
        }, time || 1000);
    });
}