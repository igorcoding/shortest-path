define(function(require) {
    var $ = require('jquery');
    var _ = require('lodash');

    var Object = require('objects/Object');

    var Field = Class.create(Object, {

        ELEMS: {
            field: '.field'
        },

        CLASSES: {
            table: 'field__table',
            row: 'field__table__row',
            input: 'form-control'
        },

        //COLORS: {
        //    inactive: '#FFFFFF',
        //    active: '#337ab7'
        //},
        COLORS_ARR: [],

        enableLabelSwitch: true,
        enableEdit: true,
        id: null,
        extraClasses: [],
        editBottom: false,
        diagEdit: false,

        initialize: function(size, $root, extraClasses) {
            $root = $root || $(document);
            this.$root = $root;
            this.size = size;
            this.extraClasses = extraClasses;

            this._jqFind('ELEMS', $root);
            this.createField(true);
        },

        bindEvents: function() {
            var self = this;
            this.$inputs.on('change keyup paste input', function() {
                var $this = $(this);
                var $td = $this.parents('td');
                var value = $this.val();
                if (!self.editBottom) {
                    var i = $td.data('row');
                    var j = $td.data('col');
                    $(self.$inputs[j * self.size + i]).val(value);
                }
            });
        },

        createField: function(createTable) {
            var self = this;

            if (createTable) {
                this.$table = $("<table></table>").addClass(this.CLASSES.table);
            } else {
                this.$table = this.$root.find("." + this.CLASSES.table);
            }
            _.forEach(this.extraClasses, function (c) {
                self.$table.addClass(c);
            });
            this.$table.css({
                width: "auto"
            });

            this.$table.empty();

            {
                var $headerRow = $('<tr></tr>');
                $headerRow.append($('<td></td>'));
                for (var j = 1; j < this.size + 1; ++j) {
                    var $th = $('<th>' + j + '</th>');
                    $headerRow.append($th);
                }
                this.$table.append($headerRow);
            }


            for (var i = 0; i < this.size; ++i) {
                var $row = $('<tr></tr>');
                $row.addClass(this.CLASSES.row);

                var $th = $('<th>' + (i + 1) + '</th>');
                $row.append($th);
                for (var j = 0; j < this.size; ++j) {
                    var $input = $('<input type="text" value="0"/>');
                    $input.addClass(this.CLASSES.input);
                    $input.css({
                        width: "50px"
                    });

                    var $td = $('<td></td>');
                    $td.attr('data-row', i);
                    $td.attr('data-col', j);
                    $td.attr('data-value', 0);
                    $td.append($input);
                    $row.append($td);
                }
                this.$table.append($row);
            }
            //this.$table.css({width: (this.cols * 40) + 'px'});

            this.$root.html(this.$table);
            this.$rows = this.$table.find('.' + this.CLASSES.row);
            this.$cells = this.$rows.find('td');

            this.$inputs = this.$rows.find('input');

            //this.$cells.click(function() {
            //    if (self.enableEdit) {
            //        self.changeCellValue($(this));
            //    }
            //});
            this.triggerButtomEdit(this.editBottom);
            this.triggerDiagEdit(this.diagEdit);
            this.bindEvents();
        },

        getValues: function() {
            var values = [];
            _.forEach(this.$inputs, function(input) {
                var $input = $(input);
                values.push($input.val() || 0);
            });
            return values;
        },

        triggerButtomEdit: function(edit) {
            this.editBottom = edit;
            for (var row = 0; row < this.size; row++) {
                for (var col = 0; col < this.size; col++) {
                    if (col < row) {
                        var $el = $(this.$inputs[row * this.size + col]);
                        if (edit) {
                            $el.prop('disabled', false);
                        } else {
                            $el.prop('disabled', true);
                        }
                    }
                }
            }
        },

        triggerDiagEdit: function(edit) {
            this.diagEdit = edit;
            for (var row = 0; row < this.size; row++) {
                for (var col = 0; col < this.size; col++) {
                    if (col == row) {
                        var $el = $(this.$inputs[row * this.size + col]);
                        if (edit) {
                            $el.prop('disabled', false);
                        } else {
                            $el.prop('disabled', true);
                        }
                    }
                }
            }
        }

        //changeCellValue: function($cell, value) {
        //    if (value < 0 || value >= this.COLORS_ARR.length) {
        //        return console.error("value < 0 || value >= this.COLORS_ARR.length");
        //    }
        //
        //    var row = $cell.data('row');
        //    var col = $cell.data('col');
        //    var v = $cell.data('value');
        //    var new_value = value;
        //    if (typeof new_value == 'undefined' || new_value === null) {
        //        if (v == 0) {
        //            new_value = 1;
        //        } else {
        //            new_value = 0;
        //        }
        //    }
        //    var color = this.COLORS_ARR[new_value];
        //
        //    $cell.data('value', new_value);
        //    $cell.css({'background-color': color});
        //},

        //applyData: function(data) {
        //    if (data.length != this.$cells.length) {
        //        console.error("data.length != this.$cells.length");
        //        return;
        //    }
        //    var self = this;
        //    _.forEach(this.$cells, function(cell, i) {
        //        self.changeCellValue($(cell), data[i]);
        //    });
        //},

        //getData: function() {
        //    var data = [];
        //    _.forEach(this.$cells, function(cell) {
        //        data.push(parseInt($(cell).data('value')) || 0);
        //    });
        //    return data;
        //},

        //applyLabel: function(labelValue) {
        //    _.forEach(this.$ELEMS.fieldConfLabel.find('li').find('a'), function(a) {
        //        var $a = $(a);
        //        if ($a.data('value') == labelValue) {
        //            var li = $a.parents('li');
        //            li.siblings().removeClass('active');
        //            li.addClass('active');
        //        }
        //    });
        //},
        //
        //getLabel: function() {
        //    return this.$ELEMS.fieldConfLabel.find('li').filter('.active').find('a').data('value');
        //},

        //disable: function() {
        //    //this.enableEdit = false;
        //    //this.enableLabelSwitch = false;
        //    return this;
        //},
        //
        //enable: function() {
        //    //this.enableEdit = true;
        //    //this.enableLabelSwitch = true;
        //    return this;
        //},
        //
        //setTableElem: function($elem) {
        //    this.$table = $elem;
        //    //this.$rows = this.$table.find('.' + this.CLASSES.row);
        //    //this.$cells = this.$rows.find('td');
        //},
        //
        //removeTableElem: function() {
        //    this.$table.remove();
        //},
        //
        //getTableElem: function() {
        //    return this.$table;
        //},
        //
        //setLabelElem: function($elem) {
        //    this.$ELEMS.fieldConfLabel = $elem;
        //},
        //
        //removeLabelElem: function() {
        //    this.$ELEMS.fieldConfLabel.remove();
        //},
        //
        //getLabelElem: function() {
        //    return this.$ELEMS.fieldConfLabel;
        //},

        //clear: function() {
        //    var self = this;
        //    _.forEach(this.$cells, function(cell) {
        //        self.changeCellValue($(cell), 0);
        //    });
        //    this.$ELEMS.fieldConfLabel.find('li').removeClass('active');
        //}
    });

    return Field;
});