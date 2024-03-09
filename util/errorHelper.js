const {validationResult} = require("express-validator");


module.exports = {
    handleValidationErrors(req) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const validationError = new Error('Validation Failed, entered data is incorrect');
            validationError.statusCode = 422;
            validationError.data = errors.array();
            throw validationError;
        }
    },
    handleImageAttachmentErrors(req) {
        console.log("Req is : ,", req)
        if (!req.file) {
            const error = new Error("No Image Attached")
            error.statusCode = 422
            throw error
        }
    },
    handlePostNotFoundError(post)
    {
        if (!post) {
            const error = new Error("Post Not Found")
            error.statusCode = 404
            throw error
        }
    },
    handleInternalServerErrors(err, next)
    {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    },
    handleAuthorizationError(id, req, post)
    {
        if (id !== req.userId.toString()) {
            const error = new Error('Not Authorized!')
            error.statusCode = 403
            throw error
        }
    },
    handlePostCreationErrors(req)
    {
        this.handleValidationErrors(req)
        this.handleImageAttachmentErrors(req)
    }

}


