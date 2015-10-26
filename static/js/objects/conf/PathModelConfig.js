define(function(require) {
    var $ = require('jquery');
    var _ = require('lodash');
    var signals = require('signals');
    var ModelConfig = require('objects/conf/ModelConfig');

    var PathModelConfig = Class.create(ModelConfig, {
        ELEMS: {
            sizeChangerText: '.side-window__config__conf__size__text',
            sizeChangerButton: '.side-window__config__conf__size__apply'
        },

        sizeChanged: new signals.Signal(),
        size: 3,

        initialize: function($super, $root, initialConfig) {
            $super($root, initialConfig);
            this._jqFind('ELEMS', $root);

            var self = this;
            this.$ELEMS.sizeChangerButton.click(function() {
                self.size = parseInt(self.$ELEMS.sizeChangerText.val()) || 1;
                self._setInputs();
            });
            this.$ELEMS.sizeChangerText.val(this.size);
            this.getConfig();
            this._fireSizeChanged();
        },

        getConfig: function($super) {
            this.config = $super();
            this.config['crossover_prob'] = parseFloat(this.config['crossover_prob']) || 0;
            this.config['crossover_splits'] = parseInt(this.config['crossover_splits']) || 0;
            this.config['crossovers_count'] = parseInt(this.config['crossovers_count']) || 0;
            this.config['start_node'] = parseInt(this.config['start_node']) || 0;
            this.config['end_node'] = parseInt(this.config['end_node']) || 0;
            this.config['mutation_prob'] = parseFloat(this.config['mutation_prob']) || 0;
            this.config['population_size'] = parseInt(this.config['population_size']) || 0;
            this.config['selection_count'] = parseInt(this.config['selection_count']) || 0;
            return this.config;
        },

        applyConfig: function($super, config) {
            $super(config);
        },

        _setInputs: function(noFire) {
            if (this.$ELEMS) {
                this.$ELEMS.sizeChangerText.val(this.size || 3);
            }
            if (!noFire) {
                this._fireSizeChanged();
            }
        },

        _fireSizeChanged: function() {
            this.sizeChanged.dispatch({
                size: this.size
            });
        }
    });

    return PathModelConfig;

});