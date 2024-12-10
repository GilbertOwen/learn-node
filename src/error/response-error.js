class ResponseError extends Error {
    constructor(statusCode, message,errors = null) {
        super(message);
        this.errors = errors;
        this.status = statusCode;
    }
}

export {
    ResponseError
};