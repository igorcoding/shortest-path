define(function(require) {
    var $ = require('jquery');
    require('prototype');

    var RequestError = Class.create({
        Type: {
            None: 0,
            ApiError: 1,
            ServerError: 2
        },
        errorType: 0,
        data: null,
        httpStatus: null,

        initialize: function(resp, apiError) {
            if (!apiError) {
                this.httpStatus = resp.status;
                if (resp.responseJSON != null) {
                    this.errorType = this.Type.ApiError;
                    this.data = resp.responseJSON;
                } else {
                    this.errorType = this.Type.ServerError;
                    this.data = resp.responseText;
                }
            } else {
                this.errorType = this.Type.ApiError;
                this.data = resp;
            }

            console.error(this);
        },

        isServerError: function() {
            return this.errorType == this.Type.ServerError;
        },

        isApiError: function() {
            return this.errorType == this.Type.ApiError;
        },

        getData: function() {
            return this.data;
        },

        getHttpStatus: function() {
            return this.httpStatus;
        }
    });

    return RequestError;
});

