define(function(require) {
    var _ = require('lodash');
    var $ = require('jquery');
    var RequestError = require('api/RequestError');
    require('prototype');

    var Client = Class.create({

        init: function (config, graph, cb) {
            var self = this;
            cb = cb || _.noop();

            var payload = {
                config: config,
                graph: graph
            };
            self._post('/api/init', payload, self._defaultCb(cb));
        },

        step: function (graph, cb) {
            var self = this;
            cb = cb || _.noop();

            var payload = {
                graph: graph
            };

            self._post('/api/step', payload, self._defaultCb(cb));
        },

        burst: function (graph, cb) {
            var self = this;
            cb = cb || _.noop();

            var payload = {
                graph: graph
            };

            self._post('/api/burst', payload, self._defaultCb(cb));
        },

        _get: function (url, data, callbacks) {
            var self = this;
            $.ajax({
                type: "GET",
                contentType: "application/json",
                url: url,
                data: data
            })
                .done(function (msg) {
                    self.logData(url, msg);
                    callbacks.onComplete(msg);
                })
                .fail(function (error) {
                    callbacks.onError(error);
                });
        },
        _post: function (url, data, callbacks) {
            var self = this;
            $.ajax({
                type: "POST",
                contentType: "application/json",
                url: url,
                dataType: "json",
                data: JSON.stringify(data)
            })
                .done(function (msg) {
                    self.logData(url, msg);
                    callbacks.onComplete(msg);
                })
                .fail(function (error) {
                    callbacks.onError(error);
                });
        },
        _postForm: function (url, data, callbacks) {
            var self = this;
            $.ajax({
                type: "POST",
                url: url,
                dataType: "json",
                data: data
            })
                .done(function (msg) {
                    self.logData(url, msg);
                    callbacks.onComplete(msg);
                })
                .fail(function (error) {
                    callbacks.onError(error);
                });
        },

        logData: function (url, res) {
            console.log("[" + url + "] Message received: ", res);
        },

        _defaultCb: function (cb) {
            return {
                onError: function (res) {
                    cb(new RequestError(res));
                },
                onComplete: function (res) {
                    if (res.status == "ok") {
                        cb(null, res.data);
                    } else {
                        cb(new RequestError(res, true), null);
                    }
                }
            };
        },
    });

    return new Client();
});

