define(function(require) {
    var $ = require('jquery');
    var _ = require('lodash');

    var Object = require('objects/Object');

    var ModelConfig = Class.create(Object, {

        INPUTS: {},

        LocalStorageKey: "modelConfig",

        initialize: function($root, initialConfig) {
            this.$root = $root || $('.model-config');
            this.initialConfig = initialConfig;
            this.config = initialConfig;
            this.$options = $root.find('.model-option');
            //this._jqFind('INPUTS');
            this.applyConfig(this.config);
        },

        getConfig: function() {
            var conf = {};
            _.forEach(this.$options, function(option) {
                var $option = $(option);
                conf[$option.attr('name')] = $option.val() || 0;
            });
            this.config = conf;
            return this.config;
        },

        applyConfig: function(config) {
            _.forEach(this.$options, function(option) {
                var $option = $(option);
                var value = config[$option.attr('name')];
                $option.val(value || "");
            });
        },

        toJSON: function() {
            if (this.config == null || typeof(this.config) == 'undefined') {
                this.config = this.getConfig();
            }
            return this.config;
        },

        save: function() {
            var config = this.getConfig();
            window.localStorage.setItem(this.LocalStorageKey, JSON.stringify(config));
        },

        restore: function() {
            var config = window.localStorage.getItem(this.LocalStorageKey);
            config = JSON.parse(config);
            if (config) {
                this.applyConfig(config);
            }
        },

        checkLocalStorage: function() {
            var config = window.localStorage.getItem(this.LocalStorageKey);
            return !!config;
        },

        removeSaved: function() {
            window.localStorage.removeItem(this.LocalStorageKey);
        }
    });

    return ModelConfig;
});