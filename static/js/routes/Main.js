define(function(require) {
    var $ = require('jquery');
    var alertify = require('alertify');

    var Page = require('routes/Page');
    var Field = require('objects/Field');
    var Client = require('api/Client');
    var Templates = require('util/Templates');

    var Main = Class.create(Page, {

        onTrained: function() {},

        initialize: function($super, $root, modelConfig) {
            $super($root);
            var self = this;
            this.modelConfig = modelConfig;
            this.$mainPageField = $root.find('.main-page__field');
            this.$mainPageGenomes = $root.find('.main-page__genomes');
            this.$initButton = $root.find('.init-button');
            this.$stepButton = $root.find('.step-button');
            this.$burstButton = $root.find('.burst-button');
            this.field = new Field(modelConfig.size, this.$mainPageField, ['table table-bordered']);
            this.field.createField();

            this.bindEvents();
        },

        sizeChanged: function(data) {
            this.field.size = data.size;
            this.field.createField();
        },

        bindEvents: function() {
            var self = this;

            this.$initButton.click(function() {
                var $this = $(this);

                //self.onStepPerformed({
                //    genomes: [
                //        { genome: JSON.stringify([2,5,6]), fitness: 0.6 },
                //        { genome: JSON.stringify([]), fitness: 0.6 },
                //        { genome: JSON.stringify([]), fitness: 0.6 },
                //        { genome: JSON.stringify([]), fitness: 0.6 }
                //    ]
                //});

                $this.attr("disabled", true);
                Client.init(self.modelConfig.getConfig(), self.getFieldValues(), function(err, resp) {
                    $this.attr("disabled", false);
                    if (err) {
                        return alertify.error('Error happened: ' + JSON.stringify(err.data));
                    }
                    self.$stepButton.attr('disabled', false);
                    self.$burstButton.attr('disabled', false);
                });
            });

            this.$stepButton.click(function() {
                var $this = $(this);
                $this.attr("disabled", true);
                Client.step(self.getFieldValues(), function(err, resp) {
                    $this.attr("disabled", false);
                    if (err) {
                        return alertify.error('Error happened: ' + JSON.stringify(err.data));
                    }
                    self.onStepPerformed(resp);
                    console.log(resp);
                });
            });

            this.$burstButton.click(function() {
                var $this = $(this);
                $this.attr("disabled", true);
                Client.burst(self.getFieldValues(), function(err, resp) {
                    $this.attr("disabled", false);
                    if (err) {
                        return alertify.error('Error happened: ' + JSON.stringify(err.data));
                    }
                    self.onStepPerformed(resp);
                    console.log(resp);
                });
            });
        },

        getFieldValues: function() {
            return this.field.getValues();
        },

        onStepPerformed: function(data) {
            var genomesTable = Templates['genomes'](data);
            this.$mainPageGenomes.html(genomesTable);
        }
    });

    return Main;
});

