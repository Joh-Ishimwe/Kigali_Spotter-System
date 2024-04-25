// errors/index.js or customErrors.js

class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.name = "UnauthorizedError";
        this.statusCode = 401; // Unauthorized status code
    }
}

export { UnauthorizedError };
