require.config({
    urlArgs: "_=",// + (new Date()).getTime(),
    baseUrl: "/static/js",
    paths: {
        jquery: "lib/jquery-2.1.4.min",
        lodash: "lib/lodash.min",
        fileinput: "lib/fileinput.min",
        tagsinput: "lib/bootstrap-tagsinput",
        prototype: "lib/prototype",
        signals: "lib/signals.min",
        handlebars: "lib/handlebars.runtime-v4.0.2",
        alertify: "lib/alertify.min",
        flot: "lib/jquery.flot.min"
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'lodash': {
            exports: '_'
        },
        fileinput: {
            exports: 'fileinput',
            deps: [
                'jquery'
            ]
        },
        tagsinput: {
            exports: 'tagsinput',
            deps: [
                'jquery'
            ]
        },
        prototype: {
            exports: 'Prototype'
        },
        signals: {
            exports: 'signals'
        },
        handlebars: {
            exports: 'Handlebars'
        },
        alertify: {
            exports: 'alertify'
        },
        flot: {
            deps: [
                'jquery'
            ],
            exports: 'flot'
        }
    }
});

define(function(require) {
    var $ = require('jquery');
    var alertify = require('alertify');

    var PathModelConfig = require('objects/conf/PathModelConfig');
    var MainPage = require('routes/Main');
    var Router = require('routes/Router');
    var Templates = require('util/Templates');

    window.modelConfig = new PathModelConfig($('.model-config'), {
        crossover_prob: 1,
        crossover_splits: 1,
        crossovers_count: 10,
        end_node: 4,
        mutation_prob: 1,
        population_size: 15,
        selection_count: 6,
        start_node: 1
    });

    window.router = new Router({
        main: new MainPage($('.main-page'), modelConfig)
    });

    modelConfig.sizeChanged.add(function(data) {
        console.log(data);
        router.get('main').sizeChanged(data);
    });

    $('.page-switcher').find('a').click(function() {
        var $this = $(this);
        var li = $this.parents('li');
        li.siblings().removeClass('active');
        li.addClass('active');

        var selectedPage = $this.data('page');
        router.show(selectedPage);
        return false;
    });

    $('.save-button').click(function() {
        modelConfig.save();
        //trainPage.fieldCollection.save();
        alertify.success('Saved');
        return false;
    });


    if (modelConfig.checkLocalStorage()) {
        alertify.confirm("There are saved data. Do you want to restore it?").set('title', "Restore data").set('labels', {
            ok: 'Yes',
            cancel: 'No'
        }).set('onok', function() {
            modelConfig.restore();
        }).set('oncancel', function() {
            modelConfig.removeSaved();
        });
    }


    window.DEBUG = true;
});