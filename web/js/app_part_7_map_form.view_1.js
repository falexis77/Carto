var map = Backbone.View.extend({

    el: '#main',
    parameters: {
        id: 'map',
        centerX: 47.219014,
        centerY: -1.553714,
        zoom: 12
    },

    initialize: function()
    {
        this.mapView = new ctpMap();
        this.helper = new ctpHelperView();
        this.helper.addStyleToElement('#'+ this.parameters.id, 'height:300px; width:100%');
        var mapCollection = this.helper.createMapCollection({
            'divId': this.parameters.id,
            'centerX': parseInt(this.parameters.centerX),
            'centerY': parseInt(this.parameters.centerY),
            'zoom': parseInt(this.parameters.zoom)
        });
        this.mapView.createMap(mapCollection);
        //return new ctpInitMaps([new ctpInitMap(createOpts)]);
    }
});
CanalTP.jQuery(document).on('GmapReady', function(){
    new map();
});