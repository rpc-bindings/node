export class Registry<TSaved> {
    private readonly savedCallbacks = new Map<number, TSaved>();
    private lastId: number = 0;

    save(callback: TSaved): number {
        const newId = ++this.lastId;
        this.savedCallbacks.set(newId, callback);
        return newId;
    }

    get(id: number): TSaved {
        if (this.savedCallbacks.has(id)) {
            return this.savedCallbacks.get(id);
        }
        return null;
    }

    delete(id: number): void {
        if (this.savedCallbacks.has(id)) {
            this.savedCallbacks.delete(id);
        }
    }
}