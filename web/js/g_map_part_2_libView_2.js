/**
 * Library Carto
 * View commun osMap et gMap
 * @type @exp;Backbone@pro;View@call;extend
 */
var ctpLibView = Backbone.View.extend({
    parameters: {
        //map
        map : {},
        // nombre maximum de carte
        maxMaps : 20,
        //infobulle ouvert à l'instant t
        currentInfoBubble : {},
        //object marqueurs
        markers : {},
        //fonction callback appelée avant l'affichage
        preRenderInfoBubble : function(model){},
        //Nombre maximum de marqueurs à afficher
        maxMarkers : 150,
        //object polylines
        polylines : {},
        //Nombre maximum de polylines à afficher
        maxPolylines : 100,
        //object infobulles
        infoBubbles : {},
        //listener sur le clic
        clicListener : true,
        //Nombre maximum de kml à charger
        maxKml : 5,
        //object KMLs
        kmls : {},
        // object des cercles
        circles: {},
        clusters: {},
        // Nombre maximum de cercle à afficher
        maxCircles: 5,
        //Nom du trigger de custom des infobulles du KML
        triggerKMLCustom : 'customKmlInfobulle',
        //Nom du trigger de custom des infobulles de Géocodage
        triggerGeoCustom : 'customGeoInfobulle',
        //Nom du trigger pour les événements des infobulles
        triggerInfobubbleEvent : 'infobubbleEvent',
        excluded_country: 'France',
        console_begin_msg: 'oops! Your map library (xxMaps.js) '
    },

    /**
     *  Fonction permettant d'afficher les messages d'erreurs en mode debug
     *  @param {string} msg le message d'erreur
     */
    debug: function(msg)
    {
        if (typeof(CanalTP.lib.map.config.debug) !== "undefined"
            && CanalTP.lib.map.config.debug.active === true) {
            console.log('Oops! Library Carto Error:' + msg);
        }
    },

    /**
     *  Fonction permettant d'assigner une fonction utilisateur avant l'affichage
     *  d'une infobulle
     *  @param {function} userFn fonction utilisateur
     */
    setPreRenderInfoBubble: function(userFn)
    {
        if (typeof(userFn) === "function") {
            this.parameters.preRenderInfoBubble = userFn;
            return true;
        }
    },

    /****************************************    INITIALIZE MAP   ********************************/
    manageMapId: function(id)
    {
        if (typeof(id) === 'object') {
            id = id[0];
        } else {
            id = document.getElementById(id);
        }
        return id;
    },
    /**
     * Fonction permettant d'initialiser et d'afficher la carte
     * @param {object} mapsCollection collection Map
     */
    createMap: function(mapsCollection)
    {
        var length = _.size(mapsCollection.models);
        var limit = (length > this.parameters.maxMaps) ? this.parameters.maxMaps : length;
        for (var i = 0; i < limit; i++) {
            var map = mapsCollection.models[i];
            var id = this.manageMapId(map.get('divId'));
            if (!map.hasChanged("validationError")) {
                this.parameters.map[this.cid] = this.displayMap(id, map.get('objMap'));
                if (map.get('addPopin') === true && map.get('iContent') !== '') {
                    if (typeof(this.infobulleOnMap) === 'function') {
                        this.infobulleOnMap(map);
                    }
                }
                if (typeof(CanalTP.lib.map.config.geocode) !== 'undefined' &&
                    CanalTP.lib.map.config.geocode.alwaysActive === true) {
                    this.geocodeOnMapLoad();
                }
            }
        }
    },

    /**
     * Function to display the map. It must be overload by the map library used.
     * @param {string} id map id
     * @param {object} options map parameters
     */
    displayMap: function(id, options)
    {
        this.debug(
            this.parameters.console_begin_msg+ 'must have a function "displayMap(id, options)".'
        );
    },

    /**
     *  Fonction permettant de récupérer le centre de la carte
     */
    getMapCenter: function()
    {
        var center = this.parameters.map[this.cid].getCenter();
        return center;
    },

    /**
     * Fonction permettant de setter un nouveau centre à la carte
     * @param {number} centerX nouveau centre X en wgs84
     * @param {number} centerY nouveau centre Y en wgs84
     */
    setMapCenter: function(centerX, centerY)
    {
        if (typeof(centerX) === "number" && typeof(centerY) === "number") {
            var latlng = this.getLatLon(centerX, centerY);
            this.parameters.map[this.cid].setCenter(latlng);
        } else {
            this.debug("Fonction setMapCenter (gmap.js)");
            this.debug("centerX(type: wgs84), centerY(type: wgs84) sont obligatoires.");
        }
    },

    /**
     * Function to get the positions lat and lon. It must be overload by the map library used.
     * @param {number} x coordinates
     * @param {number} y coordinates
     */
    getLatLon: function(x, y)
    {
        this.debug(
            this.parameters.console_begin_msg+ 'must have a function "getLatLon(x, y)".'
        );
    },

    /**
     * Fonction permettant de récupérer le zoom de la carte
     */
    getMapZoom: function()
    {
        var zoom = this.parameters.map[this.cid].getZoom();
        return zoom;
    },

    /**
     * Setter function for a new map zoom.
     * CanalTP.lib.map.wrapper.setZoom must be defined
     * Its used to call the library function to set the zoom
     * @param {number} zoom nouveau zoom
     */
    setMapZoom: function(zoom)
    {
        if (typeof(zoom) === "number") {
            this.parameters.map[this.cid][CanalTP.lib.map.wrapper.setZoom](zoom);
        } else {
            this.debug("Fonction setMapZoom (gmap.js)");
            this.debug("Le paramètre zoom() est obligatoire et doit etre de type number .");
        }
    },

    /************************************     INFOBULLES    **************************************/
    /**
     * Fonction permettant de gerer les methodes d'affichage des infobulles
     * Type "mono": permet d'afficher une infobulle a  la fois
     * Type "multi" permet d'afficher plusieurs infobulles en se repositionnant sur le dernier
     */
    manageDisplayInfobubble: function()
    {
        switch (CanalTP.lib.map.config.infobubble.displayType) {
            case "multi":
                return false;
            case "mono":
            default:
                this.closeCurrentInfoBubble();
                break;
        }
    },

    /**
     * Fonction permettant de fermer l'infobulle courante (actuellement ouverte)
     */
    closeCurrentInfoBubble: function()
    {
        var infobulleObject = this.parameters.currentInfoBubble[this.cid];
        if (infobulleObject !== undefined) {
            infobulleObject[CanalTP.lib.map.wrapper.closePopup]();
            infobulleObject = null;
        }
    },

    /***************************************      MARKERS     ************************************/
    /**
     * Fonction permettant de gerer les marqueurs sur la carte
     * @param {object} markersCollection : collection de markers
     */
    markersOnMap: function(markersCollection)
    {
        this.collectionOnMap(markersCollection, 'marker', 'maxMarkers');
    },

    /**
     * Function to add zoom event on markers
     * @param {object} collection collection of element
     * @param {string} type type of element
     */
    markerZoomEvent: function(type, collection)
    {
        this.debug(
            this.parameters.console_begin_msg+ 'must have a function "markerZoomEvent(type, collection)".'
        );
    },

    /**
     * Function to add dragend event on markers
     * @param {string} type
     * @param {object} collection
     */
    markerDragEndEvent: function(type, collection)
    {
        this.debug(
            this.parameters.console_begin_msg+ 'must have a function "markerDragEndEvent(type, collection)".'
        );
    },
    
    markerAnimation: function(model, animation, time)
    {
        return false;
    },

    markerClusterer: function(map, opt_markers, opt_options)
    {
        return false;
    },
    /*****************************************      POLYLINES     ********************************/
    /**
     * Fonction permettant de créer des polylines
     * @param {object} polylinesCollection objet contenant les paramétres du polylines
     */
    polylineOnMap: function(polylinesCollection)
    {
        this.collectionOnMap(polylinesCollection, 'polyline', 'maxPolylines');
    },

    /**
     * Function to set events on polylines
     * @param {object} polyline
     */
    setPolylineEvents: function(polyline)
    {
        this.debug(
            this.parameters.console_begin_msg+ 'must have a function "setPolylineEvents(polyline)".'
        );
    },

    /**********************************       CIRCLES          ***********************************/
    /**
     * Fonction permettant de gérer les circles sur la carte
     * @param {object} circlesCollection : collection de cercle
     */
    circlesOnMap: function(circlesCollection)
    {
        this.collectionOnMap(circlesCollection, 'circle', 'maxCircles');
    },

    /**********************************      COMMON       ****************************************/
    /**
     * function to display all map elements
     * @param {object} collection collection of element
     * @param {string} type type of element
     * @param {string} max max number of element
     */
    collectionOnMap: function(collection, type, max)
    {
        var group = type+'s';
        this.parameters[group][this.cid] = this.parameters[group][this.cid] || [];
        this.parameters[group][this.cid].push(collection);
        var length = 0;
        _.each(this.parameters[group][this.cid], function(value){
            length = length + value.length;
        });
        var max_iteration = this.parameters[max] - length;
        var size = _.size(collection);
        var limit = (size < max_iteration) ? size : this.parameters[max];
        var collectionModels = this.removeItems(collection, limit, size);
        collectionModels.setMapView(this.parameters.map[this.cid]);
        this.manageDisplayMapObject(collectionModels, type);
        this.markerZoomEvent(type, collectionModels);
        this.markerDragEndEvent(type, collectionModels);
        for (var i = 0; i < limit; i++) {
            var element = collectionModels.models[i];
            if (typeof(element) !== 'undefined') {
                if (!_.isUndefined(element.get("objInfobulle")) && !_.isNull(element.get("objInfobulle"))){
                    if (typeof(this.infobulleOnMap) === 'function') {
                        this.infobulleOnMap(element, type);
                    }
                }
                if (type === 'polyline' && element.get('isHoverable') === true) {
                    this.setPolylineEvents(element);
                }
            }
        }
        var autoZoom = {
            "isActive": CanalTP.lib.map.config[this.cid][group].autoZoom,
            "useMapElements": true,
            "type": type
        };
        this.calculateZoom(autoZoom);
    },

    /**
     * Fonction permettant d'afficher un élément de la carte (marqueur, polyline, kml)
     * @param {object} mapObject élément/objet de la carte
     * @param {object} collection
     */
    show: function(mapObject, collection, type)
    {
        this.debug(
            this.parameters.console_begin_msg+ 'must have a function "show(mapObject, collection)".'
        );
    },

    /**
     * Fonction permettant de cacher lun élément de la carte (marqueur, polyline, kml)
     * @param {object} mapObject élément/objet de la carte
     */
    hide: function(mapObject, type)
    {
        this.debug(
            this.parameters.console_begin_msg+ 'must have a function "hide(mapObject)".'
        );
    },

    /**
     * Fonction permettant de gérer l'affichage des éléments de la carte (marqueur, polylines)
     * @param {object} collection collection d'element de la carte (polylines, markers, kmls , ...)
     * {booleen} isAlwaysVisible
     * {number} minZoom : zoom minimun lorsque l'affichage est conditionnée
     * {number} maxZoom : zoom maximum lorsque l'affichage est conditionnée
     */
    manageDisplayMapObject: function(collection, type)
    {
        _.each(collection.models, CanalTP.jQuery.proxy(function(value){
            if (value.get('isVisible') === false) {
                this.hide(value.get('mapElement'), type);
            }else{
                if (value.get('isAlwaysVisible') === true) {
                    this.show(value.get('mapElement'), collection, type);
                }else{
                    this.manageZoomLevel(value, collection, type);
                }
            }
        }, this));
    },

    /**
     * Fonction permettant de gerer l'affichage
     * en fonction du niveau de zoom de tous les models d'une collection
     * @param {object} model element de la carte (polylines, markers, kmls , ...)
     * @param {object} collection collection of models
     */
    manageZoomLevel: function(model, collection, type)
    {
        var zoom = collection.map.zoom;
        var minZoom = model.get('minZoom');
        var maxZoom = model.get('maxZoom');
        if (_.isNumber(zoom) && _.isNumber(minZoom) &&  _.isNumber(maxZoom)
            && minZoom <= zoom && maxZoom >= zoom) {
            this.show(model.get('mapElement'), collection, type);
        } else {
            this.hide(model.get('mapElement'), type);
        }
    },

    /*******************************      CALCUL ZOOM D'AFFICHAGE      **************************/
    /**
     * Fonction permettant de gérer le calcul du niveau de zoom d'affichage
     * @param {object} zoomOptions options d'utilisation du zoom
     * Paramétres :
     * {booleen} isActive activation ou désactivation du calcul de zoom
     * {booleen} useMapElements utilisation ou non des éléments de la carte
     * {string} type si useMapElements est à true, type permet de définir les éléments à afficher
     * type : "marker", "polyline", "kml", "all" par défaut le paramétre vaut "all".
     * {array} positions tableau de coordonnées permettant de calculer le niveau de zoom idéal.
     */
    calculateZoom: function(zoomOptions)
    {
        var positionTabs = [];
        if (zoomOptions.isActive === true) {
            if (zoomOptions.useMapElements === false) {
                positionTabs = zoomOptions.positions;
                this.gCalculBounds(positionTabs);
            } else {
                positionTabs = this.getElementsPositions(zoomOptions.type, positionTabs);
            }
        }
    },

    /**
     * Fonction permettant de faire le calcul du zoom
     * @param {array} positionTabs Tableau contenant toutes les positions
     */
    gCalculBounds: function(positionTabs)
    {
        if (_.isArray(positionTabs) && positionTabs.length !== 0) {
            var bounds = new CanalTP.lib.map.wrapper.latLngBounds();
            for (var i = 0; i < positionTabs.length; i++) {
                bounds.extend(positionTabs[i]);
            }
            this.parameters.map[this.cid].setCenter(bounds[CanalTP.lib.map.wrapper.boundsCenter]());
            if (positionTabs.length > 1) {
                this.parameters.map[this.cid][CanalTP.lib.map.wrapper.fitBounds](bounds);
            }
        }
    },

    /**
     * Fonction permettant de calculer automatiquement toutes les positions
     * Le calcul est fait que pour les marqueurs et les polylines.
     * Les kmls ne sont pas pris en compte,
     * google a un traitement spécifique pour les kml (paramètre preserveViewPort)
     * @param {string} type type de l'éléments de la carte (marker, polyline, kml, all)
     * @param {array}  positionTabs Tableau contenant toutes les positions
     */
    getElementsPositions: function(type, positionTabs)
    {
        switch (type) {
            case "marker":
                positionTabs = this.getMarkersPosition(positionTabs);
                this.gCalculBounds(positionTabs);
                break;
            case "polyline":
                positionTabs = this.getPolylinesPosition(positionTabs);
                this.gCalculBounds(positionTabs);
                break;
            case "circle":
                this.getCirclesPosition();
                break;
            case "all":
            default:
                positionTabs = this.getMarkersPosition(positionTabs);
                positionTabs = this.getPolylinesPosition(positionTabs);
                this.gCalculBounds(positionTabs);
                break;
        }
    },

    /**
     * Fonction permettant de récupérer les positions des cercles (s'il y en a)
     */
    getCirclesPosition: function()
    {
        var circleObject = this.parameters.circles[this.cid];
        var bounds = new CanalTP.lib.map.wrapper.latLngBounds();
        for (var i = 0; i < circleObject.length; i++) {
            var collection = circleObject[i];
            _.map(collection.models, function(value){
                this.getCirclesBounds(value.get('mapElement'), bounds);
            }, this);
        }
        this.parameters.map[this.cid][CanalTP.lib.map.wrapper.fitBounds](bounds);
    },

    /**
     * Function to get the circles bounds
     * @param {object} mapObject
     * @param {object} bounds new CanalTP.lib.map.wrapper.latLngBounds()
     */
    getCirclesBounds: function(mapObject, bounds)
    {
        this.debug(
            this.parameters.console_begin_msg+ 'must have a function "getCirclesBounds(mapObject, bounds)".'
        );
    },

    /**
     * Fonction permettant de récupérer les positions des markers (s'il y a des markers)
     * @param {array} positionTabs positionTabs Tableau contenant toutes les positions
     */
    getMarkersPosition: function(positionTabs)
    {
        var markerObject = this.parameters.markers[this.cid];
        if (markerObject.length !== 0) {
            for (var i = 0; i < markerObject.length; i++) {
                var collection = markerObject[i];
                _.map(collection.models, function(value){
                    positionTabs.push(this.getMarkersBounds(value.get('mapElement')));
                }, this);
            }
        }
        return positionTabs;
    },

    getMarkersBounds: function(mapObject)
    {
        this.debug(
            this.parameters.console_begin_msg+ 'must have a function "getCirclesBounds(mapObject, bounds)".'
        );
    },

    /**
     * Fonction permettant de récupérer les positions des polylines (s'il a des polylines)
     * @param {array} positionTabs positionTabs Tableau contenant toutes les positions
     */
    getPolylinesPosition: function(positionTabs)
    {
        var polylineObject = this.parameters.polylines[this.cid];
        if (polylineObject.length !== 0) {
            for (var i = 0; i < polylineObject.length; i++) {
                var collection = polylineObject[i];
                 _.map(collection.models, function(value){
                    positionTabs.push(_.flatten(value.get('latLngsPath')));
                });
            }
        }
        return _.flatten(positionTabs);
    },

    /**********************************       MAP EVENTS       ***********************************/
    /**
     * Fonction permettant de gérer un scénario pour l'affichage des informations
     * retournées par le géocodage.
     * @param {object} results resultat du géocodage
     */
    manageGeolocScenario: function(results)
    {
        // contenu par défaut du l'infobulle
        var iOptions = {
            'point': this.getGeocodePoint(results[0]),
            'iContent': results[0][CanalTP.lib.map.wrapper.geocodeResult],
            'results': results[0]
        };
        // Contenu en fonction du scénario
        if(CanalTP.lib.map.config.geocode.scenario !== "undefined") {
            var zoom = this.getMapZoom();
            _.each(CanalTP.lib.map.config.geocode.scenario, function(value, key){
                if( zoom >= value[0] && zoom <= value[1] ) {
                    _.each(results, function(value){
                         if( CanalTP.jQuery.inArray(key, value.types) !== -1 ) {
                            var stringReplace = ', '+this.parameters.excluded_country;
                            if(value[CanalTP.lib.map.wrapper.geocodeResult].indexOf(stringReplace) >= 0) {
                                value[CanalTP.lib.map.wrapper.geocodeResult] = value[CanalTP.lib.map.wrapper.geocodeResult].replace(stringReplace, "");
                            }
                            iOptions = {
                                'point': this.getGeocodePoint(value),
                                'iContent': value[CanalTP.lib.map.wrapper.geocodeResult],
                                'results': value
                            };
                         }
                    }, this);
                }
            }, this);
        }
        return iOptions;
    },

    /**
     * Fonction permettant de faire le géocodage inversé
     * @param {object} event
     */
    geocodeEvent: function(event)
    {
        // Récupération des coordonnées d'un point au clic
        var point = this.getCoords(event);
        // Pas de géocodage lors d'un clic pour fermer l'infobulle
        if (this.parameters.clicListener === true && CanalTP.lib.clicTemp !== true) {
            this.getGeocode(point);
        }
        this.parameters.clicListener = true;
    },
    
    /**
     * Fonction permettant de retirer les éléments d'une collection à partir d'un index donné
     * @param {object} collection collection d'éléments de la carte (polylines, markers, kmls , ...)
     * @param {integer} startIndex index à partir duquel retirer les éléments de la collection
     */
    removeItems: function(collection, startIndex, endIndex)
    {
    	for (var i = startIndex; i < endIndex; i++) {
            collection.remove(collection.models[i]);
        }
    	
    	return collection;
    }
});
