export class SavedCall {
    constructor(public resolve: (...args: any[]) => any, public reject: (...args: any[]) => any) {

    }
}