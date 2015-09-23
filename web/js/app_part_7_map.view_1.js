var map = Backbone.View.extend({

    el: '#main',
    parameters: {
        mapId: 'map',
        markerId: 'marker',
        polyId: 'polyline',
        circleId: 'circle',
        centerX: 47.219014,
        centerY: -1.553714,
        zoom: 12
    },

    initialize: function()
    {
        this.mapView = new ctpMap();
        this.helper = new ctpHelperView();
        var mapOptions = {
            'divId': this.parameters.mapId,
            'centerX': parseInt(this.parameters.centerX),
            'centerY': parseInt(this.parameters.centerY),
            'zoom': parseInt(this.parameters.zoom)
        };
        this.createMap(mapOptions);
        this.createMarkersOnMap();
        this.createPolylinesOnMap();
        this.createCirclesOnMap();
    },
    
    createMap: function(options)
    {
        this.helper.addStyleToElement('#'+ options.divId, 'height:300px; width:100%');
        var mapCollection = this.helper.createMapCollection(options);
        this.mapView.createMap(mapCollection);
    },
    
    createMarkersOnMap: function()
    {
        var mapOptions = {
            'divId': this.parameters.markerId,
            'centerX': parseInt(this.parameters.centerX),
            'centerY': parseInt(this.parameters.centerY),
            'zoom': parseInt(this.parameters.zoom),
            
        };
        this.createMap(mapOptions);
        // auto zoom
        this.helper.autoZoomActive(this.mapView.cid, 'markers:true');
        // create markers collection
        var markerCollection = new ctpMarkers([
            new ctpMarker({
                lat: parseFloat(47.021870),
                lon: parseFloat(-1.054070),
                isClickable: true,
                title: 'Le longeron',
                image: '../bundles/app/images/marker.png'
            }),
            new ctpMarker({
                lat: parseFloat(47.028070),
                lon: parseFloat(-0.942741),
                isClickable: false,
                title: 'Saint-Christophe-du-Bois',
                image: '../bundles/app/images/marker.png'
            })
        ]);
        this.mapView.markersOnMap(markerCollection);
    },
    
    createPolylinesOnMap: function()
    {
        var mapOptions = {
            'divId': this.parameters.polyId,
            'centerX': parseInt(this.parameters.centerX),
            'centerY': parseInt(this.parameters.centerY),
            'zoom': parseInt(this.parameters.zoom)
        };
        this.createMap(mapOptions);
        // auto zoom
        this.helper.autoZoomActive(this.mapView.cid, 'polylines:true');
        // create polylines collection
        var polylineCollection = new ctpPolylines([
            new ctpPolyline({
                path: [
                    {
                        'lat': 47.021870,
                        'lon': -0.942741
                    },
                    {
                        'lat': 47.011870,
                        'lon': -0.902741
                    },
                    {
                        'lat': 47.011770,
                        'lon': -0.902741
                    },
                    {
                        'lat': 47.020870,
                        'lon': -0.900741
                    },
                ]
            })
        ]);
        this.mapView.polylineOnMap(polylineCollection);
    },
    
    createCirclesOnMap: function()
    {
        var mapOptions = {
            'divId': this.parameters.circleId,
            'centerX': parseInt(this.parameters.centerX),
            'centerY': parseInt(this.parameters.centerY),
            'zoom': parseInt(this.parameters.zoom)
        };
        this.createMap(mapOptions);
        // auto zoom
        this.helper.autoZoomActive(this.mapView.cid, 'circles:true');
        // create circles collection
        var circleCollection = new ctpCircles([
            new ctpCircle({
                center: this.mapView.getMapCenter(),
                radius: parseInt(3000)
            })
        ]);
        this.mapView.circlesOnMap(circleCollection);
    }
});

CanalTP.jQuery(document).on('GmapReady', function(){
    new map();
});