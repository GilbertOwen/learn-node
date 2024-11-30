class ResponseError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.status = statusCode;
    }
}

export {
    ResponseError
};