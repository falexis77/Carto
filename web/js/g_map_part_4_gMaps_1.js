/**
 * Library Google Map V3
 * Cette librairie ne traite que du WGS84
 * Author RNE
 * CanalTP - 2013
 * @type @exp;ctpLibView@call;extend|@exp;ctp@pro;libMap@call;extend
 */
var ctpMap = ctpLibView.extend({

    initialize: function()
    {
        // Clone des parametres de la vue
        this.parameters = _.extend({}, this.parameters);
        oMap = this;
        google.maps.visualRefresh = true;
        CanalTP.lib.map.config[this.cid] = CanalTP.lib.map.config[this.cid] || {};
        CanalTP.lib.map.config[this.cid].polylines = CanalTP.lib.map.config[this.cid].polylines || {};
        CanalTP.lib.map.config[this.cid].markers = CanalTP.lib.map.config[this.cid].markers || {};
        CanalTP.lib.map.config[this.cid].circles = CanalTP.lib.map.config[this.cid].circles || {};
        CanalTP.lib.map.wrapper = CanalTP.lib.map.wrapper || {};
        CanalTP.lib.map.wrapper.api = google.maps;
        CanalTP.lib.map.wrapper.viewer = google.maps.Map;
        CanalTP.lib.map.wrapper.setZoom = 'setZoom';
        CanalTP.lib.map.wrapper.latLon = google.maps.LatLng;
        CanalTP.lib.map.wrapper.latLngBounds = google.maps.LatLngBounds;
        CanalTP.lib.map.wrapper.boundsCenter = 'getCenter';
        CanalTP.lib.map.wrapper.fitBounds = 'fitBounds';
        CanalTP.lib.map.wrapper.closePopup = 'close';
        CanalTP.lib.map.wrapper.geocodeResult = 'formatted_address';
        CanalTP.lib.map.wrapper.addListener = this.dblClicEventManager;
        CanalTP.lib.map.wrapper.addDomListener = google.maps.event.addDomListener;
        CanalTP.lib.map.wrapper.trigger = google.maps.event.trigger;
        CanalTP.lib.map.wrapper.addListenerEvent = google.maps.event.addListener;
        CanalTP.lib.map.wrapper.clearListeners = google.maps.event.clearListeners;
        CanalTP.lib.map.wrapper.removeListener = google.maps.event.removeListener;
        CanalTP.lib.map.wrapper.overlay = google.maps.OverlayView;
        CanalTP.lib.map.wrapper.bounce = google.maps.Animation.BOUNCE;
        CanalTP.lib.map.wrapper.getLat = this.ctpGetLat;
        CanalTP.lib.map.wrapper.getLon = this.ctpGetLon;
    },

    /**
     * Function wrapper to get lat
     * @param {object} point
     */
    ctpGetLat: function(point) {
        return point.lat();
    },

    /**
     * Function wrapper to get lon
     * @param {object} point
     */
    ctpGetLon: function(point) {
        return point.lng();
    },

    /**
     * Fonction permettant de gérer le double clic sur la carte
     * @param {Object} obj map
     * @param {String} type type d'evenement
     * @param {Function} fn function callback
     */
    dblClicEventManager: function(obj, type, fn)
    {
        if(type === 'click' && obj.zoom !== undefined) {
            CanalTP.lib.map.wrapper.addListenerEvent(obj, type, function(event){
                var mapZoom = obj.getZoom();
                setTimeout(function(){
                    if (mapZoom === obj.getZoom()
                    && mapZoom >= CanalTP.lib.map.config.reverse_location.min_zoom) {
                       fn(event);
                    }
                }, 300);
            });
        } else {
            CanalTP.lib.map.wrapper.addListenerEvent(obj, type, function(event){
                fn(event);
            });
        }
    },

    /****************************************    INITIALIZE MAP   ********************************/
    /**
     * Function to display the map
     * @param {string} id map id
     * @param {object} options map parameters
     */
    displayMap: function(id , options)
    {
        var map = new CanalTP.lib.map.wrapper.viewer(id, options);
        google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
            CanalTP.jQuery(id).trigger('mapCreated');
        });
        return map;
    },

    /**
     * Function to get the positions lat and lon
     * @param {number} x coordinates
     * @param {number} y coordinates
     */
    getLatLon: function(x, y)
    {
        return new google.maps.LatLng(x, y);
    },

    /**
     * Function to resiz map with the responsive design
     * @param {object} map
     */
    resizeMap: function(map)
    {
        var center = map.getCenter();
        CanalTP.lib.map.wrapper.trigger(map, "resize");
        map.setCenter(center);
    },

    /************************************     INFOBULLES    **************************************/
    /** Here we redefine set() method.
     *  If it is called for map option, we hide InfoWindow, if "noSupress" option isnt true.
     *  As Google doesn't know about this option, its InfoWindows will not be opened.
     */
    fixInfoWindow: function() {
        var set = google.maps.InfoWindow.prototype.set;
        var debug = this.debug;
        google.maps.InfoWindow.prototype.set = function (key, val) {
            if (key === 'map') {
                if (!this.get('noSupress')) {
                    debug(
                        'This InfoWindow is supressed. To enable it, set "noSupress" option to true'
                    );
                    return;
                }
            }
            set.apply(this, arguments);
        };
    },

    /**
     * Fonction permettant de créer une infobulle
     * @param {object} infoBubble : paramétres infobulles
     */
    displayInfobulle: function(infoBubble)
    {
        this.manageDisplayInfobubble();
        infoBubble.open(this.parameters.map[this.cid]);
        this.parameters.currentInfoBubble[this.cid] = infoBubble;
        this.manageScrollWheelEvents();
        CanalTP.lib.map.wrapper.trigger(
            this.parameters.map[this.cid], this.parameters.triggerInfobubbleEvent, infoBubble
        );
    },
    /**
     * Fonction permettant de setter les valeurs des options
     * @param {object} iOptions : paramétres infobulles
     */
    setInfobulleOptions: function(iOptions)
    {
        iOptions = _.extend({}, CanalTP.lib.map.models.infobulle.prototype.defaults, iOptions);
        var infoBubble = new InfoBubble({
            map: this.parameters.map[this.cid],
            maxWidth: iOptions.iMaxWidth,
            maxHeight: iOptions.iMaxHeight,
            position: iOptions.point,
            content: iOptions.iContent
        });
        return infoBubble;
    },

    /**
     * Function to display infobulle on map
     * @param {object} object map element
     * @param {string} type type of element
     */
    infobulleOnMap: function(object, type)
    {
        CanalTP.lib.map.wrapper.addListener(object.get('mapElement'), 'click',
            CanalTP.jQuery.proxy(function(event){
                if (type === 'polyline') {
                    var clicPosition = this.getCoords(event);
                    object.get('objInfobulle').setPosition(clicPosition.position);
                }
                var infoBubble = object.get('objInfobulle');
                this.parameters.preRenderInfoBubble(object);
            this.displayInfobulle(infoBubble);
        }, this));
    },

    /**
     * Function to disable the zoom by scrollwheel on map at popup hovering
     */
    manageScrollWheelEvents: function()
    {
        var map = this.parameters.map[this.cid],
            infoBubble = this.parameters.currentInfoBubble[this.cid];
        CanalTP.jQuery(infoBubble.bubble_).hover(function(e) {
            map.set('scrollwheel', e.type === 'mouseleave');
        });
    },

    /***************************************      MARKERS     ************************************/
    /**
     * Function to add zoom event on markers
     * @param {object} collection collection of element
     * @param {string} type type of element
     */
    markerZoomEvent: function(type, collection)
    {
        if (type === 'marker') {
            var that = this;
            CanalTP.lib.map.wrapper.addListener(this.parameters.map[this.cid], 'zoom_changed', function(){
                that.manageDisplayMapObject(collection);
            });
        }
    },

    /**
     * Function to add dragend event on markers
     * @param {string} type
     * @param {object} collection
     */
    markerDragEndEvent: function(type, collection)
    {
        if (type === 'marker') {
            _.each(collection.models, function(value) {
                CanalTP.lib.map.wrapper.addListener(value.get('mapElement'), 'dragend', CanalTP.jQuery.proxy(function(event){
                    var ggeo = new google.maps.Geocoder();
                    ggeo.geocode({'latLng': event.latLng}, CanalTP.jQuery.proxy(function(results, status){
                        switch (status) {
                            case 'OK':
                                var iOptions = this.manageGeolocScenario(results);
                                iOptions['id'] = value.id;
                                CanalTP.lib.map.wrapper.trigger(this.parameters.map[this.cid], 'dragend', iOptions);
                                break;
                        }
                    }, this));
                }, this));
            }, this);
        }
    },

    /**
     * Function to add animation to marker
     * @param {object} model marker's model
     * @param {string} animation animation's style
     * @param {number} time duration for the animation
     */
    markerAnimation: function(model, animation, time)
    {
        model.get('mapElement').setAnimation(animation);
        if (time !== undefined) {
            setTimeout(function(){ model.get('mapElement').setAnimation(null); }, time);
        }
    },

    /**
     * Function to manage cluster
     * @param {object} map
     * @param {array} opt_markers
     * @param {object} opt_options
     */
    markerClusterer: function(map, opt_markers, opt_options)
    {
        _.each(opt_markers, function(value){
            opt_options.minimumClusterSize = value.length;
            var markerCluster = new MarkerClusterer(map, value, opt_options);
        });
    },
    /**********************************       MAP EVENTS       ***********************************/
    /**
     * Function to get the position into the gecode result
     * @param {object} result geocode result
     */
    getGeocodePoint: function(result)
    {
        return result.geometry.location;
    },

    /**
     *  Retourne les coordonnées d'un point en fonction d'un événement (clic, ...)
     *  @param {object} event
     */
    getCoords: function(event)
    {
        return {'position': event.latLng, 'lat': event.latLng.lat(), 'lon': event.latLng.lng()};
    },

    /**
     * Retourne le géocode d'un point en fonction d'un événement (clic, ...)
     * @param {object} latLng object de latLng(google)
     */
    getGeocode: function(latLng)
    {
        var ggeo = new google.maps.Geocoder();
        ggeo.geocode({'latLng': latLng.position}, CanalTP.jQuery.proxy(function(results, status){
            switch (status) {
                case 'OK':
                    var iOptions = this.manageGeolocScenario(results);
                    CanalTP.lib.map.wrapper.trigger(
                        this.parameters.map[this.cid], this.parameters.triggerGeoCustom, iOptions
                    );
                    if (CanalTP.lib.map.config.geocode.addPopin === true) {
                        var infoBubble = this.setInfobulleOptions(iOptions);
                        this.displayInfobulle(infoBubble);
                    }
                    break;
                default:
                    this.debug("Fonction getGeocode (gmap.js)");
                    this.debug("Aucun résultat de géocodage ou Erreur de géocodage");
                    break;
            }
        }, this));
    },

    /**
     * Fonction permettant de faire le géocodage inversé
     */
    geocodeOnMapLoad: function()
    {
        var that = this;
        CanalTP.lib.map.wrapper.addListener(this.parameters.map[this.cid], 'click',function(event) {
            that.geocodeEvent(event);
        });
    },

    /*****************************************      POLYLINES     ********************************/
    /**
     * Function to set events on polylines
     * @param {object} polyline
     */
    setPolylineEvents: function(polyline)
    {
        var events = ['mouseover', 'mouseout', 'click'];
        CanalTP.jQuery.each(events, function() {
            CanalTP.lib.map.wrapper.addListener(polyline.get('mapElement'), this, CanalTP.jQuery.proxy(function() {
                var eventName = 'polyline' + this.charAt(0).toUpperCase() + this.substr(1);
                CanalTP.jQuery(document).trigger(eventName, polyline);
            }, this));
        });
    },

    /**********************************      COMMON       ****************************************/
    /**
     * Fonction permettant d'afficher un élément de la carte (marqueur, polyline, kml)
     * @param {object} mapObject élément/objet de la carte
     * @param {object} collection
     * @param {string} unused params for gmap - its present for osm
     */
    show: function(mapObject, collection, type)
    {
        if (mapObject.getMap() === null || mapObject.getMap() === undefined) {
            var map = (collection !== undefined) ? collection.map : this.parameters.map[this.cid];
            mapObject.setMap(map);
        }
    },

    /**
     * Fonction permettant de cacher lun élément de la carte (marqueur, polyline, kml)
     * @param {object} mapObject élément/objet de la carte
     * @param {string} unused params for gmap - its present for osm
     */
    hide: function(mapObject, type)
    {
        if (mapObject.getMap() !== null && mapObject.getMap() !== undefined) {
            mapObject.setMap(null);
        }
    },

    /*******************************      CALCUL ZOOM D'AFFICHAGE      **************************/
    /**
     * Function to calculate the circles bounds
     * @param {object} mapObject map element
     * @param {object} bounds map element bounds
     */
    getCirclesBounds: function(mapObject, bounds)
    {
        bounds.union(mapObject.getBounds());
        return bounds;
    },

    /**
     * Function to calculate the markers bounds
     * @param {object} mapObject map element
     */
    getMarkersBounds: function(mapObject)
    {
        return mapObject.getPosition();
    },

    /**********************************      KML       *******************************************/
    /**
     * Fonction permettant de charger des kml sur la carte
     * @param {object} kmlsCollection collection  de model Kml
     */
    kmlOnMap: function(kmlsCollection)
    {
        this.parameters.kmls[this.cid] = this.parameters.kmls[this.cid] || [];
        this.parameters.kmls[this.cid].push(kmlsCollection);
        var length = 0;
        _.each(this.parameters.kmls[this.cid], function(value){
            length = length + value.length;
        });
        var max_iteration = this.parameters.maxKml - length;
        var kml_size = _.size(kmlsCollection);
        var limit = (kml_size < max_iteration) ? kml_size : this.parameters.maxKml;
        for (var i = 0; i < limit; i++) {
            var kmlModel = kmlsCollection.models[i];
            kmlsCollection.setMapView(this.parameters.map[this.cid]);
            this.manageDisplayMapObject(kmlsCollection);
            if (kmlModel.get('kmlActions') !== undefined) {
                this.manageKml(kmlModel.get('kmlActions'), kmlModel);
            }
        }
    },

    /**
     * Fonction permettant de gérer le Kml et ses actions (ajout infobulle, zoom au clic)
     * @param {object} action action sur le kml
     * @param {object} kmlModel model du kml
     */
    manageKml: function(action, kmlModel)
    {
        var layer = kmlModel.get('mapElement');
        switch (action) {
            case "zoom":
                CanalTP.lib.map.wrapper.addListener(layer, 'click', function(kmlEvent) {
                    oMap.kmlZoomAction(kmlEvent, kmlModel);
                });
                break;
            case "infobulle":
                CanalTP.lib.map.wrapper.addListener(layer, 'click', function(kmlEvent) {
                    oMap.infobulleForKml(layer, kmlEvent, kmlModel);
                });
                break;
            case "all":
                CanalTP.lib.map.wrapper.addListener(layer, 'click', function(kmlEvent) {
                    oMap.kmlZoomAction(kmlEvent, kmlModel);
                    oMap.infobulleForKml(layer, kmlEvent, kmlModel);
                });
                break;
            case "none":
            default:
                return false;
        }
    },

    /**
     * Fonction permettant de gérer le zoom au clic sur un kml
     * @param {object} kmlEvent événement au clic
     * @param {object} kmlModel model du kml
     */
    kmlZoomAction: function(kmlEvent, kmlModel)
    {
        this.setMapCenter(kmlEvent.latLng.lat(), kmlEvent.latLng.lng());
        this.setMapZoom(kmlModel.get('zoomToClic'));
    },

    /**
     * Fonction permettant d'ajouter une infobulle sur le Kml
     * @param {objet} layer kml
     * @param {object} kmlEvent événement sur le kml
     * @param {object} kmlModel model du Kml
     */
    infobulleForKml: function(layer, kmlEvent, kmlModel)
    {
        kmlModel.set({iContent: kmlEvent.featureData.infoWindowHtml, point: kmlEvent.latLng});
        CanalTP.lib.map.wrapper.trigger(
            this.parameters.map[this.cid], this.parameters.triggerKMLCustom, kmlEvent, layer, kmlModel
        );
        var infoBubble = new InfoBubble(kmlModel.get('objInfobulle'));
        this.displayInfobulle(infoBubble);
    }
});
