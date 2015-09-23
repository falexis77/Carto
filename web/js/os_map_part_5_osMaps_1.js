/**
 * Library OpenStreetMap
 * Author RNE
 * CanalTP - 2013
 * @type @exp;ctpLibView@call;extend|@exp;ctp@pro;libMap@call;extend
 */
var ctpMap = ctpLibView.extend({

    initialize: function()
    {
        // Clone des parametres de la vue
        this.parameters = _.extend({}, this.parameters);
        CanalTP.lib.map.config[this.cid] = CanalTP.lib.map.config[this.cid] || {};
        CanalTP.lib.map.config[this.cid].polylines = CanalTP.lib.map.config[this.cid].polylines || {};
        CanalTP.lib.map.config[this.cid].markers = CanalTP.lib.map.config[this.cid].markers || {};
        CanalTP.lib.map.config[this.cid].circles = CanalTP.lib.map.config[this.cid].circles || {};
        CanalTP.lib.map.wrapper = CanalTP.lib.map.wrapper || {};
        CanalTP.lib.map.wrapper.api = OpenLayers;
        CanalTP.lib.map.wrapper.viewer = OpenLayers.Map;
        CanalTP.lib.map.wrapper.setZoom = 'zoomTo';
        CanalTP.lib.map.wrapper.latLon = OpenLayers.LonLat;
        CanalTP.lib.map.wrapper.latLngBounds = OpenLayers.Bounds;
        CanalTP.lib.map.wrapper.boundsCenter = 'getCenterLonLat';
        CanalTP.lib.map.wrapper.fitBounds = 'zoomToExtent';
        CanalTP.lib.map.wrapper.closePopup = 'hide';
        CanalTP.lib.map.wrapper.geocodeResult = 'display_name';
        CanalTP.lib.map.wrapper.addListener = this.rewriteEvent;
        CanalTP.lib.map.wrapper.addDomListener = this.returnFalse;
        CanalTP.lib.map.wrapper.trigger = this.rewriteEvent;
        CanalTP.lib.map.wrapper.addListenerEvent = this.rewriteEvent;
        CanalTP.lib.map.wrapper.clearListeners = this.returnFalse;
        CanalTP.lib.map.wrapper.removeListener = OpenLayers.Event.stopObservingElement;
        CanalTP.lib.map.wrapper.overlay = OpenLayers.Popup;
        CanalTP.lib.map.wrapper.geocodeUrl = 'http://nominatim.openstreetmap.org/reverse';
        CanalTP.lib.map.wrapper.bounce = this.returnFalse;
        CanalTP.lib.map.wrapper.getLat = this.ctpGetLat;
        CanalTP.lib.map.wrapper.getLon = this.ctpGetLon;
    },

    /**
     * Function return false in order to keep the same structure as gMapsjs
     */
    returnFalse: function()
    {
        return false;
    },

    /**
     * Function wrapper to get lat
     * @param {object} point
     * @param {string} action - 'reverse' retransform the coords
     */
    ctpGetLat: function(point, action) {
        var clone = point.clone();
        if (action === 'reverse' && point.transformation === 'done') {
            clone.transform(
                new OpenLayers.Projection("EPSG:900913"),
                new OpenLayers.Projection("EPSG:4326")
            );
        }
        return clone.lat;
    },

    /**
     * Function wrapper to get lon
     * @param {object} point
     * @param {string} action - 'reverse' retransform the coords
     */
    ctpGetLon: function(point, action) {
        var clone = point.clone();
        if (action === 'reverse' && point.transformation === 'done') {
            clone.transform(
                new OpenLayers.Projection("EPSG:900913"),
                new OpenLayers.Projection("EPSG:4326")
            );
        }
        return clone.lon;
    },

    /**
     * Function to rewrite the events listener for OpenLayers
     * @param {Object} obj map
     * @param {String} type type d'evenement
     * @param {Function} fn function callback
     */
    rewriteEvent: function(obj, type, fn)
    {
        obj = (obj[this.cid] !== undefined) ? obj[this.cid] : obj;
        var events = (obj.events !== undefined) ? obj.events : obj.layer.events;
        events.register(type, obj, function(event){
            fn(event);
        });
    },

    /****************************************    INITIALIZE MAP   ********************************/
    /**
     * Function to display the map
     * @param {string} id map id
     * @param {object} options map parameters
     */
    displayMap: function(id , options)
    {
        var maps = [];
        var controls = this.addControls();
        var map = new OpenLayers.Map({
            div: id,
            projection: new OpenLayers.Projection("EPSG:900913"),
            controls: controls
        });
        CanalTP.jQuery(id).trigger('mapCreated');
        // openStreetMap is the default layer
        var arrayOSM = [
            "http://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
            "http://b.tile.openstreetmap.org/${z}/${x}/${y}.png"
        ];
        var optionsOSM = {
            attribution: Translator.trans('map.osm.copyright')
        }
        maps.push(new OpenLayers.Layer.OSM(Translator.trans('map.osm.layer.name'), arrayOSM, optionsOSM));
        // ign layers
        if (typeof(CanalTP.lib.map.config.ign.key) !== 'undefined'
            && typeof(CanalTP.lib.map.config.ign.url) !== 'undefined') {
            var query = "/geoportail/wmts?SERVICE=WMTS&REQUEST=GetTile";
            var url = CanalTP.lib.map.config.ign.url + "/" + CanalTP.lib.map.config.ign.key + query;
            var ign_options = {
                name: Translator.trans('map.ign.layer_carte.name'),
                url: url,
                layer: "GEOGRAPHICALGRIDSYSTEMS.MAPS",//couche disponible sur mon contrat APi Géoportail
                matrixSet: "PM",
                style: "normal",
                numZoomLevels: 19,
                group : "IGN",
                attribution: Translator.trans('map.ign.copyright')
            };
            maps.push(new OpenLayers.Layer.WMTS(ign_options));

            // Changement des options nécessaires pour la couche ortho
            ign_options.name = Translator.trans('map.ign.layer_aerienne.name');
            ign_options.layer = "ORTHOIMAGERY.ORTHOPHOTOS";
            ign_options.numZoomLevels = 20;
            maps.push(new OpenLayers.Layer.WMTS(ign_options));
        }
        map.addLayers(maps);
        // center map
        var point = this.coordTransformation(options.center);
        map.setCenter(point, options.zoom);
        // add Vectors - each map's element have a vector
        var vector_markers = new OpenLayers.Layer.Vector( "marker", {
            rendererOptions: { zIndexing: true }
        });
        var vector_circles = new OpenLayers.Layer.Vector( "circle", {
            rendererOptions: { zIndexing: true }
        });
        var vector_polylines = new OpenLayers.Layer.Vector( "polyline", {
            rendererOptions: { zIndexing: true }
        });
        var vector_draggable = new OpenLayers.Layer.Vector( "draggable", {
            rendererOptions: { zIndexing: true }
        });
        vector_draggable.id = 'draggable';
        vector_markers.id = "marker";
        vector_circles.id = "circle";
        vector_polylines.id = "polyline";
        map.addLayers([vector_markers, vector_circles, vector_polylines, vector_draggable]);
        this.addAccessibility();
        map.Z_INDEX_BASE.Popup = 1000;
        return map;
    },

    /**
     * Function to add accessibility element
     */
    addAccessibility: function()
    {
        CanalTP.jQuery('.baseLbl').html(Translator.trans('map.osm.title'));
        CanalTP.jQuery('.olAlphaImg').attr('alt', 'olAlphaImg');
        CanalTP.jQuery('.olTileImage').attr('alt', 'olTileImage');
        CanalTP.jQuery('.olButton').each(function(){
           var that = CanalTP.jQuery(this);
           var value = that.val();
           var name = that.attr('name');
           that.attr('label', name);
           that.attr('title', value);
        });
    },

    /**
     * Function to add map controls
     */
    addControls: function()
    {
        var controls = [
            new OpenLayers.Control.Navigation(),
            new OpenLayers.Control.PanZoom(),
            new OpenLayers.Control.LayerSwitcher(),
            new OpenLayers.Control.ScaleLine(),
            new OpenLayers.Control.OverviewMap(),
            new OpenLayers.Control.Attribution()
        ];

        // Control for caching image tiles in the browser’s local storage
        // doesn't work for IE 9 .
        if (this.getMsieVersion() != 9) {
        	controls.push(new OpenLayers.Control.CacheWrite());
        	controls.push(new OpenLayers.Control.CacheRead());
        }

        return controls;
    },

    /**
     * Function to get the positions lat and lon
     * @param {number} x coordinates
     * @param {number} y coordinates
     */
    getLatLon: function(x, y)
    {
        return this.coordTransformation(new OpenLayers.LonLat(y, x));
    },

    /**
     * Function to resize a map
     * Note openLayers dont need to resize map when switch tabs
     * @param {object} map
     */
    resizeMap: function(map)
    {
        map.updateSize();
    },

    /************************************     INFOBULLES    **************************************/
    /**
     * Fonction permettant de creer une infobulle
     * @param {object} layer : parametres infobulles
     * @param {string} type type of vector layer
     */
    displayInfobulle: function(layer, type)
    {
        var feature = this.parameters.map[this.cid].getLayer(type).getFeatureById(
            layer.get('mapElement').id
        );
        if (feature !== undefined && feature !== null) {
            feature.attributes.mapElement = layer;
            var clicMarkerControl = new OpenLayers.Control.SelectFeature(
                feature.layer, {
                    scope: this,
                    clickFeature: function(feature) {
                        var mapElement = feature.attributes.mapElement;
                        this.scope.manageDisplayInfobubble();
                        this.scope.parameters.preRenderInfoBubble(mapElement);
                        var popup = this.scope.createPopup(
                            feature.geometry.getBounds().getCenterLonLat(),
                            mapElement.get('objInfobulle').contentHTML,
                            mapElement.get('objInfobulle').maxSize
                        );
                        feature.popup = popup;
                        this.scope.parameters.map[this.scope.cid].events.triggerEvent(
                             this.scope.parameters.triggerInfobubbleEvent,
                             popup
                         );
                        this.scope.parameters.map[this.scope.cid].addPopup(popup);
                        this.scope.parameters.currentInfoBubble[this.scope.cid] = popup;
                    }
                }
            );
            this.parameters.map[this.cid].addControl(clicMarkerControl);
            clicMarkerControl.activate();
        }
    },

    /**
     * Fonction permettant de setter les valeurs des options
     * @param {object} iOptions : parametres infobulles
     */
    setInfobulleOptions: function(iOptions)
    {
        iOptions = _.extend({}, CanalTP.lib.map.models.infobulle.prototype.defaults, iOptions);
         return this.createPopup(
            iOptions.point,
            iOptions.iContent,
            new OpenLayers.Size(iOptions.iMaxWidth, iOptions.iMaxHeight)
        );
    },

    /**
     * Function used by osMaps to create popup
     * This function is not overridable
     * @param {object} pos position of popup
     * @param {string} content html
     * @param {object} maxSize openLayers size
     */
    createPopup: function(pos, content, maxSize)
    {
        var popup = new OpenLayers.Popup.FramedCloud("popup", pos, null, content, null, true);
        popup.panMapIfOutOfView = true;
        popup.autoSize = true;
        popup.maxSize = maxSize;
        // these 2 elements are added in order to keep the same structure as Google maps
        popup.position = popup.lonlat;
        popup.content_ = popup.contentDiv;
        return popup;
    },

    /**
     * Function to display infobulle on map
     * @param {object} object map element
     * @param {string} type type of element
     */
    infobulleOnMap: function(object, type)
    {
        this.displayInfobulle(object, type);
    },

    /***************************************      MARKERS     ************************************/
    /**
     * Function to add zoom event on markers
     * @param {object} collection collection of element
     * @param {string} type type of element
     */
    markerZoomEvent: function(type, collection)
    {
        if (type === 'marker' && collection.issuer !== 'proximity') {
            var that = this;
            this.parameters.map[this.cid].events.register(
                'zoomend',
                this.parameters.map[this.cid],
                function(){
                    that.manageDisplayMapObject(collection, type);
                }
            );
        }
    },

    /**
     * Function to add dragend event on markers
     * Function not use in scope but do not delete it because it's a common function
     * between gmaps and osmap, function called by libView
     * @param {string} type
     * @param {object} collection
     */
    markerDragEndEvent: function(type, collection)
    {
        return false;
    },


    /**
     * Function to add dragend event on markers
     * @param {object} feature
     */
    dragComplete: function(feature)
    {
        var clone = feature.clone();
        clone.geometry.transform(
            new OpenLayers.Projection("EPSG:900913"),
            new OpenLayers.Projection("EPSG:4326")
        );
        var point = {
            'lat': clone.geometry.y,
            'lon': clone.geometry.x
        };
        CanalTP.jQuery.ajax({
            url: CanalTP.lib.map.wrapper.geocodeUrl,
            data: {format: "json", lat: clone.geometry.y, lon: clone.geometry.x},
            context: this,
            success: function ( data ) {
                if (data !== undefined) {
                    var iOptions = this.manageGeolocScenario([data], point);
                    iOptions['id'] = clone.attributes.id;
                    this.parameters.map[this.cid].events.triggerEvent(
                        'dragend', iOptions
                    );
                }
            }
        });
    },
    
    /**
     * Function to manage cluster (not available yet for osm)
     * @param {object} map used for gm
     * @param {array} opt_markers used for gm
     * @param {object} opt_options used for gm
     */
    markerClusterer: function(map, opt_markers, opt_options)
    {
        return false;
    },
    /**********************************       MAP EVENTS       ***********************************/
    /**
     *  Retourne les coordonnées d'un point en fonction d'un événement (clic, ...)
     *  @param {object} event
     */
    getCoords: function(event)
    {
    	var position = this.parameters.map[this.cid].getLonLatFromPixel(event.xy);
        position.transform(
            new OpenLayers.Projection("EPSG:900913"),
            new OpenLayers.Projection("EPSG:4326")
        );
        return {'position': position, 'lat': position.lat, 'lon': position.lon};
    },

    /**
     * Function to get the position into the gecode result
     * @param {object} result geocode result
     */
    getGeocodePoint: function(result)
    {
        return this.getLatLon(result.lat, result.lon);
    },

    /**
     * Retourne le géocode d'un point en fonction d'un événement (clic, ...)
     * @param {object} point object de latLng(google)
     */
    getGeocode: function(point)
    {
        if (this.parameters.map[this.cid].zoom > CanalTP.lib.map.config.reverse_location.min_zoom) {
            OpenLayers.Element.addClass(this.parameters.map[this.cid].viewPortDiv, "olCursorWait");
            CanalTP.jQuery.ajax({
                type: 'GET',
            	url: CanalTP.lib.map.wrapper.geocodeUrl,
            	dataType: 'jsonp',
            	jsonp: 'json_callback',
            	data: { format: "json", lat: point.lat, lon: point.lon, zoom: 18 },
                context: this,
                success: function ( data ) {
                    OpenLayers.Element.removeClass(
                        this.parameters.map[this.cid].viewPortDiv,
                        "olCursorWait"
                    );
                    if (data !== undefined) {
                        point.lat = data.lat;
                        point.lon = data.lon;
                        var iOptions = this.manageGeolocScenario([data], point);
                        this.parameters.map[this.cid].events.triggerEvent(
                            this.parameters.triggerGeoCustom, iOptions
                        );
                        if (CanalTP.lib.map.config.geocode.addPopin === true) {
                            var infoBubble = this.setInfobulleOptions(iOptions);
                            this.manageDisplayInfobubble();
                            this.parameters.map[this.cid].events.triggerEvent(
                                this.parameters.triggerInfobubbleEvent,
                                infoBubble
                            );
                            this.parameters.map[this.cid].addPopup(infoBubble);
                            this.parameters.currentInfoBubble[this.cid] = infoBubble;
                        }
                    }
                }
            });
        }
    },

    /**
     * Fonction permettant de gérer un scénario pour l'affichage des informations
     * retournées par le géocodage.
     * @param {object} results resultat du géocodage
     * @param {object} point lat lon of point
     */
    manageGeolocScenario: function(results, point)
    {
        // contenu par défaut du l'infobulle
        var geocodePoint = this.getGeocodePoint(point);
        // Contenu en fonction du scénario
        if(CanalTP.lib.map.config.geocode.scenario !== "undefined") {
            var zoom = this.getMapZoom();
            var display_location = '';
            _.each(CanalTP.lib.map.config.geocode.scenario, function(value, key){
                if( zoom >= value[0] && zoom <= value[1] ) {
                    switch (key) {
                        case "locality":
                            if (results[0].address.county) {
                                display_location = results[0].address.county;
                            } else if (results[0].address.city) {
                                display_location = display_location + results[0].address.city;
                            }
                            break;
                        case "city":
                            if (results[0].address.village) {
                                display_location = results[0].address.village ;
                            }
                            if (results[0].address.town) {
                                display_location = display_location + results[0].address.town;
                            }else if (results[0].address.city) {
                                display_location = display_location + results[0].address.city;
                            }
                            if(results[0].address.postcode) {
                                var codes_list = results[0].address.postcode.split(';');
                                display_location = display_location + ' (' + codes_list[0] + ')';
                            }
                            break;
                        case "street_address":
                            if (results[0].address.road) {
                                display_location = results[0].address.road + ', ';
                            }
                            if (results[0].address.village) {
                                display_location = display_location + results[0].address.village;
                            } else if (results[0].address.town) {
                                display_location = display_location + results[0].address.town;
                            } else if (results[0].address.city) {
                                display_location = display_location + results[0].address.city;
                            } else {
                                display_location = results[0].display_name;
                            }
                            break;
                        default:
                            display_location = results[0].display_name;
                            break;
                    }
                }
            }, this);
        } else {
            display_location = results[0].display_name;
        }
        return {
            'point': geocodePoint,
            'iContent': display_location,
            'results': results[0]
        };
    },

    /**
     * Fonction permettant de faire le géocodage inversé
     */
    geocodeOnMapLoad: function()
    {
        var that = this;
        OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
            defaultHandlerOptions: {
                'single': true,
                'double': false,
                'pixelTolerance': 0,
                'stopSingle': false,
                'stopDouble': false
            },

            initialize: function(options) {
                this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
                OpenLayers.Control.prototype.initialize.apply(this, arguments);
                this.handler = new OpenLayers.Handler.Click(
                    that,
                    {'click': that.geocodeEvent},
                    this.handlerOptions
                );
            }
        });
        // Add handler to map
        var click = new OpenLayers.Control.Click();
        this.parameters.map[this.cid].addControl(click);
        click.activate();
    },

    /**********************************      COMMON       ****************************************/
    /**
     * Fonction to manage display marker, polylines, and circles
     * @param {type} collection
     * @param {type} type
     * @returns {undefined}
     */
    manageDisplayMapObject: function(collection, type)
    {
        var hideList = [];
        var showList = [];
        var zoom = collection.map.zoom;
        _.each(collection.models, CanalTP.jQuery.proxy(function(value) {
            if (value.get('isVisible') === false) {
                hideList.push(value.get('mapElement'));  
            } else if (value.get('isAlwaysVisible') === true) {
                showList.push(value.get('mapElement'));
            } else {
                var minZoom = value.get('minZoom');
                var maxZoom = value.get('maxZoom');
                if (_.isNumber(zoom) && _.isNumber(minZoom) &&  _.isNumber(maxZoom)
                    && minZoom <= zoom && maxZoom >= zoom) {
                    showList.push(value.get('mapElement'));
                } else {
                    hideList.push(value.get('mapElement')); 
                }
            }
        }, this));
        this.hide(hideList, type, collection);
        this.show(showList, collection, type);
    },
    
    /**
     * Fonction permettant d'afficher un element de la carte (marqueur, polyline, kml)
     * @param {object} mapObject element/objet de la carte
     * @param {object} collection
     * @param {string} type vector layer id to display
     */
    show: function(mapObject, collection, type)
    {
        if (mapObject.length > 0) {
            var map = (collection !== undefined) ? collection.map : this.parameters.map[this.cid];
            var vectorslayer = map.getLayer(type);
            _.each(mapObject, CanalTP.jQuery.proxy(function(value) {
                this.addLayerToShow(map, vectorslayer, value);
            }, this));
            vectorslayer.refresh();
        } 
    },

    /**
     * Function to add layer on vectorLayer
     * @param {object} map
     * @param {object} vectorslayer
     * @param {object} mapObject
     */
    addLayerToShow: function(map, vectorslayer, mapObject)
    {
        mapObject.map = map;
        if (typeof(mapObject.onScreen) === 'function' && mapObject.onScreen() === false) {
            mapObject.style.display = 'true';
            vectorslayer.addFeatures([mapObject]);
            if (mapObject.attributes.draggable === true) {
                var drag = new OpenLayers.Control.DragFeature(vectorslayer, {
                    id: "draggable",
                    feature: mapObject,
                    onStart: function(value) {
                        if (value.attributes.draggable !== true) {
                            this.cancel();
                        }
                    },
                    onComplete: CanalTP.jQuery.proxy(function(f) {this.dragComplete(f);}, this)
                });
                map.addControl(drag);
                drag.activate();
            }
        }
    },
    
    /**
     * Fonction permettant de cacher lun element de la carte (marqueur, polyline, kml)
     * @param {object} mapObject element/objet de la carte
     * @param {string} type vector layer id to hide
     */
    hide: function(mapObject, type, collection)
    {
        if (mapObject.length > 0) {
            var map = (collection !== undefined) ? collection.map : this.parameters.map[this.cid];
            var vectorslayer = map.getLayer(type);
            _.each(mapObject, CanalTP.jQuery.proxy(function(value) {
                if (value.map !== undefined) {
                    if (typeof(value.onScreen) === 'function' && value.onScreen() === true) {
                        value.style.display = 'none';
                        vectorslayer.removeFeatures([value]);
                    }
                }
            }, this));
            vectorslayer.refresh();
        }
    },

    /**
     * Function to transform coordinates
     * @param {object} object coordinates
     */
    coordTransformation : function(object)
    {
        if (object.transformation === undefined) {
            object.transform(
                new OpenLayers.Projection("EPSG:4326"),
                new OpenLayers.Projection("EPSG:900913")
            );
            object.transformation = 'done';
        }
        return object;
    },
    /*******************************      CALCUL ZOOM D'AFFICHAGE      **************************/
    /**
     * Function to get the bounds for circles
     * @param {object} mapObject circle's collections
     * @param {object} bounds
     */
    getCirclesBounds: function(mapObject, bounds)
    {
        bounds.extend(mapObject.geometry.getBounds());
        return bounds;
    },

    /**
     * Function to get the bounds for markers
     * @param {object} mapObject collections of markers
     */
    getMarkersBounds: function(mapObject)
    {
        return mapObject.geometry.getBounds();
    },

    /**********************************      KML       *******************************************/
    /**
     * Function to display kml (coming soon)
     * @param {object} kmlsCollection kml's collection
     */
    kmlOnMap: function(kmlsCollection)
    {
        return false;
    },

    /**
     * Function to get IE version
    */
    getMsieVersion: function()
    {
       var ua = window.navigator.userAgent;
       var msie = ua.indexOf ( "MSIE " )

       if ( msie > 0 )      // If Internet Explorer, return version number
          return parseInt (ua.substring (msie+5, ua.indexOf (".", msie )));
       else                 // If another browser, return 0
          return 0;

    }
});
