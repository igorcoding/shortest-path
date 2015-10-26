define(function(require) {
    var $ = require('jquery');
    var _ = require('lodash');
    require('prototype');

    return Class.create({

        initialize: function (pages) {
            this.pages = pages;
        },

        get: function(pageName) {
            return this.pages[pageName];
        },

        hideAll: function() {
            _.forOwn(this.pages, function(page, pageName) {
                page.hide();
            });
        },

        showAll: function() {
            _.forOwn(this.pages, function(page, pageName) {
                page.show();
            });
        },

        hideOne: function(pageName) {
            var page = this.pages[pageName];
            if (page) {
                page.hide();
            }
        },

        showOne: function(pageName) {
            var page = this.pages[pageName];
            if (page) {
                page.show();
            }
        },

        show: function(pageName) {
            this.hideAll();
            this.showOne(pageName);
        }
    });
});

