export const validate = (schema, request) => {
    const result = schema.parse(request);
    if (result.error) {
        throw result.error;
    } else {
        return result;
    }
};
