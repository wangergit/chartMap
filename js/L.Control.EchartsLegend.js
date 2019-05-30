L.Control.EchartsLegend = L.Control.extend({

    statics: {
        TITLE: '图例'
    },
    options: {
        position: 'bottomright',
    },
    initialize: function(options) {
        L.Control.prototype.initialize.call(this, options);

    },
    onAdd: function(map) {
        var className = 'leaflet-control';
        this._container = L.DomUtil.create('div', 'leaflet-bar');
        var link = L.DomUtil.create('div', className + '-echarts-legend', this._container);
        // link.href = '#';
        link.title = L.Control.EchartsLegend.TITLE;

        return this._container;
    },
    toggle: function() {
        if (this.handler.enabled()) {
            this.handler.disable.call(this.handler);
        } else {
            this.handler.enable.call(this.handler);
        }
    },
});



L.Control.echartsLegend = function(options) {
    return new L.Control.EchartsLegend(options);
};