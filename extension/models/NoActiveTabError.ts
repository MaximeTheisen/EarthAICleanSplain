export default class NoActiveTabError extends Error {
    constructor(message: string = 'No active tab found') {
        super(message)
        this.name = 'NoActiveTabError'
    }
}
