var DOMReady = DOMReady || false;
var MapReady = MapReady || false;

CanalTP.jQuery(function () {
    setCtpMapVariables();
    if (DOMReady === false) {
        DOMReady = true;
        if (window.google === undefined) {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "https://maps.googleapis.com/maps/api/js?sensor=false&callback=setMapReady";
            document.body.appendChild(script);
        }
    }
});

/**
 * Library Carto
 * View with function in order to help use
 * @type @exp;Backbone@pro;View@call;extend
 */
var ctpHelperView = Backbone.View.extend({

    /**
     * Function to create the div map
     * @param {object} attrs object div's css attributes
     * @param {object} styles object div's css styles
     * @param {object} parentSelector
     * @returns {unresolved}
     */
    createMapDiv: function(attrs, styles, parentSelector)
    {
        var mapDiv = CanalTP.jQuery(document.createElement("div"));
        if (typeof attrs !== 'undefined' || attrs !== null) {
            for (var attr in attrs) {
                mapDiv = mapDiv.attr(attr, attrs[attr]);
            }
        }
        if (typeof styles !== 'undefined' || styles !== null) {
            var allStyle = '';
            for (var style in styles) {
                allStyle = allStyle + style +":"+ styles[style] + ";";
            }
            mapDiv = mapDiv.attr('style', allStyle);
        }
        if (parentSelector !== 'undefined') {
            CanalTP.jQuery(parentSelector).append(mapDiv);
        }
        return mapDiv;
    },

    /**
     * Function to create map link
     * @param {Object} attrs link's css attributes
     * @param {String} html link's html text
     * @param {String} parentSelector the selector of the parent
     */
    createMapLink: function(attrs, html, parentSelector)
    {
        var aLink = CanalTP.jQuery(document.createElement("a"));
        if (typeof attrs !== 'undefined') {
            for (var attr in attrs) {
                aLink = aLink.attr(attr, attrs[attr]);
            }
        }
        if (typeof html !== 'undefined' && typeof(html) === 'string') {
            aLink = aLink.html(html);
        }
        if (parentSelector !== 'undefined') {
            CanalTP.jQuery(parentSelector).append(aLink);
        }
        return aLink;
    },

    executeFntoElement: function(elementId, fn, type)
    {
        type = (type === 'class') ? '.' : '#';
        CanalTP.jQuery(type+elementId)[fn]();
    },

    addCssToElement: function(element, css)
    {
        CanalTP.jQuery(element).css(css);
    },

    addStyleToElement: function(element, styles)
    {
        CanalTP.jQuery(element).attr('style', styles);
    },

    /**
     * Function to automatically calculate the width based on the map div
     * If width is not defined it is in 'auto' mode
     * @param {String} blockId
     * @param {number} width
     * @returns {undefined}
     */
    manageWidth: function(blockId, width)
    {
       if(width === undefined || width === 'auto'){
           var id = CanalTP.jQuery('#'+blockId).attr('id');
           width = document.getElementById(id).offsetWidth;
       }
       return width;
    },

    /**
     * Function to add a control to recenter the map when dragged
     */
    addControlRecenter: function(map, center, options)
    {
        var controls = {
            map: map,
            eventCenter: center,
            textOptions: {innerHTML: '<img src="'+options.image+'"/>'},
            uIStyle: {backgroundColor: options.background},
            uIOptions: {title: options.title}
        };
        return new ctpControls([
            new ctpControl(controls)
        ]);
    },

    /**
     * Function to create the map's collection
     * @param {object} createOpts options in configuration
     * @param {Object} opts Additional map's options
     * @returns {ctpInitMaps}
     */
    createMapCollection: function(createOpts, opts)
    {
        if (opts !== undefined) {
            createOpts = CanalTP.jQuery.extend({}, createOpts, opts);
        }
        return new ctpInitMaps([new ctpInitMap(createOpts)]);
    },

    /**
     * Function to enable the AutoZoom
     * @param {String} id map id
     * @param {Object} options
     * @returns {Boolean}
     */
    autoZoomActive: function(id, options)
    {
       if(options !== undefined){
           var zoomOpts = options.split(':');
           var isActive = (zoomOpts[1] === 'true') ? true : false;
           CanalTP.lib.map.config[id][zoomOpts[0]].autoZoom = isActive;
       }
       return true;
    },

    /**
     * Function to set the geocoding
     * The list of types is available here:
     * https://developers.google.com/maps/documentation/geocoding/#Types
     * @param {Boolean} active boolean to activate or desactivate geocodage
     * @param {Object} scenario way to display informations
     */
    activateGeocode: function(active, scenario)
    {
        if (active === true) {
            CanalTP.lib.map.config.geocode = {
                "alwaysActive": true,
                "addPopin": true,
                "scenario": scenario
            };
        }
    },

    /**
     * Function to customize tooltips geocodage
     * The goal is to add address of geocodage in a popup already create
     * @param {object} map
     * @param {string} url url to get the popup's template
     */
    getAddressInPopup: function(map, url)
    {
        var that = this ;
        CanalTP.lib.map.wrapper.addListener(map, 'customGeoInfobulle', function(iOptions){
            var id = CanalTP.lib.map.wrapper.getLon(iOptions.point, 'reverse') + ';'
                    + CanalTP.lib.map.wrapper.getLat(iOptions.point, 'reverse');
            CanalTP.jQuery.ajax({
                url: url,
                type: 'POST',
                data: {'point_type':'address', 'name': iOptions.iContent, 'id': id},
                async: false
            }).done(function(result) {
                that.searchEvent(iOptions.iContent,map);
                iOptions.iContent = result;

            });
        });
    },

    /**
     * Function Hide google map
     * @param {string} element to manage
     * @param {string} el_display element to display
     * @param {string} el_css element to add css
     * @param {string} el_fade element to fade
     */
    eventClicklink: function(element, el_display, el_css, el_fade)
    {
        var that = this;
        CanalTP.jQuery(element).on('click', function(e) {
            e.preventDefault();
            var status = CanalTP.jQuery(element).data('status');
            if ("hide" === status) {
                CanalTP.jQuery(element).text(CanalTP.jQuery(element).data('hide'))
                    .data('status', 'show');
                that.visibilityMap(el_display, el_css, el_fade,'hidden');
            } else {
                CanalTP.jQuery(element).text(CanalTP.jQuery(element).data('show'))
                    .data('status', 'hide');
                that.visibilityMap(el_display, el_css, el_fade, 'visible');
            }
        });
    },

    /**
     * Function to show or hide map
     * @param {string} el_display element to display
     * @param {string} el_css element to add css
     * @param {string} el_fade element to fade
     * @param {string] visibility 'visible' or 'hidden'
     */
    visibilityMap: function(el_display, el_css, el_fade, visibility)
    {
        var height;
        var fade;
        var display;
        if (visibility === 'visible') {
            height = '100%';
            fade = 'fadeOut';
            display = 'show';
        } else {
            height = 0;
            fade = 'fadeIn';
            display = 'hide';
        }
        CanalTP.jQuery(el_display)[display]();
        CanalTP.jQuery(el_css).css({
            'visibility': visibility,
            'height': height
        });
        if (fade !== null) {
            CanalTP.jQuery(el_fade)[fade]('fast');
        }
    },


    /**
     * Function to add an event to the geocoding tooltip
     * @param {String} address
     * @returns {undefined}
     */
    searchEvent: function(address,map)
    {
        var that = this;
        CanalTP.lib.map.wrapper.addListener(map,
            'infobubbleEvent',
            CanalTP.jQuery.proxy(function(infoBubble){
                CanalTP.jQuery(infoBubble.content_).on(
                    'click','.ctp-journey-links',{view: that},
                    function(e) {
                        e.preventDefault();
                        var fieldType = CanalTP.jQuery(this).attr('data-type');
                        e.data.view.fillSearchForm(fieldType, address, infoBubble.position);
                    }
                );
                CanalTP.lib.map.wrapper.clearListeners(
                     map,
                    'infobubbleEvent'
                );
            }, this)
        );
    },

    /**
     * Function to fill in the search form
     * @param {String} fieldType field's type (from , to)
     * @param {String} address description of the location (adress)
     * @param {Object} position position of the location (point coordinates)
     * @returns {undefined}
     */
    fillSearchForm: function(fieldType, address, position)
    {
        var coordLon = CanalTP.lib.map.wrapper.getLon(position, 'reverse');
        var coordLat = CanalTP.lib.map.wrapper.getLat(position, 'reverse');
        var coord = coordLon + ';' + coordLat;

        CanalTP.jQuery('#search_' + fieldType + '_autocomplete').val(address);
        CanalTP.jQuery('#search_' + fieldType + '_autocomplete-hidden').val(coord);
        CanalTP.jQuery('#search_' + fieldType + '_autocomplete-hidden').data(
                'coord',
                {"lat": coordLat, "lon": coordLon}
        );
        CanalTP.jQuery('#search_' + fieldType + '_autocomplete-hidden').trigger('AutoCompleteCoord');
        var tab_to_show = "li a[href='#ctp-journey']";
        CanalTP.jQuery(tab_to_show).click();
    }
});

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

/**
 * Model CanalTP.lib.map.models
 * Contient les models de base de la librairie
 * Ces models sont utilisables pour Gmap et osmap
 * Author RNE
 * CanalTP 2013
 * @type @exp;Backbone@pro;Model@call;extend
 */
CanalTP.lib = CanalTP.lib || {};
CanalTP.lib.map = CanalTP.lib.map || {};
CanalTP.lib.map.models = CanalTP.lib.map.models || {};

CanalTP.lib.map.models.libModels = Backbone.Model.extend({
    defaults: {
        "mapElement": null
    },

    /**
     * Création de l'infobulle
     */
    createInfobulle: function()
    {
        var infoBubble = new InfoBubble();
        infoBubble.setMaxSize(this.get('iMaxWidth'), this.get('iMaxHeight'));
        if (typeof(infoBubble.setPosition) === 'function') {
            infoBubble.setPosition(this.get('point'));
        }
        if (typeof(infoBubble.setClass) === 'function') {
            infoBubble.setClass(this.get('class'));
        }
        infoBubble.setContent(this.get('iContent'));
        this.set('objInfobulle', infoBubble);
    },

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

    /**
     * Fonction permettant de supprimer un element de la map lorsqu'on le supprime de sa collection
     */
    deleteObjectOnMap: function()
    {
        if (typeof(this.get('mapElement').setMap) === 'function') {
            this.get('mapElement').setMap(null);
        } else {
            this.get('mapElement').destroy();
        }
    }
});
/**
 * Model de base pour les infobulles
 * @type @exp;Backbone@pro;Model@call;extend
 */
CanalTP.lib.map.models.infobulle = CanalTP.lib.map.models.libModels.extend({
    defaults: {
        "iContent" : "",
        "objInfobulle" : null,
        "point" : null,
        "iMaxHeight" : 300,
        "iMaxWidth" : 300,
        "class": 'ctp-popup'
    }
});
/**
 * Model de base pour l'initialisation de la map
 * @type @exp;Backbone@pro;Model@call;extend
 */
CanalTP.lib.map.models.initMap = CanalTP.lib.map.models.libModels.extend({
    defaults:{
        "objMap": null,
        "point": null,
        "zoom": 10,
        "centerX": null,
        "centerY": null,
        "divId": null,
        "addPopin": false
    },

    /**
     * Fonction permettant l'initialisation
     */
    initialize: function()
    {
        this.setWrappers();
        var error = this.validate(this.attributes);
        if(error){
            console.log(error);
            this.set('validationError', error);
            return false;
        }else{
            this.createMapModel();
        }
    }
});

/**
 * Model de base pour les marqueurs
 * @type @exp;Backbone@pro;Model@call;extend
 */
CanalTP.lib.map.models.marker = CanalTP.lib.map.models.libModels.extend({
    defaults: _.extend({}, CanalTP.lib.map.models.infobulle.prototype.defaults,
        {
            "lat" : null,
            "lon" : null,
            "point" : null,
            "title" : "",
            "isDraggable" : false,
            "isClickable" : false,
            "isAlwaysVisible" : true,
            "minZoom" : null,
            "maxZoom" : null,
            "graphicWidth" : 28,
            "graphicHeight" : 28,
            "graphicOpacity": 1,
            "graphicZIndex": 5,
            "graphicXOffset": null,
            "graphicYOffset": null
        }
    ),
    /**
     * Fonction permettant l'initialisation
     */
    initialize: function()
    {
        this.createModelMarker();
        this.on("remove", this.deleteObjectOnMap);
    }
});
/**
 * Model de base pour les polylines
 * @type @exp;Backbone@pro;Model@call;extend
 */
CanalTP.lib.map.models.polyline = CanalTP.lib.map.models.libModels.extend({
    defaults: _.extend({}, CanalTP.lib.map.models.infobulle.prototype.defaults,
        {
            "color": "#FF0000",
            "randomColor": false,
            "opacity": 0.8,
            "weight": 2,
            "zIndex": 0,
            "graphicZIndex": 0,
            "path": [],
            "latLngsPath": [],
            "point": null,
            "isClickable": true,
            "isHoverable": false,
            "isDraggable": false,
            "isEditable": false,
            "isAlwaysVisible": true,
            "minZoom": null,
            "maxZoom": null
        }
    ),
    /**
     * Fonction permettant l'initialisation
     */
    initialize: function()
    {
        this.createModelPolyline();
        this.on("remove", this.deleteObjectOnMap);
        this.on("change", this.createPolylineObject);
    },
    /**
     * Fonction permettant de gérer les couleurs du polyline
     * (couleur définit dans les settings ou activation du random de couleurs)
     */
    setPolylineColor: function()
    {
        if (this.get('randomColor') === true) {
            var color = '#' + Math.floor(Math.random() * 16777215).toString(16);
            this.set('color', color);
        }
    }
});

/**
 * Model de base pour les KMls
 * @type @exp;Backbone@pro;Model@call;extend
 */
CanalTP.lib.map.models.kml = CanalTP.lib.map.models.libModels.extend({
    defaults:{
        "objkmlEvent" : null,
        "url": null,
        "type": "default",
        "isClickable": true,
        "kmlActions": "none",
        "zoomToClic": 13,
        "isAlwaysVisible" : true,
        "minZoom" : null,
        "maxZoom" : null,
        "point": null
    }
});

/**
 * Model de base pour les cercles
 * @type @exp;Backbone@pro;Model@call;extend
 */
CanalTP.lib.map.models.circle = CanalTP.lib.map.models.libModels.extend({
    defaults:{
        "isClickable": false,
        "isDraggable": false,
        "isEditable": false,
        "fillColor": "#ffffff",
        "fillOpacity": 0.4,
        "strokeColor": "#d5d5d5",
        "strokeOpacity": 1,
        "strokeWeight": 2,
        "isAlwaysVisible" : true,
        "zIndex": 0
    },
    /**
     * Fonction permettant l'initialisation
     */
    initialize: function()
    {
        this.createModelCircle();
        this.on("remove", this.deleteObjectOnMap);
    }
});



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

// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @externs_url http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/maps/google_maps_api_v3.js
// ==/ClosureCompiler==

/**
 * @name CSS3 InfoBubble with tabs for Google Maps API V3
 * @version 0.8
 * @author Luke Mahe
 * @fileoverview
 * This library is a CSS Infobubble with tabs. It uses css3 rounded corners and
 * drop shadows and animations. It also allows tabs
 */

/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function getInternetExplorerVersion()
// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser).
{
  var rv = -1; // Return value assumes failure.
  if (navigator.appName === 'Microsoft Internet Explorer')
  {
    var ua = navigator.userAgent;
    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) !== null)
      rv = parseFloat( RegExp.$1 );
  }
  return rv;
}

function isVersionUnder8()
{

  var ver = getInternetExplorerVersion();

  if ( ver > -1 && ver < 8.0)
  {
    return true;
  }
  return false;
}

/**
 * A CSS3 InfoBubble v0.8
 * @param {Object.<string, *>=} opt_options Optional properties to set.
 * @extends {google.maps.OverlayView}
 * @constructor
 */
function InfoBubble(opt_options) {
  this.extend(InfoBubble, google.maps.OverlayView);
  this.tabs_ = [];
  this.activeTab_ = null;
  this.baseZIndex_ = 100;
  this.isOpen_ = false;
  this.isScroll_ = false;

  var options = opt_options || {};

  if (options['backgroundColor'] === undefined) {
    options['backgroundColor'] = this.BACKGROUND_COLOR_;
  }

  if (options['borderColor'] === undefined) {
    options['borderColor'] = this.BORDER_COLOR_;
  }

  if (options['borderRadius'] === undefined) {
    options['borderRadius'] = this.BORDER_RADIUS_;
  }

  if (options['borderWidth'] === undefined) {
    options['borderWidth'] = this.BORDER_WIDTH_;
  }

  if (options['padding'] === undefined) {
    options['padding'] = this.PADDING_;
  }

  if (options['arrowPosition'] === undefined) {
    options['arrowPosition'] = this.ARROW_POSITION_;
  }

  if (options['disableAutoPan'] === undefined) {
    options['disableAutoPan'] = false;
  }

  if (options['disableAnimation'] === undefined) {
    options['disableAnimation'] = false;
  }

  if (options['minWidth'] === undefined) {
    options['minWidth'] = this.MIN_WIDTH_;
  }

  if (options['maxWidth'] === undefined) {
    options['maxWidth'] = this.MAX_WIDTH_;
  }

  if (options['maxHeight'] === undefined) {
    options['maxHeight'] = this.MAX_HEIGHT_;
  }

  if (options['shadowStyle'] === undefined) {
    options['shadowStyle'] = this.SHADOW_STYLE_;
  }

  if (options['arrowSize'] === undefined) {
    options['arrowSize'] = this.ARROW_SIZE_;
  }

  if (options['arrowStyle'] === undefined) {
    options['arrowStyle'] = this.ARROW_STYLE_;
  }
  
  if (options['closeImg'] === undefined) {
    options['closeImg'] = this.CLOSE_IMG_;
  }

  if (options['closeTop'] === undefined) {
    options['closeTop'] = this.CLOSE_TOP_;
  }

  if (options['closeRight'] === undefined) {
    options['closeRight'] = this.CLOSE_RIGHT_;
  }

  this.buildDom_();

      this.setValues(options);
  }
window['InfoBubble'] = InfoBubble;


/**
 * Default arrow size
 * @const
 * @private
 */
InfoBubble.prototype.ARROW_SIZE_ = 15;


/**
 * Default arrow style
 * @const
 * @private
 */
InfoBubble.prototype.ARROW_STYLE_ = 0;


/**
 * Default shadow style
 * @const
 * @private
 */
InfoBubble.prototype.SHADOW_STYLE_ = 1;


/**
 * Default min width
 * @const
 * @private
 */
InfoBubble.prototype.MIN_WIDTH_ = 150;

/**
 * Default max width
 * @const
 * @private
 */
InfoBubble.prototype.MAX_WIDTH_ = 300;

/**
 * Default max height
 * @const
 * @private
 */
InfoBubble.prototype.MAX_HEIGHT_ = 200;


/**
 * Default arrow position
 * @const
 * @private
 */
InfoBubble.prototype.ARROW_POSITION_ = 50;


/**
 * Default padding
 * @const
 * @private
 */
InfoBubble.prototype.PADDING_ = 10;


/**
 * Default border width
 * @const
 * @private
 */
InfoBubble.prototype.BORDER_WIDTH_ = 1;


/**
 * Default border color
 * @const
 * @private
 */
InfoBubble.prototype.BORDER_COLOR_ = 'transparent';


/**
 * Default border radius
 * @const
 * @private
 */
InfoBubble.prototype.BORDER_RADIUS_ = 0;


/**
 * Default background color
 * @const
 * @private
 */
InfoBubble.prototype.BACKGROUND_COLOR_ = '#fff';

/**
 * Default cursor img src
 * @const
 * @private
 */
InfoBubble.prototype.CLOSE_IMG_ = CanalTP.close_img;

/**
 * Default close margin-top
 * @const
 * @private
 */
InfoBubble.prototype.CLOSE_TOP_ = 2;

/**
 * Default close margin-right
 * @const
 * @private
 */
InfoBubble.prototype.CLOSE_RIGHT_ = 2;


/**
 * Extends a objects prototype by anothers.
 *
 * @param {Object} obj1 The object to be extended.
 * @param {Object} obj2 The object to extend with.
 * @return {Object} The new extended object.
 * @ignore
 */
InfoBubble.prototype.extend = function(obj1, obj2) {
  return (function(object) {
    for (var property in object.prototype) {
      this.prototype[property] = object.prototype[property];
    }
    return this;
  }).apply(obj1, [obj2]);
};


/**
 * Builds the InfoBubble dom
 * @private
 */
InfoBubble.prototype.buildDom_ = function() {
  var bubble = this.bubble_ = document.createElement('DIV');

  bubble.style['position'] = 'absolute';
  bubble.style['marginTop'] = '-15px';
  bubble.style['zIndex'] = this.baseZIndex_;

  var tabsContainer = this.tabsContainer_ = document.createElement('DIV');
  tabsContainer.style['position'] = 'relative';

  // Close button
  var close = this.close_ = document.createElement('IMG');
  close.style['position'] = 'absolute';
  // Disabled code because it's better to let browser determine image size (images can be different)
  //close.style['width'] = this.px(12);
  //close.style['height'] = this.px(12);
  close.style['border'] = 0;
  close.style['zIndex'] = this.baseZIndex_ + 1;
  close.style['cursor'] = 'pointer';

  if(isVersionUnder8()) {
    close.style['marginTop'] = '15px';
  }

  close.src = this.CLOSE_IMG_;

  var that = this;
  google.maps.event.addDomListener(close, 'click', function() {
    that.close();
    google.maps.event.trigger(that, 'closeclick');
  });

  // Content area
  var contentContainer = this.contentContainer_ = document.createElement('DIV');
  contentContainer.className = 'ctp-popup';
  contentContainer.style['cursor'] = 'default';
  contentContainer.style['clear'] = 'both';
  contentContainer.style['position'] = 'relative';

  var content = this.content_ = document.createElement('DIV');
  content.className = 'ctp-popup-content';
  contentContainer.appendChild(content);

  // Arrow
  var arrow = this.arrow_ = document.createElement('DIV');
  arrow.style['position'] = 'relative';

  var arrowOuter = this.arrowOuter_ = document.createElement('DIV');
  arrowOuter.className = 'ctp-popup-arrow-outer';
  var arrowInner = this.arrowInner_ = document.createElement('DIV');
  arrowInner.className = 'ctp-popup-arrow-inner';

  var arrowSize = this.getArrowSize_();

  arrowOuter.style['position'] = arrowInner.style['position'] = 'absolute';
  arrowOuter.style['left'] = arrowInner.style['left'] = '50%';
  arrowOuter.style['height'] = arrowInner.style['height'] = '0';
  arrowOuter.style['width'] = arrowInner.style['width'] = '0';
  arrowOuter.style['marginLeft'] = this.px(-arrowSize);
  arrowOuter.style['borderWidth'] = this.px(arrowSize);
  arrowOuter.style['borderBottomWidth'] = 0;

  // Shadow
  var bubbleShadow = this.bubbleShadow_ = document.createElement('DIV');
  bubbleShadow.style['position'] = 'absolute';

  // Hide the InfoBubble by default
  bubble.style['display'] = bubbleShadow.style['display'] = 'none';

  bubble.appendChild(this.tabsContainer_);
  bubble.appendChild(close);
  bubble.appendChild(contentContainer);
  arrow.appendChild(arrowOuter);
  arrow.appendChild(arrowInner);
  bubble.appendChild(arrow);

  var stylesheet = document.createElement('style');
  stylesheet.setAttribute('type', 'text/css');

  /**
   * The animation for the infobubble
   * @type {string}
   */
  this.animationName_ = '_ibani_' + Math.round(Math.random() * 10000);

  var css = '.' + this.animationName_ + '{-webkit-animation-name:' +
      this.animationName_ + ';-webkit-animation-duration:0.5s;' +
      '-webkit-animation-iteration-count:1;}' +
      '@-webkit-keyframes ' + this.animationName_ + ' {from {' +
      '-webkit-transform: scale(0)}50% {-webkit-transform: scale(1.2)}90% ' +
      '{-webkit-transform: scale(0.95)}to {-webkit-transform: scale(1)}}';

  stylesheet.textContent = css;
  document.getElementsByTagName('head')[0].appendChild(stylesheet);
};


/**
 * Sets the background class name
 *
 * @param {string} className The class name to set.
 */
InfoBubble.prototype.setBackgroundClassName = function(className) {
  this.set('backgroundClassName', className);
};
InfoBubble.prototype['setBackgroundClassName'] = InfoBubble.prototype.setBackgroundClassName;

/**
 * Close img setter
 *
 * @param {string} closeImg The close image
 */
InfoBubble.prototype.setCloseImg = function(closeImg) {
    this.set('closeImg', closeImg);
};
InfoBubble.prototype['setCloseImg'] = InfoBubble.prototype.setCloseImg;

/**
 * Close top getter
 *
 * @private
 * @return {number} closeTop The close top
 */
InfoBubble.prototype.getCloseTop = function() {
  return parseInt(this.get('closeTop'), 10) + this.getBorderWidth_() || 0;
};

/**
 * Close top setter
 *
 * @param {string} closeTop The close top
 */
InfoBubble.prototype.setCloseTop = function(closeTop) {
    this.set('closeTop', closeTop);
};
InfoBubble.prototype['setCloseTop'] = InfoBubble.prototype.setCloseTop;

/**
 * Close right getter
 *
 * @private
 * @return {number} closeRight The close right
 */
InfoBubble.prototype.getCloseRight = function() {
  return parseInt(this.get('closeRight'), 10) + this.getBorderWidth_() || 0;
};

/**
 * Close right setter
 *
 * @param {string} closeRight The close right
 */
InfoBubble.prototype.setCloseRight = function(closeRight) {
    this.set('closeRight', closeRight);
};
InfoBubble.prototype['setCloseRight'] = InfoBubble.prototype.setCloseRight;

/**
 * changed MVC callback
 */
InfoBubble.prototype.backgroundClassName_changed = function() {
  this.content_.className = this.get('backgroundClassName');
};
InfoBubble.prototype['backgroundClassName_changed'] =
    InfoBubble.prototype.backgroundClassName_changed;


/**
 * Sets the class of the tab
 *
 * @param {string} className the class name to set.
 */
InfoBubble.prototype.setTabClassName = function(className) {
  this.set('tabClassName', className);
};
InfoBubble.prototype['setTabClassName'] = InfoBubble.prototype.setTabClassName;


/**
 * tabClassName changed MVC callback
 */
InfoBubble.prototype.tabClassName_changed = function() {
  this.updateTabStyles_();
};
InfoBubble.prototype['tabClassName_changed'] = InfoBubble.prototype.tabClassName_changed;


/**
 * Gets the style of the arrow
 *
 * @private
 * @return {number} The style of the arrow.
 */
InfoBubble.prototype.getArrowStyle_ = function() {
  return parseInt(this.get('arrowStyle'), 10) || 0;
};


/**
 * Sets the style of the arrow
 *
 * @param {number} style The style of the arrow.
 */
InfoBubble.prototype.setArrowStyle = function(style) {
  this.set('arrowStyle', style);
};
InfoBubble.prototype['setArrowStyle'] = InfoBubble.prototype.setArrowStyle;


/**
 * Arrow style changed MVC callback
 */
InfoBubble.prototype.arrowStyle_changed = function() {
  this.arrowSize_changed();
};
InfoBubble.prototype['arrowStyle_changed'] = InfoBubble.prototype.arrowStyle_changed;


/**
 * Gets the size of the arrow
 *
 * @private
 * @return {number} The size of the arrow.
 */
InfoBubble.prototype.getArrowSize_ = function() {
  return parseInt(this.get('arrowSize'), 10) || 0;
};


/**
 * Sets the size of the arrow
 *
 * @param {number} size The size of the arrow.
 */
InfoBubble.prototype.setArrowSize = function(size) {
  this.set('arrowSize', size);
};
InfoBubble.prototype['setArrowSize'] = InfoBubble.prototype.setArrowSize;


/**
 * Arrow size changed MVC callback
 */
InfoBubble.prototype.arrowSize_changed = function() {
  this.borderWidth_changed();
};
InfoBubble.prototype['arrowSize_changed'] = InfoBubble.prototype.arrowSize_changed;


/**
 * Set the position of the InfoBubble arrow
 *
 * @param {number} pos The position to set.
 */
InfoBubble.prototype.setArrowPosition = function(pos) {
  this.set('arrowPosition', pos);
};
InfoBubble.prototype['setArrowPosition'] = InfoBubble.prototype.setArrowPosition;


/**
 * Get the position of the InfoBubble arrow
 *
 * @private
 * @return {number} The position..
 */
InfoBubble.prototype.getArrowPosition_ = function() {
  return parseInt(this.get('arrowPosition'), 10) || 0;
};


/**
 * arrowPosition changed MVC callback
 */
InfoBubble.prototype.arrowPosition_changed = function() {
  var pos = this.getArrowPosition_();
  this.arrowOuter_.style['left'] = this.arrowInner_.style['left'] = pos + '%';

  this.redraw_();
};
InfoBubble.prototype['arrowPosition_changed'] = InfoBubble.prototype.arrowPosition_changed;


/**
 * Set the zIndex of the InfoBubble
 *
 * @param {number} zIndex The zIndex to set.
 */
InfoBubble.prototype.setZIndex = function(zIndex) {
  this.set('zIndex', zIndex);
};
InfoBubble.prototype['setZIndex'] = InfoBubble.prototype.setZIndex;


/**
 * Get the zIndex of the InfoBubble
 *
 * @return {number} The zIndex to set.
 */
InfoBubble.prototype.getZIndex = function() {
  return parseInt(this.get('zIndex'), 10) || this.baseZIndex_;
};


/**
 * zIndex changed MVC callback
 */
InfoBubble.prototype.zIndex_changed = function() {
  var zIndex = this.getZIndex();

  this.bubble_.style['zIndex'] = this.baseZIndex_ = zIndex;
  this.close_.style['zIndex'] = zIndex + 1;
};
InfoBubble.prototype['zIndex_changed'] = InfoBubble.prototype.zIndex_changed;


/**
 * Set the style of the shadow
 *
 * @param {number} shadowStyle The style of the shadow.
 */
InfoBubble.prototype.setShadowStyle = function(shadowStyle) {
  this.set('shadowStyle', shadowStyle);
};
InfoBubble.prototype['setShadowStyle'] = InfoBubble.prototype.setShadowStyle;


/**
 * Get the style of the shadow
 *
 * @private
 * @return {number} The style of the shadow.
 */
InfoBubble.prototype.getShadowStyle_ = function() {
  return parseInt(this.get('shadowStyle'), 10) || 0;
};


/**
 * shadowStyle changed MVC callback
 */
InfoBubble.prototype.shadowStyle_changed = function() {
  var shadowStyle = this.getShadowStyle_();

  var display = '';
  var shadow = '';
  var backgroundColor = '';
  switch (shadowStyle) {
    case 0:
      display = 'none';
      break;
    case 1:
      shadow = '40px 15px 10px rgba(33,33,33,0.3)';
      backgroundColor = 'transparent';
      break;
    case 2:
      shadow = '0 0 2px rgba(33,33,33,0.3)';
      backgroundColor = 'rgba(33,33,33,0.35)';
      break;
  }
  this.bubbleShadow_.style['boxShadow'] =
      this.bubbleShadow_.style['webkitBoxShadow'] =
      this.bubbleShadow_.style['MozBoxShadow'] = shadow;
  this.bubbleShadow_.style['backgroundColor'] = backgroundColor;
  if (this.isOpen_) {
    this.bubbleShadow_.style['display'] = display;
    this.draw();
  }
};
InfoBubble.prototype['shadowStyle_changed'] = InfoBubble.prototype.shadowStyle_changed;


/**
 * Show the close button
 */
InfoBubble.prototype.showCloseButton = function() {
  this.set('hideCloseButton', false);
};
InfoBubble.prototype['showCloseButton'] = InfoBubble.prototype.showCloseButton;


/**
 * Hide the close button
 */
InfoBubble.prototype.hideCloseButton = function() {
  this.set('hideCloseButton', true);
};
InfoBubble.prototype['hideCloseButton'] = InfoBubble.prototype.hideCloseButton;


/**
 * hideCloseButton changed MVC callback
 */
InfoBubble.prototype.hideCloseButton_changed = function() {
  this.close_.style['display'] = this.get('hideCloseButton') ? 'none' : '';
};
InfoBubble.prototype['hideCloseButton_changed'] = InfoBubble.prototype.hideCloseButton_changed;


/**
 * Set the background color
 *
 * @param {string} color The color to set.
 */
InfoBubble.prototype.setBackgroundColor = function(color) {
  if (color) {
    this.set('backgroundColor', color);
  }
};
InfoBubble.prototype['setBackgroundColor'] = InfoBubble.prototype.setBackgroundColor;


/**
 * backgroundColor changed MVC callback
 */
InfoBubble.prototype.backgroundColor_changed = function() {
  var backgroundColor = this.get('backgroundColor');
  this.contentContainer_.style['backgroundColor'] = backgroundColor;

  this.arrowInner_.style['borderColor'] = backgroundColor + ' transparent transparent';
  this.updateTabStyles_();
};
InfoBubble.prototype['backgroundColor_changed'] = InfoBubble.prototype.backgroundColor_changed;


/**
 * Set the border color
 *
 * @param {string} color The border color.
 */
InfoBubble.prototype.setBorderColor = function(color) {
  if (color) {
    this.set('borderColor', color);
  }
};
InfoBubble.prototype['setBorderColor'] = InfoBubble.prototype.setBorderColor;


/**
 * borderColor changed MVC callback
 */
InfoBubble.prototype.borderColor_changed = function() {
  var borderColor = this.get('borderColor');

  var contentContainer = this.contentContainer_;
  var arrowOuter = this.arrowOuter_;
  contentContainer.style['borderColor'] = borderColor;

  arrowOuter.style['borderColor'] = borderColor + ' transparent transparent';

  contentContainer.style['borderStyle'] =
      arrowOuter.style['borderStyle'] =
      this.arrowInner_.style['borderStyle'] = 'solid';

  this.updateTabStyles_();
};
InfoBubble.prototype['borderColor_changed'] = InfoBubble.prototype.borderColor_changed;


/**
 * Set the radius of the border
 *
 * @param {number} radius The radius of the border.
 */
InfoBubble.prototype.setBorderRadius = function(radius) {
  this.set('borderRadius', radius);
};
InfoBubble.prototype['setBorderRadius'] = InfoBubble.prototype.setBorderRadius;


/**
 * Get the radius of the border
 *
 * @private
 * @return {number} The radius of the border.
 */
InfoBubble.prototype.getBorderRadius_ = function() {
  return parseInt(this.get('borderRadius'), 10) || 0;
};


/**
 * borderRadius changed MVC callback
 */
InfoBubble.prototype.borderRadius_changed = function() {
  var borderRadius = this.getBorderRadius_();
  var borderWidth = this.getBorderWidth_();

  this.contentContainer_.style['borderRadius'] =
  this.contentContainer_.style['MozBorderRadius'] =
  this.contentContainer_.style['webkitBorderRadius'] =
  this.bubbleShadow_.style['borderRadius'] =
  this.bubbleShadow_.style['MozBorderRadius'] =
  this.bubbleShadow_.style['webkitBorderRadius'] = this.px(borderRadius);

  this.tabsContainer_.style['paddingLeft'] =
      this.tabsContainer_.style['paddingRight'] =
      this.px(borderRadius + borderWidth);

  this.redraw_();
};
InfoBubble.prototype['borderRadius_changed'] = InfoBubble.prototype.borderRadius_changed;


/**
 * Get the width of the border
 *
 * @private
 * @return {number} width The width of the border.
 */
InfoBubble.prototype.getBorderWidth_ = function() {
  return parseInt(this.get('borderWidth'), 10) || 0;
};


/**
 * Set the width of the border
 *
 * @param {number} width The width of the border.
 */
InfoBubble.prototype.setBorderWidth = function(width) {
  this.set('borderWidth', width);
};
InfoBubble.prototype['setBorderWidth'] = InfoBubble.prototype.setBorderWidth;


/**
 * borderWidth change MVC callback
 */
InfoBubble.prototype.borderWidth_changed = function() {
  var borderWidth = this.getBorderWidth_();

  this.contentContainer_.style['borderWidth'] = this.px(borderWidth);
  this.tabsContainer_.style['top'] = this.px(borderWidth);

  this.updateArrowStyle_();
  this.updateTabStyles_();
  this.borderRadius_changed();
  this.redraw_();
};
InfoBubble.prototype['borderWidth_changed'] = InfoBubble.prototype.borderWidth_changed;


/**
 * Update the arrow style
 * @private
 */
InfoBubble.prototype.updateArrowStyle_ = function() {
  var borderWidth = this.getBorderWidth_();
  var arrowSize = this.getArrowSize_();
  var arrowStyle = this.getArrowStyle_();
  var arrowOuterSizePx = this.px(arrowSize);
  var arrowInnerSizePx = this.px(Math.max(0, arrowSize - borderWidth - 1));

  var outer = this.arrowOuter_;
  var inner = this.arrowInner_;

  this.arrow_.style['marginTop'] = this.px(-borderWidth);
  outer.style['borderTopWidth'] = arrowOuterSizePx;
  inner.style['borderTopWidth'] = arrowInnerSizePx;

  // Full arrow or arrow pointing to the left
  if (arrowStyle === 0 || arrowStyle === 1) {
    outer.style['borderLeftWidth'] = arrowOuterSizePx;
    inner.style['borderLeftWidth'] = arrowInnerSizePx;
  } else {
    outer.style['borderLeftWidth'] = inner.style['borderLeftWidth'] = 0;
  }

  // Full arrow or arrow pointing to the right
  if (arrowStyle === 0 || arrowStyle === 2) {
    outer.style['borderRightWidth'] = arrowOuterSizePx;
    inner.style['borderRightWidth'] = arrowInnerSizePx;
  } else {
    outer.style['borderRightWidth'] = inner.style['borderRightWidth'] = 0;
  }

  if (arrowStyle < 2) {
    outer.style['marginLeft'] = this.px(-(arrowSize));
    inner.style['marginLeft'] = this.px(-(arrowSize - borderWidth - 1));
  } else {
    outer.style['marginLeft'] = inner.style['marginLeft'] = 0;
  }

  // If there is no border then don't show thw outer arrow
  if (borderWidth === 0) {
    outer.style['display'] = 'none';
  } else {
    outer.style['display'] = '';
  }
};


/**
 * Set the padding of the InfoBubble
 *
 * @param {number} padding The padding to apply.
 */
InfoBubble.prototype.setPadding = function(padding) {
  this.set('padding', padding);
};
InfoBubble.prototype['setPadding'] = InfoBubble.prototype.setPadding;


/**
 * Set the padding of the InfoBubble
 *
 * @private
 * @return {number} padding The padding to apply.
 */
InfoBubble.prototype.getPadding_ = function() {
  return parseInt(this.get('padding'), 10) || 0;
};


/**
 * padding changed MVC callback
 */
InfoBubble.prototype.padding_changed = function() {
  var padding = this.getPadding_();
  this.contentContainer_.style['padding'] = this.px(padding);
  this.updateTabStyles_();

  this.redraw_();
};
InfoBubble.prototype['padding_changed'] = InfoBubble.prototype.padding_changed;


/**
 * Add px extention to the number
 *
 * @param {number} num The number to wrap.
 * @return {string|number} A wrapped number.
 */
InfoBubble.prototype.px = function(num) {
  if (num) {
    // 0 doesn't need to be wrapped
    return num + 'px';
  }
  return num;
};


/**
 * Add events to stop propagation
 * @private
 */
InfoBubble.prototype.addEvents_ = function() {
  // We want to cancel all the events so they do not go to the map
  var events = ['mousedown', 'mousemove', 'mouseover', 'mouseout', 'mouseup',
      'mousewheel', 'DOMMouseScroll', 'touchstart', 'touchend', 'touchmove',
      'dblclick', 'contextmenu', 'click'];

  var bubble = this.bubble_;
  this.listeners_ = [];
  for (var i = 0, event; event = events[i]; i++) {
    this.listeners_.push(
      google.maps.event.addDomListener(bubble, event, function(e) {
        e.cancelBubble = true;
        if (e.stopPropagation) {
          e.stopPropagation();
        }
      })
    );
  }
};


/**
 * On Adding the InfoBubble to a map
 * Implementing the OverlayView interface
 */
InfoBubble.prototype.onAdd = function() {
  if (!this.bubble_) {
    this.buildDom_();
  }

  this.addEvents_();

  var panes = this.getPanes();
  if (panes) {
    panes.floatPane.appendChild(this.bubble_);
    panes.floatShadow.appendChild(this.bubbleShadow_);
  }
};
InfoBubble.prototype['onAdd'] = InfoBubble.prototype.onAdd;


/**
 * Draw the InfoBubble
 * Implementing the OverlayView interface
 */
InfoBubble.prototype.draw = function() {
  var projection = this.getProjection();

  if (!projection) {
    // The map projection is not ready yet so do nothing
    return;
  }

  var latLng = /** @type {google.maps.LatLng} */ (this.get('position'));

  if (!latLng) {
    this.close();
    return;
  }

  var tabHeight = 0;

  if (this.activeTab_) {
    tabHeight = this.activeTab_.offsetHeight;
  }

  var anchorHeight = this.getAnchorHeight_();
  var arrowSize = this.getArrowSize_();
  var arrowPosition = this.getArrowPosition_();

  arrowPosition = arrowPosition / 100;

  var pos = projection.fromLatLngToDivPixel(latLng);
  var width = this.contentContainer_.offsetWidth;
  var height = this.bubble_.offsetHeight;
  if (!width) {
    return;
  }

  // Adjust for the height of the info bubble
  var top = pos.y - (height + arrowSize);

  if (anchorHeight) {
    // If there is an anchor then include the height
    top -= anchorHeight;
  }

  var left = pos.x - (width * arrowPosition);
  this.bubble_.style['top'] = this.px(top);
  this.bubble_.style['left'] = this.px(left);

  var shadowStyle = parseInt(this.get('shadowStyle'), 10);

  switch (shadowStyle) {
    case 1:
      // Shadow is behind
      this.bubbleShadow_.style['top'] = this.px(top + tabHeight - 1);
      this.bubbleShadow_.style['left'] = this.px(left);
      this.bubbleShadow_.style['width'] = this.px(width);
      this.bubbleShadow_.style['height'] =
          this.px(this.contentContainer_.offsetHeight - arrowSize);
      break;
    case 2:
      // Shadow is below
      width = width * 0.8;
      if (anchorHeight) {
        this.bubbleShadow_.style['top'] = this.px(pos.y);
      } else {
        this.bubbleShadow_.style['top'] = this.px(pos.y + arrowSize);
      }
      this.bubbleShadow_.style['left'] = this.px(pos.x - width * arrowPosition);

      this.bubbleShadow_.style['width'] = this.px(width);
      this.bubbleShadow_.style['height'] = this.px(2);
      break;
  }
};
InfoBubble.prototype['draw'] = InfoBubble.prototype.draw;


/**
 * Removing the InfoBubble from a map
 */
InfoBubble.prototype.onRemove = function() {
  if (this.bubble_ && this.bubble_.parentNode) {
    this.bubble_.parentNode.removeChild(this.bubble_);
  }
  if (this.bubbleShadow_ && this.bubbleShadow_.parentNode) {
    this.bubbleShadow_.parentNode.removeChild(this.bubbleShadow_);
  }

  for (var i = 0, listener; listener = this.listeners_[i]; i++) {
    google.maps.event.removeListener(listener);
  }
};
InfoBubble.prototype['onRemove'] = InfoBubble.prototype.onRemove;


/**
 * Is the InfoBubble open
 *
 * @return {boolean} If the InfoBubble is open.
 */
InfoBubble.prototype.isOpen = function() {
    return this.isOpen_;
};
InfoBubble.prototype['isOpen'] = InfoBubble.prototype.isOpen;


/**
 * Close the InfoBubble
 */
InfoBubble.prototype.close = function() {
  if (this.bubble_) {
    this.bubble_.style['display'] = 'none';
    // Remove the animation so we next time it opens it will animate again
    this.bubble_.className =
        this.bubble_.className.replace(this.animationName_, '');
  }

  if (this.bubbleShadow_) {
    this.bubbleShadow_.style['display'] = 'none';
    this.bubbleShadow_.className =
        this.bubbleShadow_.className.replace(this.animationName_, '');
  }
  this.isOpen_ = false;
};
InfoBubble.prototype['close'] = InfoBubble.prototype.close;


/**
 * Open the InfoBubble
 *
 * @param {google.maps.Map=} opt_map Optional map to open on.
 * @param {google.maps.MVCObject=} opt_anchor Optional anchor to position at.
 */
InfoBubble.prototype.open = function(opt_map, opt_anchor) {
  if (opt_map) {
    this.setMap(opt_map);
  }

  if (opt_anchor) {
    this.set('anchor', opt_anchor);
    this.bindTo('anchorPoint', opt_anchor);
    this.bindTo('position', opt_anchor);
  }

  // Show the bubble and the show
  this.bubble_.style['display'] = this.bubbleShadow_.style['display'] = '';
  var animation = !this.get('disableAnimation');

  if (animation) {
    // Add the animation
    this.bubble_.className += ' ' + this.animationName_;
    this.bubbleShadow_.className += ' ' + this.animationName_;
  }

  this.redraw_();
  this.isOpen_ = true;

  var pan = !this.get('disableAutoPan');
  if (pan) {
    var that = this;
    window.setTimeout(function() {
      // Pan into view, done in a time out to make it feel nicer :)
      that.panToView();
    }, 200);
  }
};
InfoBubble.prototype['open'] = InfoBubble.prototype.open;


/**
 * Set the position of the InfoBubble
 *
 * @param {google.maps.LatLng} position The position to set.
 */
InfoBubble.prototype.setPosition = function(position) {
  if (position) {
    this.set('position', position);
  }
};
InfoBubble.prototype['setPosition'] = InfoBubble.prototype.setPosition;


/**
 * Returns the position of the InfoBubble
 *
 * @return {google.maps.LatLng} the position.
 */
InfoBubble.prototype.getPosition = function() {
  return /** @type {google.maps.LatLng} */ (this.get('position'));
};
InfoBubble.prototype['getPosition'] = InfoBubble.prototype.getPosition;


/**
 * position changed MVC callback
 */
InfoBubble.prototype.position_changed = function() {
  this.draw();
};
InfoBubble.prototype['position_changed'] =
    InfoBubble.prototype.position_changed;


/**
 * Pan the InfoBubble into view
 */
InfoBubble.prototype.panToView = function() {
  var projection = this.getProjection();

  if (!projection) {
    // The map projection is not ready yet so do nothing
    return;
  }

  if (!this.bubble_) {
    // No Bubble yet so do nothing
    return;
  }

  var anchorHeight = this.getAnchorHeight_();
  var height = this.bubble_.offsetHeight + anchorHeight;
  var map = this.get('map');
  var mapDiv = map.getDiv();
  var mapHeight = mapDiv.offsetHeight;

  var latLng = this.getPosition();
  var centerPos = projection.fromLatLngToContainerPixel(map.getCenter());
  var pos = projection.fromLatLngToContainerPixel(latLng);

  // Find out how much space at the top is free
  var spaceTop = centerPos.y - height;

  // Fine out how much space at the bottom is free
  var spaceBottom = mapHeight - centerPos.y;

  var needsTop = spaceTop < 0;
  var deltaY = 0;

  if (needsTop) {
    spaceTop *= -1;
    deltaY = (spaceTop + spaceBottom) / 2;
  }

  pos.y -= deltaY + 50;

  latLng = projection.fromContainerPixelToLatLng(pos);

  if (map.getCenter() !== latLng) {
    map.panTo(latLng);
  }
};
InfoBubble.prototype['panToView'] = InfoBubble.prototype.panToView;


/**
 * Converts a HTML string to a document fragment.
 *
 * @param {string} htmlString The HTML string to convert.
 * @return {Node} A HTML document fragment.
 * @private
 */
InfoBubble.prototype.htmlToDocumentFragment_ = function(htmlString) {
  htmlString = htmlString.replace(/^\s*([\S\s]*)\b\s*$/, '$1');
  var tempDiv = document.createElement('DIV');
  tempDiv.innerHTML = htmlString;
  if (tempDiv.childNodes.length === 1) {
    return /** @type {!Node} */ (tempDiv.removeChild(tempDiv.firstChild));
  } else {
    var fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    return fragment;
  }
};


/**
 * Removes all children from the node.
 *
 * @param {Node} node The node to remove all children from.
 * @private
 */
InfoBubble.prototype.removeChildren_ = function(node) {
  if (!node) {
    return;
  }

  var child;
  while (child === node.firstChild) {
    node.removeChild(child);
  }
};


/**
 * Sets the content of the infobubble.
 *
 * @param {string|Node} content The content to set.
 */
InfoBubble.prototype.setContent = function(content) {
  this.set('content', content);
};
InfoBubble.prototype['setContent'] = InfoBubble.prototype.setContent;


/**
 * Get the content of the infobubble.
 *
 * @return {string|Node} The marker content.
 */
InfoBubble.prototype.getContent = function() {
  return /** @type {Node|string} */ (this.get('content'));
};
InfoBubble.prototype['getContent'] = InfoBubble.prototype.getContent;

/**
 * Sets the additional contents of the infobubble.
 *
 * @param {string} index The key of the additional content
 * @param {string|Node} additionalContent The additional content to set.
 */
InfoBubble.prototype.setAdditionalContent = function(index, additionalContent) {
  this.set('additionalContent['+index+']', additionalContent);
};
InfoBubble.prototype['setAdditionalContent'] = InfoBubble.prototype.setAdditionalContent;


/**
 * Get the additional contents of the infobubble.
 *
 * @param {string} index The key of the additional content
 * @return {string|Node} The marker additionalContent.
 */
InfoBubble.prototype.getAdditionalContent = function(index) {
  return /** @type {Node|string} */ (this.get('additionalContent['+index+']'));
};
InfoBubble.prototype['getAdditionalContent'] = InfoBubble.prototype.getAdditionalContent;

/**
 * Sets the marker content and adds loading events to images
 */
InfoBubble.prototype.content_changed = function() {
  if (!this.content_) {
    // The Content area doesnt exist.
    return;
  }

  this.removeChildren_(this.content_);
  var content = this.getContent();
  if (content) {
    if (typeof content === 'string') {
      content = this.htmlToDocumentFragment_(content);
    }
    this.content_.appendChild(content);

    var that = this;
    var images = this.content_.getElementsByTagName('IMG');
    for (var i = 0, image; image = images[i]; i++) {
      // Because we don't know the size of an image till it loads, add a
      // listener to the image load so the marker can resize and reposition
      // itself to be the correct height.
      google.maps.event.addDomListener(image, 'load', function() {
        that.imageLoaded_();
      });
    }
    google.maps.event.trigger(this, 'domready');
  }
  this.redraw_();
};
InfoBubble.prototype['content_changed'] = InfoBubble.prototype.content_changed;


/**
 * Image loaded
 * @private
 */
InfoBubble.prototype.imageLoaded_ = function() {
  var pan = !this.get('disableAutoPan');
  this.redraw_();
  if (pan && (this.tabs_.length === 0 || this.activeTab_.index === 0)) {
    this.panToView();
  }
};

/**
 * Updates the styles of the tabs
 * @private
 */
InfoBubble.prototype.updateTabStyles_ = function() {
  if (this.tabs_ && this.tabs_.length) {
    for (var i = 0, tab; tab = this.tabs_[i]; i++) {
      this.setTabStyle_(tab.tab);
    }
    this.activeTab_.style['zIndex'] = this.baseZIndex_;
    var borderWidth = this.getBorderWidth_();
    var padding = this.getPadding_() / 2;
    this.activeTab_.style['borderBottomWidth'] = 0;
    this.activeTab_.style['paddingBottom'] = this.px(padding + borderWidth);
  }
};


/**
 * Sets the style of a tab
 * @private
 * @param {Element} tab The tab to style.
 */
InfoBubble.prototype.setTabStyle_ = function(tab) {
  var backgroundColor = this.get('backgroundColor');
  var borderColor = this.get('borderColor');
  var borderRadius = this.getBorderRadius_();
  var borderWidth = this.getBorderWidth_();
  var padding = this.getPadding_();

  var marginRight = this.px(-(Math.max(padding, borderRadius)));
  var borderRadiusPx = this.px(borderRadius);

  var index = this.baseZIndex_;
  if (tab.index) {
    index -= tab.index;
  }

  // The styles for the tab
  var styles = {
    'cssFloat': 'left',
    'position': 'relative',
    'cursor': 'pointer',
    'backgroundColor': backgroundColor,
    'border': this.px(borderWidth) + ' solid ' + borderColor,
    'padding': this.px(padding / 2) + ' ' + this.px(padding),
    'marginRight': marginRight,
    'whiteSpace': 'nowrap',
    'borderRadiusTopLeft': borderRadiusPx,
    'MozBorderRadiusTopleft': borderRadiusPx,
    'webkitBorderTopLeftRadius': borderRadiusPx,
    'borderRadiusTopRight': borderRadiusPx,
    'MozBorderRadiusTopright': borderRadiusPx,
    'webkitBorderTopRightRadius': borderRadiusPx,
    'zIndex': index,
    'display': 'inline'
  };

  for (var style in styles) {
    tab.style[style] = styles[style];
  }

  var className = this.get('tabClassName');
  if (className !== undefined) {
    tab.className += ' ' + className;
  }
};


/**
 * Add user actions to a tab
 * @private
 * @param {Object} tab The tab to add the actions to.
 */
InfoBubble.prototype.addTabActions_ = function(tab) {
  var that = this;
  tab.listener_ = google.maps.event.addDomListener(tab, 'click', function() {
    that.setTabActive_(this);
  });
};


/**
 * Set a tab at a index to be active
 *
 * @param {number} index The index of the tab.
 */
InfoBubble.prototype.setTabActive = function(index) {
  var tab = this.tabs_[index - 1];

  if (tab) {
    this.setTabActive_(tab.tab);
  }
};
InfoBubble.prototype['setTabActive'] = InfoBubble.prototype.setTabActive;


/**
 * Set a tab to be active
 * @private
 * @param {Object} tab The tab to set active.
 */
InfoBubble.prototype.setTabActive_ = function(tab) {
  if (!tab) {
    this.setContent('');
    return;
  }

  var padding = this.getPadding_() / 2;
  var borderWidth = this.getBorderWidth_();

  if (this.activeTab_) {
    var activeTab = this.activeTab_;
    activeTab.style['zIndex'] = this.baseZIndex_ - activeTab.index;
    activeTab.style['paddingBottom'] = this.px(padding);
    activeTab.style['borderBottomWidth'] = this.px(borderWidth);
  }

  tab.style['zIndex'] = this.baseZIndex_;
  tab.style['borderBottomWidth'] = 0;
  tab.style['marginBottomWidth'] = '-10px';
  tab.style['paddingBottom'] = this.px(padding + borderWidth);

  this.setContent(this.tabs_[tab.index].content);

  this.activeTab_ = tab;

  this.redraw_();
};


/**
 * Set the max width of the InfoBubble
 *
 * @param {number} width The max width.
 */
InfoBubble.prototype.setMaxWidth = function(width) {
  this.set('maxWidth', width);
};
InfoBubble.prototype['setMaxWidth'] = InfoBubble.prototype.setMaxWidth;

/**
 * Set the min width of the InfoBubble and the min height
 *
 * @param {number} width The min width.
 * @param {number} height The min height.
 */
InfoBubble.prototype.setMinSize = function(width, height) {
  this.set('minWidth', width);
  this.set('minHeight', height);
};
InfoBubble.prototype['setMinSize'] = InfoBubble.prototype.setMinSize;

/**
 * Set the max width of the InfoBubble and the max height
 *
 * @param {number} width The max width.
 * @param {number} height The max height.
 */
InfoBubble.prototype.setMaxSize = function(width, height) {
  this.set('maxWidth', width);
  this.set('maxHeight', height);
};
InfoBubble.prototype['setMaxSize'] = InfoBubble.prototype.setMaxSize;

/**
 * maxWidth changed MVC callback
 */
InfoBubble.prototype.maxWidth_changed = function() {
  this.redraw_();
};
InfoBubble.prototype['maxWidth_changed'] = InfoBubble.prototype.maxWidth_changed;


/**
 * Set the max height of the InfoBubble
 *
 * @param {number} height The max height.
 */
InfoBubble.prototype.setMaxHeight = function(height) {
    this.set('maxHeight', height);
};
InfoBubble.prototype['setMaxHeight'] = InfoBubble.prototype.setMaxHeight;


/**
 * maxHeight changed MVC callback
 */
InfoBubble.prototype.maxHeight_changed = function() {
    this.redraw_();
};
InfoBubble.prototype['maxHeight_changed'] = InfoBubble.prototype.maxHeight_changed;


/**
 * Set the min width of the InfoBubble
 *
 * @param {number} width The min width.
 */
InfoBubble.prototype.setMinWidth = function(width) {
    this.set('minWidth', width);
};
InfoBubble.prototype['setMinWidth'] = InfoBubble.prototype.setMinWidth;


/**
 * minWidth changed MVC callback
 */
InfoBubble.prototype.minWidth_changed = function() {
    this.redraw_();
};
InfoBubble.prototype['minWidth_changed'] = InfoBubble.prototype.minWidth_changed;


/**
 * Set the min height of the InfoBubble
 *
 * @param {number} height The min height.
 */
InfoBubble.prototype.setMinHeight = function(height) {
    this.set('minHeight', height);
};
InfoBubble.prototype['setMinHeight'] = InfoBubble.prototype.setMinHeight;


/**
 * minHeight changed MVC callback
 */
InfoBubble.prototype.minHeight_changed = function() {
    this.redraw_();
};
InfoBubble.prototype['minHeight_changed'] = InfoBubble.prototype.minHeight_changed;


/**
 * Add a tab
 *
 * @param {string} label The label of the tab.
 * @param {string|Element} content The content of the tab.
 */
InfoBubble.prototype.addTab = function(label, content) {
  var tab = document.createElement('DIV');
  tab.innerHTML = label;

  this.setTabStyle_(tab);
  this.addTabActions_(tab);

  this.tabsContainer_.appendChild(tab);

  this.tabs_.push({
    label: label,
    content: content,
    tab: tab
  });

  tab.index = this.tabs_.length - 1;
  tab.style['zIndex'] = this.baseZIndex_ - tab.index;

  if (!this.activeTab_) {
    this.setTabActive_(tab);
  }

  tab.className = tab.className + ' ' + this.animationName_;

  this.redraw_();
};
InfoBubble.prototype['addTab'] = InfoBubble.prototype.addTab;

/**
 * Update a tab at a speicifc index
 *
 * @param {number} index The index of the tab.
 * @param {?string} opt_label The label to change to.
 * @param {?string} opt_content The content to update to.
 */
InfoBubble.prototype.updateTab = function(index, opt_label, opt_content) {
  if (!this.tabs_.length || index < 0 || index >= this.tabs_.length) {
    return;
  }

  var tab = this.tabs_[index];
  if (opt_label !== undefined) {
    tab.tab.innerHTML = tab.label = opt_label;
  }

  if (opt_content !== undefined) {
    tab.content = opt_content;
  }

  if (this.activeTab_ === tab.tab) {
    this.setContent(tab.content);
  }
  this.redraw_();
};
InfoBubble.prototype['updateTab'] = InfoBubble.prototype.updateTab;


/**
 * Remove a tab at a specific index
 *
 * @param {number} index The index of the tab to remove.
 */
InfoBubble.prototype.removeTab = function(index) {
  if (!this.tabs_.length || index < 0 || index >= this.tabs_.length) {
    return;
  }

  var tab = this.tabs_[index];
  tab.tab.parentNode.removeChild(tab.tab);

  google.maps.event.removeListener(tab.tab.listener_);

  this.tabs_.splice(index, 1);

  delete tab;

  for (var i = 0, t; t = this.tabs_[i]; i++) {
    t.tab.index = i;
  }

  if (tab.tab === this.activeTab_) {
    // Removing the current active tab
    if (this.tabs_[index]) {
      // Show the tab to the right
      this.activeTab_ = this.tabs_[index].tab;
    } else if (this.tabs_[index - 1]) {
      // Show a tab to the left
      this.activeTab_ = this.tabs_[index - 1].tab;
    } else {
      // No tabs left to sho
      this.activeTab_ = undefined;
    }

    this.setTabActive_(this.activeTab_);
  }

  this.redraw_();
};
InfoBubble.prototype['removeTab'] = InfoBubble.prototype.removeTab;


/**
 * Get the size of an element
 * @private
 * @param {Node|string} element The element to size.
 * @return {google.maps.Size} The size of the element.
 */
InfoBubble.prototype.getElementSize_ = function(element) {
  var sizer = document.createElement('DIV');
  sizer.style['display'] = 'inline';
  sizer.style['position'] = 'absolute';
  sizer.style['visibility'] = 'hidden';

  if (typeof element === 'string') {
    sizer.innerHTML = element;
  } else {
    sizer.appendChild(element.cloneNode(true));
  }
  document.body.appendChild(sizer);
  var size = new google.maps.Size(sizer.offsetWidth, sizer.offsetHeight);
  document.body.removeChild(sizer);
  delete sizer;
  return size;
};


/**
 * Redraw the InfoBubble
 * @private
 */
InfoBubble.prototype.redraw_ = function() {
  this.figureOutSize_();
  this.positionCloseButton_();
  this.draw();
};


/**
 * Figure out the optimum size of the InfoBubble
 * @private
 */
InfoBubble.prototype.figureOutSize_ = function() {
    var map = this.get('map');
    if (!map) {
      return;
    }
    var arrowSize = this.getArrowSize_();
    var mapDiv = map.getDiv();
    var gutter = arrowSize * 2;
    var mapWidth = mapDiv.offsetWidth - gutter;
    var mapHeight = mapDiv.offsetHeight - gutter - this.getAnchorHeight_();
    var maxWidth = /** @type {number} */ (this.get('maxWidth') || this.MAX_WIDTH_);
    var maxHeight = /** @type {number} */ (this.get('maxHeight') || this.MAX_HEIGHT_);
    var iWidth = 'auto';
    var iHeight = 'auto';

    maxWidth = Math.min(mapWidth, maxWidth);
    maxHeight = Math.min(mapHeight, maxHeight);
    var content = /** @type {string|Node} */ (this.get('content'));
    if (typeof content === 'string') {
        content = this.htmlToDocumentFragment_(content);
    }
    if (content) {
        var contentSize = this.getElementSize_(content);
        if (maxWidth < contentSize.width + 15) {
            iWidth = this.px(maxWidth);
        } else {
            iWidth = this.px(contentSize.width + 15);
        }
        if (maxHeight < contentSize.height) {
            this.isScroll_ = true;
            iHeight = this.px(maxHeight);
        }
    }
    this.contentContainer_.style['width'] = iWidth;
    this.contentContainer_.style['height'] = iHeight;
};


/**
 *  Get the height of the anchor
 *
 *  This function is a hack for now and doesn't really work that good, need to
 *  wait for pixelBounds to be correctly exposed.
 *  @private
 *  @return {number} The height of the anchor.
 */
InfoBubble.prototype.getAnchorHeight_ = function() {
  var anchor = this.get('anchor');
  if (anchor) {
    var anchorPoint = /** @type google.maps.Point */(this.get('anchorPoint'));

    if (anchorPoint) {
      return -1 * anchorPoint.y;
    }
  }
  return 0;
};

InfoBubble.prototype.anchorPoint_changed = function() {
  this.draw();
};
InfoBubble.prototype['anchorPoint_changed'] = InfoBubble.prototype.anchorPoint_changed;


/**
 * Position the close button in the right spot.
 * @private
 */
InfoBubble.prototype.positionCloseButton_ = function() {
  var right = this.getCloseRight();
  var top = this.getCloseTop();

  if (this.tabs_.length && this.tabHeight_) {
    top += this.tabHeight_;
  }

  var c = this.contentContainer_;
  if (this.isScroll_ === true) {
    // If there are scrollbars then move the cross in so it is not over
    // scrollbar
    right += 20;
    top += 3;
    this.isScroll_ === false;
  }

  this.close_.style['right'] = this.px(right);
  this.close_.style['top'] = this.px(top);
};

// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @externs_url http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/maps/google_maps_api_v3_3.js
// ==/ClosureCompiler==

/**
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0.1
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */

/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * A Marker Clusterer that clusters markers.
 *
 * @param {google.maps.Map} map The Google map to attach to.
 * @param {Array.<google.maps.Marker>=} opt_markers Optional markers to add to
 *   the cluster.
 * @param {Object=} opt_options support the following options:
 *     'gridSize': (number) The grid size of a cluster in pixels.
 *     'maxZoom': (number) The maximum zoom level that a marker can be part of a
 *                cluster.
 *     'zoomOnClick': (boolean) Whether the default behaviour of clicking on a
 *                    cluster is to zoom into it.
 *     'clusterZoomInc': {number} zoom increment when clicking on a cluster
 *     'averageCenter': (boolean) Wether the center of each cluster should be
 *                      the average of all markers in the cluster.
 *     'minimumClusterSize': (number) The minimum number of markers to be in a
 *                           cluster before the markers are hidden and a count
 *                           is shown.
 *     'styles': (object) An object that has style properties:
 *       'url': (string) The image url.
 *       'height': (number) The image height.
 *       'width': (number) The image width.
 *       'anchor': (Array) The anchor position of the label text.
 *       'textColor': (string) The text color.
 *       'textSize': (number) The text size.
 *       'backgroundPosition': (string) The position of the backgound x, y.
 * @constructor
 * @extends google.maps.OverlayView
 */
function MarkerClusterer(map, opt_markers, opt_options) {
    // MarkerClusterer implements google.maps.OverlayView interface. We use the
    // extend function to extend MarkerClusterer with google.maps.OverlayView
    // because it might not always be available when the code is defined so we
    // look for it at the last possible moment. If it doesn't exist now then
    // there is no point going ahead :)
    this.extend(MarkerClusterer, google.maps.OverlayView);
    this.map_ = map;

    /**
     * @type {Array.<google.maps.Marker>}
     * @private
     */
    this.markers_ = [];

    /**
     *  @type {Array.<Cluster>}
     */
    this.clusters_ = [];

    this.sizes = [53, 56, 66, 78, 90];

    /**
     * @private
     */
    this.styles_ = [];

    /**
     * @type {boolean}
     * @private
     */
    this.ready_ = false;

    var options = opt_options || {};

    /**
     * @type {number}
     * @private
     */
    this.gridSize_ = options['gridSize'] || 60;

    /**
     * @private
     */
    this.minClusterSize_ = options['minimumClusterSize'] || 2;

    /**
     * @type {?number}
     * @private
     */
    this.maxZoom_ = options['maxZoom'] || null;

    this.styles_ = options['styles'] || [];

    /**
     * @type {string}
     * @private
     */
    this.imagePath_ = options['imagePath'] || this.MARKER_CLUSTER_IMAGE_PATH_;

    /**
     * @type {string}
     * @private
     */
    this.imageExtension_ = options['imageExtension'] ||
        this.MARKER_CLUSTER_IMAGE_EXTENSION_;

    /**
     * @type {boolean}
     * @private
     */
    this.zoomOnClick_ = true;

    if (options['zoomOnClick'] != undefined) {
        this.zoomOnClick_ = options['zoomOnClick'];
    }
 
    /**
     * @type {number}
     * @private
     */
    this.clusterZoomInc_ = 2;

    if (options['clusterZoomInc'] !== undefined) {
        this.clusterZoomInc_ = options['clusterZoomInc'];
    }
    /**
     * @type {boolean}
     * @private
     */
    this.averageCenter_ = false;
    
    if (options['averageCenter'] !== undefined) {
        this.averageCenter_ = options['averageCenter'];
    }
    
    this.setupStyles_();
    this.setMap(map);
    /**
     * @type {number}
     * @private
     */
    this.prevZoom_ = this.map_.getZoom();
    
    // Add the map event listeners
    var that = this;
    google.maps.event.addListener(this.map_, 'zoom_changed', function() {
        // Determines map type and prevent illegal zoom levels
        var zoom = that.map_.getZoom();
        var minZoom = that.map_.minZoom || 0;
        var maxZoom = Math.min(
            that.map_.maxZoom || 100,
            that.map_.mapTypes[that.map_.getMapTypeId()].maxZoom
        );
        zoom = Math.min(Math.max(zoom,minZoom),maxZoom);
        if (that.prevZoom_ !== zoom) {
            that.prevZoom_ = zoom;
            that.resetViewport();
        }
    });
    google.maps.event.addListener(this.map_, 'idle', function() {
        that.redraw();
    });
    // Finally, add the markers
    if (opt_markers && (opt_markers.length || Object.keys(opt_markers).length)) {
        this.addMarkers(opt_markers, false);
    }
}

/**
 * The marker cluster image path.
 *
 * @type {string}
 * @private
 */
MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_ =
    'http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/' +
    'images/m';

/**
 * The marker cluster image path.
 *
 * @type {string}
 * @private
 */
MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_ = 'png';

/**
 * Extends a objects prototype by anothers.
 *
 * @param {Object} obj1 The object to be extended.
 * @param {Object} obj2 The object to extend with.
 * @return {Object} The new extended object.
 * @ignore
 */
MarkerClusterer.prototype.extend = function(obj1, obj2) {
    return (function(object) {
        for (var property in object.prototype) {
            this.prototype[property] = object.prototype[property];
        }
        return this;
    }).apply(obj1, [obj2]);
};

/**
 * Implementaion of the interface method.
 * @ignore
 */
MarkerClusterer.prototype.onAdd = function() {
    this.setReady_(true);
};

/**
 * Implementaion of the interface method.
 * @ignore
 */
MarkerClusterer.prototype.draw = function() {};

/**
 * Sets up the styles object.
 *
 * @private
 */
MarkerClusterer.prototype.setupStyles_ = function() {
    if (this.styles_.length) {
        return;
    }

    for (var i = 0, size; size = this.sizes[i]; i++) {
        this.styles_.push({
            url: this.imagePath_ + (i + 1) + '.' + this.imageExtension_,
            height: size,
            width: size
        });
    }
};

/**
 *  Fit the map to the bounds of the markers in the clusterer.
 */
MarkerClusterer.prototype.fitMapToMarkers = function() {
    var markers = this.getMarkers();
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0, marker; marker = markers[i]; i++) {
        bounds.extend(marker.getPosition());
    }
    this.map_.fitBounds(bounds);
};

/**
 *  Sets the styles.
 *
 *  @param {Object} styles The style to set.
 */
MarkerClusterer.prototype.setStyles = function(styles) {
    this.styles_ = styles;
};

/**
 *  Gets the styles.
 *
 *  @return {Object} The styles object.
 */
MarkerClusterer.prototype.getStyles = function() {
    return this.styles_;
};

/**
 * Whether zoom on click is set.
 *
 * @return {boolean} True if zoomOnClick_ is set.
 */
MarkerClusterer.prototype.isZoomOnClick = function() {
    return this.zoomOnClick_;
};

/**
 * Gets the cluster zoom increment.
 *
 * @return {Number} cluster zoom increment.
 */
MarkerClusterer.prototype.getClusterZoomInc = function() {
    return this.clusterZoomInc_;
};

/**
 * Whether average center is set.
 *
 * @return {boolean} True if averageCenter_ is set.
 */
MarkerClusterer.prototype.isAverageCenter = function() {
    return this.averageCenter_;
};

/**
 *  Returns the array of markers in the clusterer.
 *
 *  @return {Array.<google.maps.Marker>} The markers.
 */
MarkerClusterer.prototype.getMarkers = function() {
    return this.markers_;
};

/**
 *  Returns the number of markers in the clusterer
 *
 *  @return {Number} The number of markers.
 */
MarkerClusterer.prototype.getTotalMarkers = function() {
    return this.markers_.length;
};

/**
 *  Sets the max zoom for the clusterer.
 *
 *  @param {number} maxZoom The max zoom level.
 */
MarkerClusterer.prototype.setMaxZoom = function(maxZoom) {
    this.maxZoom_ = maxZoom;
};

/**
 *  Gets the max zoom for the clusterer.
 *
 *  @return {number} The max zoom level.
 */
MarkerClusterer.prototype.getMaxZoom = function() {
    return this.maxZoom_;
};

/**
 *  The function for calculating the cluster icon image.
 *
 *  @param {Array.<google.maps.Marker>} markers The markers in the clusterer.
 *  @param {number} numStyles The number of styles available.
 *  @return {Object} A object properties: 'text' (string) and 'index' (number).
 *  @private
 */
MarkerClusterer.prototype.calculator_ = function(markers, numStyles) {
    var index = 0;
    var count = markers.length;
    var dv = count;
    while (dv !== 0) {
        dv = parseInt(dv / 10, 10);
        index++;
    }
    index = Math.min(index, numStyles);
    return {
        text: count,
        index: index
    };
};

/**
 * Set the calculator function.
 *
 * @param {function(Array, number)} calculator The function to set as the
 *     calculator. The function should return a object properties:
 *     'text' (string) and 'index' (number).
 *
 */
MarkerClusterer.prototype.setCalculator = function(calculator) {
    this.calculator_ = calculator;
};

/**
 * Get the calculator function.
 *
 * @return {function(Array, number)} the calculator function.
 */
MarkerClusterer.prototype.getCalculator = function() {
    return this.calculator_;
};

/**
 * Add an array of markers to the clusterer.
 *
 * @param {Array.<google.maps.Marker>} markers The markers to add.
 * @param {boolean=} opt_nodraw Whether to redraw the clusters.
 */
MarkerClusterer.prototype.addMarkers = function(markers, opt_nodraw) {
    if (markers.length) {
        for (var i = 0, marker; marker = markers[i]; i++) {
            this.pushMarkerTo_(marker);
        }
    } else if (Object.keys(markers).length) {
        for (var marker in markers) {
            this.pushMarkerTo_(markers[marker]);
        }
    }
    if (!opt_nodraw) {
        this.redraw();
    }
};

/**
 * Pushes a marker to the clusterer.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @private
 */
MarkerClusterer.prototype.pushMarkerTo_ = function(marker) {
    marker.isAdded = false;
    if (marker['draggable']) {
        // If the marker is draggable add a listener so we update the clusters on
        // the drag end.
        var that = this;
        google.maps.event.addListener(marker, 'dragend', function() {
            marker.isAdded = false;
            that.repaint();
        });
    }
    this.markers_.push(marker);
};

/**
 * Adds a marker to the clusterer and redraws if needed.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @param {boolean=} opt_nodraw Whether to redraw the clusters.
 */
MarkerClusterer.prototype.addMarker = function(marker, opt_nodraw) {
    this.pushMarkerTo_(marker);
    if (!opt_nodraw) {
        this.redraw();
    }
};

/**
 * Removes a marker and returns true if removed, false if not
 *
 * @param {google.maps.Marker} marker The marker to remove
 * @return {boolean} Whether the marker was removed or not
 * @private
 */
MarkerClusterer.prototype.removeMarker_ = function(marker) {
    var index = -1;
    if (this.markers_.indexOf) {
        index = this.markers_.indexOf(marker);
    } else {
        for (var i = 0, m; m = this.markers_[i]; i++) {
            if (m === marker) {
                index = i;
                break;
            }
        }
    }
    if (index === -1) {
        // Marker is not in our list of markers.
        return false;
    }
    marker.setMap(null);
    this.markers_.splice(index, 1);
    return true;
};

/**
 * Remove a marker from the cluster.
 *
 * @param {google.maps.Marker} marker The marker to remove.
 * @param {boolean=} opt_nodraw Optional boolean to force no redraw.
 * @return {boolean} True if the marker was removed.
 */
MarkerClusterer.prototype.removeMarker = function(marker, opt_nodraw) {
    var removed = this.removeMarker_(marker);
    if (!opt_nodraw && removed) {
        this.resetViewport();
        this.redraw();
        return true;
    } else {
        return false;
    }
};

/**
 * Removes an array of markers from the cluster.
 *
 * @param {Array.<google.maps.Marker>} markers The markers to remove.
 * @param {boolean=} opt_nodraw Optional boolean to force no redraw.
 */
MarkerClusterer.prototype.removeMarkers = function(markers, opt_nodraw) {
    var removed = false;
    for (var i = 0, marker; marker = markers[i]; i++) {
          var r = this.removeMarker_(marker);
          removed = removed || r;
    }
    if (!opt_nodraw && removed) {
        this.resetViewport();
        this.redraw();
        return true;
    }
};

/**
 * Sets the clusterer's ready state.
 *
 * @param {boolean} ready The state.
 * @private
 */
MarkerClusterer.prototype.setReady_ = function(ready) {
    if (!this.ready_) {
        this.ready_ = ready;
        this.createClusters_();
    }
};

/**
 * Returns the number of clusters in the clusterer.
 *
 * @return {number} The number of clusters.
 */
MarkerClusterer.prototype.getTotalClusters = function() {
    return this.clusters_.length;
};

/**
 * Returns the google map that the clusterer is associated with.
 *
 * @return {google.maps.Map} The map.
 */
MarkerClusterer.prototype.getMap = function() {
    return this.map_;
};

/**
 * Sets the google map that the clusterer is associated with.
 *
 * @param {google.maps.Map} map The map.
 */
MarkerClusterer.prototype.setMap = function(map) {
    this.map_ = map;
};

/**
 * Returns the size of the grid.
 *
 * @return {number} The grid size.
 */
MarkerClusterer.prototype.getGridSize = function() {
    return this.gridSize_;
};

/**
 * Sets the size of the grid.
 *
 * @param {number} size The grid size.
 */
MarkerClusterer.prototype.setGridSize = function(size) {
    this.gridSize_ = size;
};

/**
 * Returns the min cluster size.
 *
 * @return {number} The grid size.
 */
MarkerClusterer.prototype.getMinClusterSize = function() {
    return this.minClusterSize_;
};

/**
 * Sets the min cluster size.
 *
 * @param {number} size The grid size.
 */
MarkerClusterer.prototype.setMinClusterSize = function(size) {
    this.minClusterSize_ = size;
};

/**
 * Extends a bounds object by the grid size.
 *
 * @param {google.maps.LatLngBounds} bounds The bounds to extend.
 * @return {google.maps.LatLngBounds} The extended bounds.
 */
MarkerClusterer.prototype.getExtendedBounds = function(bounds) {
    var projection = this.getProjection();
    // Turn the bounds into latlng.
    var tr = new google.maps.LatLng(bounds.getNorthEast().lat(),
        bounds.getNorthEast().lng());
    var bl = new google.maps.LatLng(bounds.getSouthWest().lat(),
        bounds.getSouthWest().lng());
    // Convert the points to pixels and the extend out by the grid size.
    var trPix = projection.fromLatLngToDivPixel(tr);
    trPix.x += this.gridSize_;
    trPix.y -= this.gridSize_;
    var blPix = projection.fromLatLngToDivPixel(bl);
    blPix.x -= this.gridSize_;
    blPix.y += this.gridSize_;
    // Convert the pixel points back to LatLng
    var ne = projection.fromDivPixelToLatLng(trPix);
    var sw = projection.fromDivPixelToLatLng(blPix);
    // Extend the bounds to contain the new bounds.
    bounds.extend(ne);
    bounds.extend(sw);
    return bounds;
};

/**
 * Determins if a marker is contained in a bounds.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @param {google.maps.LatLngBounds} bounds The bounds to check against.
 * @return {boolean} True if the marker is in the bounds.
 * @private
 */
MarkerClusterer.prototype.isMarkerInBounds_ = function(marker, bounds) {
    return bounds.contains(marker.getPosition());
};

/**
 * Clears all clusters and markers from the clusterer.
 */
MarkerClusterer.prototype.clearMarkers = function() {
    this.resetViewport(true);
    // Set the markers a empty array.
    this.markers_ = [];
};

/**
 * Clears all existing clusters and recreates them.
 * @param {boolean} opt_hide To also hide the marker.
 */
MarkerClusterer.prototype.resetViewport = function(opt_hide) {
    // Remove all the clusters
    for (var i = 0, cluster; cluster = this.clusters_[i]; i++) {
        cluster.remove();
    }
    // Reset the markers to not be added and to be invisible.
    for (var i = 0, marker; marker = this.markers_[i]; i++) {
        marker.isAdded = false;
        if (opt_hide) {
            marker.setMap(null);
        }
    }
    this.clusters_ = [];
};

/**
 *
 */
MarkerClusterer.prototype.repaint = function() {
    var oldClusters = this.clusters_.slice();
    this.clusters_.length = 0;
    this.resetViewport();
    this.redraw();
    // Remove the old clusters.
    // Do it in a timeout so the other clusters have been drawn first.
    window.setTimeout(function() {
        for (var i = 0, cluster; cluster = oldClusters[i]; i++) {
            cluster.remove();
        }
    }, 0);
};

/**
 * Redraws the clusters.
 */
MarkerClusterer.prototype.redraw = function() {
    this.createClusters_();
};

/**
 * Calculates the distance between two latlng locations in km.
 * @see http://www.movable-type.co.uk/scripts/latlong.html
 *
 * @param {google.maps.LatLng} p1 The first lat lng point.
 * @param {google.maps.LatLng} p2 The second lat lng point.
 * @return {number} The distance between the two points in km.
 * @private
*/
MarkerClusterer.prototype.distanceBetweenPoints_ = function(p1, p2) {
    if (!p1 || !p2) {
        return 0;
    }
    var R = 6371; // Radius of the Earth in km
    var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
    var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
};

/**
 * Add a marker to a cluster, or creates a new cluster.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @private
 */
MarkerClusterer.prototype.addToClosestCluster_ = function(marker) {
    var distance = 40000; // Some large number
    var clusterToAddTo = null;
    var pos = marker.getPosition();
    for (var i = 0, cluster; cluster = this.clusters_[i]; i++) {
        var center = cluster.getCenter();
        if (center) {
            var d = this.distanceBetweenPoints_(center, marker.getPosition());
            if (d < distance) {
              distance = d;
              clusterToAddTo = cluster;
            }
        }
    }
    if (clusterToAddTo && clusterToAddTo.isMarkerInClusterBounds(marker)) {
        clusterToAddTo.addMarker(marker);
    } else {
        var cluster = new Cluster(this);
        cluster.addMarker(marker);
        this.clusters_.push(cluster);
    }
};

/**
 * Creates the clusters.
 *
 * @private
 */
MarkerClusterer.prototype.createClusters_ = function() {
    if (!this.ready_) {
        return;
    }
    // Get our current map view bounds.
    // Create a new bounds object so we don't affect the map.
    var mapBounds = new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),
        this.map_.getBounds().getNorthEast());
    var bounds = this.getExtendedBounds(mapBounds);
    for (var i = 0, marker; marker = this.markers_[i]; i++) {
        if (!marker.isAdded && this.isMarkerInBounds_(marker, bounds)) {
            this.addToClosestCluster_(marker);
        }
    }
};

/**
 * A cluster that contains markers.
 *
 * @param {MarkerClusterer} markerClusterer The markerclusterer that this
 *     cluster is associated with.
 * @constructor
 * @ignore
 */
function Cluster(markerClusterer) {
    this.markerClusterer_ = markerClusterer;
    this.map_ = markerClusterer.getMap();
    this.gridSize_ = markerClusterer.getGridSize();
    this.minClusterSize_ = markerClusterer.getMinClusterSize();
    this.averageCenter_ = markerClusterer.isAverageCenter();
    this.center_ = null;
    this.markers_ = [];
    this.bounds_ = null;
    this.clusterIcon_ = new ClusterIcon(
        this,
        markerClusterer.getStyles(),
        markerClusterer.getGridSize()
    );
}

/**
 * Determins if a marker is already added to the cluster.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker is already added.
 */
Cluster.prototype.isMarkerAlreadyAdded = function(marker) {
    if (this.markers_.indexOf) {
        return this.markers_.indexOf(marker) !== -1;
    } else {
        for (var i = 0, m; m = this.markers_[i]; i++) {
            if (m === marker) {
                return true;
            }
        }
    }
    return false;
};

/**
 * Add a marker the cluster.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @return {boolean} True if the marker was added.
 */
Cluster.prototype.addMarker = function(marker) {
    if (this.isMarkerAlreadyAdded(marker)) {
        return false;
    }
    if (!this.center_) {
        this.center_ = marker.getPosition();
        this.calculateBounds_();
    } else {
        if (this.averageCenter_) {
            var l = this.markers_.length + 1;
            var lat = (this.center_.lat() * (l-1) + marker.getPosition().lat()) / l;
            var lng = (this.center_.lng() * (l-1) + marker.getPosition().lng()) / l;
            this.center_ = new google.maps.LatLng(lat, lng);
            this.calculateBounds_();
        }
    }
    marker.isAdded = true;
    this.markers_.push(marker);
    var len = this.markers_.length;
    if (len < this.minClusterSize_ && marker.getMap() !== this.map_) {
        // Min cluster size not reached so show the marker.
        marker.setMap(this.map_);
    }
    if (len === this.minClusterSize_) {
        // Hide the markers that were showing.
        for (var i = 0; i < len; i++) {
            this.markers_[i].setMap(null);
        }
    }
    if (len >= this.minClusterSize_) {
        marker.setMap(null);
    }
    this.updateIcon();
    return true;
};

/**
 * Returns the marker clusterer that the cluster is associated with.
 *
 * @return {MarkerClusterer} The associated marker clusterer.
 */
Cluster.prototype.getMarkerClusterer = function() {
    return this.markerClusterer_;
};

/**
 * Returns the bounds of the cluster.
 *
 * @return {google.maps.LatLngBounds} the cluster bounds.
 */
Cluster.prototype.getBounds = function() {
    var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
    var markers = this.getMarkers();
    for (var i = 0, marker; marker = markers[i]; i++) {
        bounds.extend(marker.getPosition());
    }
    return bounds;
};

/**
 * Removes the cluster
 */
Cluster.prototype.remove = function() {
    this.clusterIcon_.remove();
    this.markers_.length = 0;
    delete this.markers_;
};

/**
 * Returns the center of the cluster.
 *
 * @return {number} The cluster center.
 */
Cluster.prototype.getSize = function() {
    return this.markers_.length;
};

/**
 * Returns the center of the cluster.
 *
 * @return {Array.<google.maps.Marker>} The cluster center.
 */
Cluster.prototype.getMarkers = function() {
    return this.markers_;
};

/**
 * Returns the center of the cluster.
 *
 * @return {google.maps.LatLng} The cluster center.
 */
Cluster.prototype.getCenter = function() {
    return this.center_;
};

/**
 * Calculated the extended bounds of the cluster with the grid.
 *
 * @private
 */
Cluster.prototype.calculateBounds_ = function() {
    var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
    this.bounds_ = this.markerClusterer_.getExtendedBounds(bounds);
};

/**
 * Determines if a marker lies in the clusters bounds.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker lies in the bounds.
 */
Cluster.prototype.isMarkerInClusterBounds = function(marker) {
    return this.bounds_.contains(marker.getPosition());
};

/**
 * Returns the map that the cluster is associated with.
 *
 * @return {google.maps.Map} The map.
 */
Cluster.prototype.getMap = function() {
    return this.map_;
};

/**
 * Updates the cluster icon
 */
Cluster.prototype.updateIcon = function() {
    var zoom = this.map_.getZoom();
    var mz = this.markerClusterer_.getMaxZoom();
    if (mz && zoom > mz) {
        // The zoom is greater than our max zoom so show all the markers in cluster.
        for (var i = 0, marker; marker = this.markers_[i]; i++) {
            marker.setMap(this.map_);
        }
        return;
    }
    if (this.markers_.length < this.minClusterSize_) {
        // Min cluster size not yet reached.
        this.clusterIcon_.hide();
        return;
    }
    var numStyles = this.markerClusterer_.getStyles().length;
    var sums = this.markerClusterer_.getCalculator()(this.markers_, numStyles);
    this.clusterIcon_.setCenter(this.center_);
    this.clusterIcon_.setSums(sums);
    this.clusterIcon_.show();
};

/**
 * A cluster icon
 *
 * @param {Cluster} cluster The cluster to be associated with.
 * @param {Object} styles An object that has style properties:
 *     'url': (string) The image url.
 *     'height': (number) The image height.
 *     'width': (number) The image width.
 *     'anchor': (Array) The anchor position of the label text.
 *     'textColor': (string) The text color.
 *     'textSize': (number) The text size.
 *     'backgroundPosition: (string) The background postition x, y.
 * @param {number=} opt_padding Optional padding to apply to the cluster icon.
 * @constructor
 * @extends google.maps.OverlayView
 * @ignore
 */
function ClusterIcon(cluster, styles, opt_padding) {
    cluster.getMarkerClusterer().extend(ClusterIcon, google.maps.OverlayView);
    this.styles_ = styles;
    this.padding_ = opt_padding || 0;
    this.cluster_ = cluster;
    this.center_ = null;
    this.map_ = cluster.getMap();
    this.div_ = null;
    this.sums_ = null;
    this.visible_ = false;
    this.setMap(this.map_);
}

/**
 * Triggers the clusterclick event and zoom's if the option is set.
 */
ClusterIcon.prototype.triggerClusterClick = function() {
    var markerClusterer = this.cluster_.getMarkerClusterer();
    // Trigger the clusterclick event.
    google.maps.event.trigger(markerClusterer, 'clusterclick', this.cluster_);
    CanalTP.lib.clicTemp = true;
    if (markerClusterer.isZoomOnClick()) {
        // Zoom into the cluster.
        this.map_.setZoom(
            markerClusterer.getMaxZoom() + markerClusterer.getClusterZoomInc()
        );
        this.map_.setCenter(this.cluster_.getCenter());
    }
};

/**
 * Adding the cluster icon to the dom.
 * @ignore
 */
ClusterIcon.prototype.onAdd = function() {
    this.div_ = document.createElement('DIV');
    if (this.visible_) {
        var pos = this.getPosFromLatLng_(this.center_);
        this.div_.style.cssText = this.createCss(pos);
        this.div_.innerHTML = this.sums_.text;
    }
    var panes = this.getPanes();
    panes.overlayMouseTarget.appendChild(this.div_);
    var that = this;
    google.maps.event.addDomListener(this.div_, 'click', function() {
        that.triggerClusterClick();
    });
};

/**
 * Returns the position to place the div dending on the latlng.
 *
 * @param {google.maps.LatLng} latlng The position in latlng.
 * @return {google.maps.Point} The position in pixels.
 * @private
 */
ClusterIcon.prototype.getPosFromLatLng_ = function(latlng) {
    var pos = this.getProjection().fromLatLngToDivPixel(latlng);
    pos.x -= parseInt(this.width_ / 2, 10);
    pos.y -= parseInt(this.height_ / 2, 10);
    return pos;
};

/**
 * Draw the icon.
 * @ignore
 */
ClusterIcon.prototype.draw = function() {
    if (this.visible_) {
        var pos = this.getPosFromLatLng_(this.center_);
        this.div_.style.top = pos.y + 'px';
        this.div_.style.left = pos.x + 'px';
    }
};

/**
 * Hide the icon.
 */
ClusterIcon.prototype.hide = function() {
    if (this.div_) {
        this.div_.style.display = 'none';
    }
    this.visible_ = false;
};

/**
 * Position and show the icon.
 */
ClusterIcon.prototype.show = function() {
    if (this.div_) {
        var pos = this.getPosFromLatLng_(this.center_);
        this.div_.style.cssText = this.createCss(pos);
        this.div_.style.display = '';
    }
    this.visible_ = true;
};

/**
 * Remove the icon from the map
 */
ClusterIcon.prototype.remove = function() {
    this.setMap(null);
};

/**
 * Implementation of the onRemove interface.
 * @ignore
 */
ClusterIcon.prototype.onRemove = function() {
    if (this.div_ && this.div_.parentNode) {
        this.hide();
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
    }
};

/**
 * Set the sums of the icon.
 *
 * @param {Object} sums The sums containing:
 *   'text': (string) The text to display in the icon.
 *   'index': (number) The style index of the icon.
 */
ClusterIcon.prototype.setSums = function(sums) {
    this.sums_ = sums;
    this.text_ = sums.text;
    this.index_ = sums.index;
    if (this.div_) {
        this.div_.innerHTML = sums.text;
    }
    this.useStyle();
};

/**
 * Sets the icon to the the styles.
 */
ClusterIcon.prototype.useStyle = function() {
    var index = Math.max(0, this.sums_.index - 1);
    index = Math.min(this.styles_.length - 1, index);
    var style = this.styles_[index];
    this.url_ = style['url'];
    this.height_ = style['height'];
    this.width_ = style['width'];
    this.textColor_ = style['textColor'];
    this.anchor_ = style['anchor'];
    this.textSize_ = style['textSize'];
    this.backgroundPosition_ = style['backgroundPosition'];
};

/**
 * Sets the center of the icon.
 *
 * @param {google.maps.LatLng} center The latlng to set as the center.
 */
ClusterIcon.prototype.setCenter = function(center) {
    this.center_ = center;
};

/**
 * Create the css text based on the position of the icon.
 *
 * @param {google.maps.Point} pos The position.
 * @return {string} The css style text.
 */
ClusterIcon.prototype.createCss = function(pos) {
    var style = [];
    style.push('background-image:url(' + this.url_ + ');');
    var backgroundPosition = this.backgroundPosition_ ? this.backgroundPosition_ : '0 0';
    style.push('background-position:' + backgroundPosition + ';');

    if (typeof this.anchor_ === 'object') {
        if (typeof this.anchor_[0] === 'number' && this.anchor_[0] > 0 &&
            this.anchor_[0] < this.height_) {
            style.push('height:' + (this.height_ - this.anchor_[0]) +
            'px; padding-top:' + this.anchor_[0] + 'px;');
        } else {
            style.push('height:' + this.height_ + 'px; line-height:' + this.height_ / 2 +
            'px;');
        }
        if (typeof this.anchor_[1] === 'number' && this.anchor_[1] > 0 &&
            this.anchor_[1] < this.width_) {
            style.push('width:' + (this.width_ - this.anchor_[1]) +
            'px; padding-left:' + this.anchor_[1] + 'px;');
        } else {
            style.push('width:' + this.width_ + 'px; text-align:center;');
        }
    } else {
        style.push('height:' + this.height_ + 'px; line-height:' +
        this.height_ / 2 + 'px; width:' + this.width_ + 'px; text-align:center;');
    }
    var txtColor = this.textColor_ ? this.textColor_ : 'black';
    var txtSize = this.textSize_ ? this.textSize_ : 11;
    style.push('cursor:pointer; top:' + pos.y + 'px; left:' +
        pos.x + 'px; color:' + txtColor + '; position:absolute; font-size:' +
        txtSize + 'px; font-family:Arial,sans-serif; font-weight:bold');
    return style.join('');
};

// Export Symbols for Closure
// If you are not going to compile with closure then you can remove the
// code below.
window['MarkerClusterer'] = MarkerClusterer;
MarkerClusterer.prototype['addMarker'] = MarkerClusterer.prototype.addMarker;
MarkerClusterer.prototype['addMarkers'] = MarkerClusterer.prototype.addMarkers;
MarkerClusterer.prototype['clearMarkers'] = MarkerClusterer.prototype.clearMarkers;
MarkerClusterer.prototype['fitMapToMarkers'] = MarkerClusterer.prototype.fitMapToMarkers;
MarkerClusterer.prototype['getCalculator'] = MarkerClusterer.prototype.getCalculator;
MarkerClusterer.prototype['getGridSize'] = MarkerClusterer.prototype.getGridSize;
MarkerClusterer.prototype['getExtendedBounds'] = MarkerClusterer.prototype.getExtendedBounds;
MarkerClusterer.prototype['getMap'] = MarkerClusterer.prototype.getMap;
MarkerClusterer.prototype['getMarkers'] = MarkerClusterer.prototype.getMarkers;
MarkerClusterer.prototype['getMaxZoom'] = MarkerClusterer.prototype.getMaxZoom;
MarkerClusterer.prototype['getStyles'] = MarkerClusterer.prototype.getStyles;
MarkerClusterer.prototype['getTotalClusters'] = MarkerClusterer.prototype.getTotalClusters;
MarkerClusterer.prototype['getTotalMarkers'] = MarkerClusterer.prototype.getTotalMarkers;
MarkerClusterer.prototype['redraw'] = MarkerClusterer.prototype.redraw;
MarkerClusterer.prototype['removeMarker'] = MarkerClusterer.prototype.removeMarker;
MarkerClusterer.prototype['removeMarkers'] = MarkerClusterer.prototype.removeMarkers;
MarkerClusterer.prototype['resetViewport'] = MarkerClusterer.prototype.resetViewport;
MarkerClusterer.prototype['repaint'] = MarkerClusterer.prototype.repaint;
MarkerClusterer.prototype['setCalculator'] = MarkerClusterer.prototype.setCalculator;
MarkerClusterer.prototype['setGridSize'] = MarkerClusterer.prototype.setGridSize;
MarkerClusterer.prototype['setMaxZoom'] = MarkerClusterer.prototype.setMaxZoom;
MarkerClusterer.prototype['onAdd'] = MarkerClusterer.prototype.onAdd;
MarkerClusterer.prototype['draw'] = MarkerClusterer.prototype.draw;

Cluster.prototype['getCenter'] = Cluster.prototype.getCenter;
Cluster.prototype['getSize'] = Cluster.prototype.getSize;
Cluster.prototype['getMarkers'] = Cluster.prototype.getMarkers;

ClusterIcon.prototype['onAdd'] = ClusterIcon.prototype.onAdd;
ClusterIcon.prototype['draw'] = ClusterIcon.prototype.draw;
ClusterIcon.prototype['onRemove'] = ClusterIcon.prototype.onRemove;

Object.keys = Object.keys || function(o) {
    var result = [];
    for (var name in o) {
        if (o.hasOwnProperty(name)) {
            result.push(name);
        }
    }
    return result;
};

/**
 * @name MarkerWithLabel for V3
 * @version 1.1.10 [April 8, 2014]
 * @author Gary Little (inspired by code from Marc Ridey of Google).
 * @copyright Copyright 2012 Gary Little [gary at luxcentral.com]
 * @fileoverview MarkerWithLabel extends the Google Maps JavaScript API V3
 *  <code>google.maps.Marker</code> class.
 *  <p>
 *  MarkerWithLabel allows you to define markers with associated labels. As you would expect,
 *  if the marker is draggable, so too will be the label. In addition, a marker with a label
 *  responds to all mouse events in the same manner as a regular marker. It also fires mouse
 *  events and "property changed" events just as a regular marker would. Version 1.1 adds
 *  support for the raiseOnDrag feature introduced in API V3.3.
 *  <p>
 *  If you drag a marker by its label, you can cancel the drag and return the marker to its
 *  original position by pressing the <code>Esc</code> key. This doesn't work if you drag the marker
 *  itself because this feature is not (yet) supported in the <code>google.maps.Marker</code> class.
 */

/*!
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*jslint browser:true */
/*global document,google */

/**
 * @param {Function} childCtor Child class.
 * @param {Function} parentCtor Parent class.
 * @private
 */
function inherits(childCtor, parentCtor) {
  /* @constructor */
  function tempCtor() {}
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  /* @override */
  childCtor.prototype.constructor = childCtor;
}

/**
 * This constructor creates a label and associates it with a marker.
 * It is for the private use of the MarkerWithLabel class.
 * @constructor
 * @param {Marker} marker The marker with which the label is to be associated.
 * @param {string} crossURL The URL of the cross image =.
 * @param {string} handCursor The URL of the hand cursor.
 * @private
 */
function MarkerLabel_(marker, crossURL, handCursorURL) {
  this.marker_ = marker;
  this.handCursorURL_ = marker.handCursorURL;

  this.labelDiv_ = document.createElement("div");
  this.labelDiv_.style.cssText = "position: absolute; overflow: hidden;";

  // Set up the DIV for handling mouse events in the label. This DIV forms a transparent veil
  // in the "overlayMouseTarget" pane, a veil that covers just the label. This is done so that
  // events can be captured even if the label is in the shadow of a google.maps.InfoWindow.
  // Code is included here to ensure the veil is always exactly the same size as the label.
  this.eventDiv_ = document.createElement("div");
  this.eventDiv_.style.cssText = this.labelDiv_.style.cssText;

  // This is needed for proper behavior on MSIE:
  this.eventDiv_.setAttribute("onselectstart", "return false;");
  this.eventDiv_.setAttribute("ondragstart", "return false;");

  // Get the DIV for the "X" to be displayed when the marker is raised.
  this.crossDiv_ = MarkerLabel_.getSharedCross(crossURL);
}

/**
 * @name MarkerWithLabelOptions
 * @class This class represents the optional parameter passed to the {@link MarkerWithLabel} constructor.
 *  The properties available are the same as for <code>google.maps.Marker</code> with the addition
 *  of the properties listed below. To change any of these additional properties after the labeled
 *  marker has been created, call <code>google.maps.Marker.set(propertyName, propertyValue)</code>.
 *  <p>
 *  When any of these properties changes, a property changed event is fired. The names of these
 *  events are derived from the name of the property and are of the form <code>propertyname_changed</code>.
 *  For example, if the content of the label changes, a <code>labelcontent_changed</code> event
 *  is fired.
 *  <p>
 * @property {string|Node} [labelContent] The content of the label (plain text or an HTML DOM node).
 * @property {Point} [labelAnchor] By default, a label is drawn with its anchor point at (0,0) so
 *  that its top left corner is positioned at the anchor point of the associated marker. Use this
 *  property to change the anchor point of the label. For example, to center a 50px-wide label
 *  beneath a marker, specify a <code>labelAnchor</code> of <code>google.maps.Point(25, 0)</code>.
 *  (Note: x-values increase to the right and y-values increase to the top.)
 * @property {string} [labelClass] The name of the CSS class defining the styles for the label.
 *  Note that style values for <code>position</code>, <code>overflow</code>, <code>top</code>,
 *  <code>left</code>, <code>zIndex</code>, <code>display</code>, <code>marginLeft</code>, and
 *  <code>marginTop</code> are ignored; these styles are for internal use only.
 * @property {Object} [labelStyle] An object literal whose properties define specific CSS
 *  style values to be applied to the label. Style values defined here override those that may
 *  be defined in the <code>labelClass</code> style sheet. If this property is changed after the
 *  label has been created, all previously set styles (except those defined in the style sheet)
 *  are removed from the label before the new style values are applied.
 *  Note that style values for <code>position</code>, <code>overflow</code>, <code>top</code>,
 *  <code>left</code>, <code>zIndex</code>, <code>display</code>, <code>marginLeft</code>, and
 *  <code>marginTop</code> are ignored; these styles are for internal use only.
 * @property {boolean} [labelInBackground] A flag indicating whether a label that overlaps its
 *  associated marker should appear in the background (i.e., in a plane below the marker).
 *  The default is <code>false</code>, which causes the label to appear in the foreground.
 * @property {boolean} [labelVisible] A flag indicating whether the label is to be visible.
 *  The default is <code>true</code>. Note that even if <code>labelVisible</code> is
 *  <code>true</code>, the label will <i>not</i> be visible unless the associated marker is also
 *  visible (i.e., unless the marker's <code>visible</code> property is <code>true</code>).
 * @property {boolean} [raiseOnDrag] A flag indicating whether the label and marker are to be
 *  raised when the marker is dragged. The default is <code>true</code>. If a draggable marker is
 *  being created and a version of Google Maps API earlier than V3.3 is being used, this property
 *  must be set to <code>false</code>.
 * @property {boolean} [optimized] A flag indicating whether rendering is to be optimized for the
 *  marker. <b>Important: The optimized rendering technique is not supported by MarkerWithLabel,
 *  so the value of this parameter is always forced to <code>false</code>.
 * @property {string} [crossImage="http://maps.gstatic.com/intl/en_us/mapfiles/drag_cross_67_16.png"]
 *  The URL of the cross image to be displayed while dragging a marker.
 * @property {string} [handCursor="http://maps.gstatic.com/intl/en_us/mapfiles/closedhand_8_8.cur"]
 *  The URL of the cursor to be displayed while dragging a marker.
 */
/**
 * Creates a MarkerWithLabel with the options specified in {@link MarkerWithLabelOptions}.
 * @constructor
 * @param {MarkerWithLabelOptions} [opt_options] The optional parameters.
 */
function MarkerWithLabel(opt_options) {
  opt_options = opt_options || {};
  opt_options.labelContent = opt_options.labelContent || "";
  opt_options.labelAnchor = opt_options.labelAnchor || new google.maps.Point(0, 0);
  opt_options.labelClass = opt_options.labelClass || "markerLabels";
  opt_options.labelStyle = opt_options.labelStyle || {};
  opt_options.labelInBackground = opt_options.labelInBackground || false;
  if (typeof opt_options.labelVisible === "undefined") {
    opt_options.labelVisible = true;
  }
  if (typeof opt_options.raiseOnDrag === "undefined") {
    opt_options.raiseOnDrag = true;
  }
  if (typeof opt_options.clickable === "undefined") {
    opt_options.clickable = true;
  }
  if (typeof opt_options.draggable === "undefined") {
    opt_options.draggable = false;
  }
  if (typeof opt_options.optimized === "undefined") {
    opt_options.optimized = false;
  }
  opt_options.crossImage = opt_options.crossImage || "http" + (document.location.protocol === "https:" ? "s" : "") + "://maps.gstatic.com/intl/en_us/mapfiles/drag_cross_67_16.png";
  opt_options.handCursor = opt_options.handCursor || "http" + (document.location.protocol === "https:" ? "s" : "") + "://maps.gstatic.com/intl/en_us/mapfiles/closedhand_8_8.cur";
  opt_options.optimized = false; // Optimized rendering is not supported

  this.label = new MarkerLabel_(this, opt_options.crossImage, opt_options.handCursor); // Bind the label to the marker

  // Call the parent constructor. It calls Marker.setValues to initialize, so all
  // the new parameters are conveniently saved and can be accessed with get/set.
  // Marker.set triggers a property changed event (called "propertyname_changed")
  // that the marker label listens for in order to react to state changes.
  google.maps.Marker.apply(this, arguments);
}

CanalTP.jQuery(document).on('GmapReady', function(){
    inherits(MarkerLabel_, google.maps.OverlayView);

    /**
     * Returns the DIV for the cross used when dragging a marker when the
     * raiseOnDrag parameter set to true. One cross is shared with all markers.
     * @param {string} crossURL The URL of the cross image =.
     * @private
     */
    MarkerLabel_.getSharedCross = function (crossURL) {
      var div;
      if (typeof MarkerLabel_.getSharedCross.crossDiv === "undefined") {
        div = document.createElement("img");
        div.style.cssText = "position: absolute; z-index: 1000002; display: none;";
        // Hopefully Google never changes the standard "X" attributes:
        div.style.marginLeft = "-8px";
        div.style.marginTop = "-9px";
        div.src = crossURL;
        MarkerLabel_.getSharedCross.crossDiv = div;
      }
      return MarkerLabel_.getSharedCross.crossDiv;
    };

    /**
     * Adds the DIV representing the label to the DOM. This method is called
     * automatically when the marker's <code>setMap</code> method is called.
     * @private
     */
    MarkerLabel_.prototype.onAdd = function () {
      var me = this;
      var cMouseIsDown = false;
      var cDraggingLabel = false;
      var cSavedZIndex;
      var cLatOffset, cLngOffset;
      var cIgnoreClick;
      var cRaiseEnabled;
      var cStartPosition;
      var cStartCenter;
      // Constants:
      var cRaiseOffset = 20;
      var cDraggingCursor = "url(" + this.handCursorURL_ + ")";

      // Stops all processing of an event.
      //
      var cAbortEvent = function (e) {
        if (e.preventDefault) {
          e.preventDefault();
        }
        e.cancelBubble = true;
        if (e.stopPropagation) {
          e.stopPropagation();
        }
      };

      var cStopBounce = function () {
        me.marker_.setAnimation(null);
      };

      this.getPanes().overlayImage.appendChild(this.labelDiv_);
      this.getPanes().overlayMouseTarget.appendChild(this.eventDiv_);
      // One cross is shared with all markers, so only add it once:
      if (typeof MarkerLabel_.getSharedCross.processed === "undefined") {
        this.getPanes().overlayImage.appendChild(this.crossDiv_);
        MarkerLabel_.getSharedCross.processed = true;
      }

      this.listeners_ = [
        google.maps.event.addDomListener(this.eventDiv_, "mouseover", function (e) {
          if (me.marker_.getDraggable() || me.marker_.getClickable()) {
            this.style.cursor = "pointer";
            google.maps.event.trigger(me.marker_, "mouseover", e);
          }
        }),
        google.maps.event.addDomListener(this.eventDiv_, "mouseout", function (e) {
          if ((me.marker_.getDraggable() || me.marker_.getClickable()) && !cDraggingLabel) {
            this.style.cursor = me.marker_.getCursor();
            google.maps.event.trigger(me.marker_, "mouseout", e);
          }
        }),
        google.maps.event.addDomListener(this.eventDiv_, "mousedown", function (e) {
          cDraggingLabel = false;
          if (me.marker_.getDraggable()) {
            cMouseIsDown = true;
            this.style.cursor = cDraggingCursor;
          }
          if (me.marker_.getDraggable() || me.marker_.getClickable()) {
            google.maps.event.trigger(me.marker_, "mousedown", e);
            cAbortEvent(e); // Prevent map pan when starting a drag on a label
          }
        }),
        google.maps.event.addDomListener(document, "mouseup", function (mEvent) {
          var position;
          if (cMouseIsDown) {
            cMouseIsDown = false;
            me.eventDiv_.style.cursor = "pointer";
            google.maps.event.trigger(me.marker_, "mouseup", mEvent);
          }
          if (cDraggingLabel) {
            if (cRaiseEnabled) { // Lower the marker & label
              position = me.getProjection().fromLatLngToDivPixel(me.marker_.getPosition());
              position.y += cRaiseOffset;
              me.marker_.setPosition(me.getProjection().fromDivPixelToLatLng(position));
              // This is not the same bouncing style as when the marker portion is dragged,
              // but it will have to do:
              try { // Will fail if running Google Maps API earlier than V3.3
                me.marker_.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(cStopBounce, 1406);
              } catch (e) {}
            }
            me.crossDiv_.style.display = "none";
            me.marker_.setZIndex(cSavedZIndex);
            cIgnoreClick = true; // Set flag to ignore the click event reported after a label drag
            cDraggingLabel = false;
            mEvent.latLng = me.marker_.getPosition();
            google.maps.event.trigger(me.marker_, "dragend", mEvent);
          }
        }),
        google.maps.event.addListener(me.marker_.getMap(), "mousemove", function (mEvent) {
          var position;
          if (cMouseIsDown) {
            if (cDraggingLabel) {
              // Change the reported location from the mouse position to the marker position:
              mEvent.latLng = new google.maps.LatLng(mEvent.latLng.lat() - cLatOffset, mEvent.latLng.lng() - cLngOffset);
              position = me.getProjection().fromLatLngToDivPixel(mEvent.latLng);
              if (cRaiseEnabled) {
                me.crossDiv_.style.left = position.x + "px";
                me.crossDiv_.style.top = position.y + "px";
                me.crossDiv_.style.display = "";
                position.y -= cRaiseOffset;
              }
              me.marker_.setPosition(me.getProjection().fromDivPixelToLatLng(position));
              if (cRaiseEnabled) { // Don't raise the veil; this hack needed to make MSIE act properly
                me.eventDiv_.style.top = (position.y + cRaiseOffset) + "px";
              }
              google.maps.event.trigger(me.marker_, "drag", mEvent);
            } else {
              // Calculate offsets from the click point to the marker position:
              cLatOffset = mEvent.latLng.lat() - me.marker_.getPosition().lat();
              cLngOffset = mEvent.latLng.lng() - me.marker_.getPosition().lng();
              cSavedZIndex = me.marker_.getZIndex();
              cStartPosition = me.marker_.getPosition();
              cStartCenter = me.marker_.getMap().getCenter();
              cRaiseEnabled = me.marker_.get("raiseOnDrag");
              cDraggingLabel = true;
              me.marker_.setZIndex(1000000); // Moves the marker & label to the foreground during a drag
              mEvent.latLng = me.marker_.getPosition();
              google.maps.event.trigger(me.marker_, "dragstart", mEvent);
            }
          }
        }),
        google.maps.event.addDomListener(document, "keydown", function (e) {
          if (cDraggingLabel) {
            if (e.keyCode === 27) { // Esc key
              cRaiseEnabled = false;
              me.marker_.setPosition(cStartPosition);
              me.marker_.getMap().setCenter(cStartCenter);
              google.maps.event.trigger(document, "mouseup", e);
            }
          }
        }),
        google.maps.event.addDomListener(this.eventDiv_, "click", function (e) {
          if (me.marker_.getDraggable() || me.marker_.getClickable()) {
            if (cIgnoreClick) { // Ignore the click reported when a label drag ends
              cIgnoreClick = false;
            } else {
              google.maps.event.trigger(me.marker_, "click", e);
              cAbortEvent(e); // Prevent click from being passed on to map
            }
          }
        }),
        google.maps.event.addDomListener(this.eventDiv_, "dblclick", function (e) {
          if (me.marker_.getDraggable() || me.marker_.getClickable()) {
            google.maps.event.trigger(me.marker_, "dblclick", e);
            cAbortEvent(e); // Prevent map zoom when double-clicking on a label
          }
        }),
        google.maps.event.addListener(this.marker_, "dragstart", function (mEvent) {
          if (!cDraggingLabel) {
            cRaiseEnabled = this.get("raiseOnDrag");
          }
        }),
        google.maps.event.addListener(this.marker_, "drag", function (mEvent) {
          if (!cDraggingLabel) {
            if (cRaiseEnabled) {
              me.setPosition(cRaiseOffset);
              // During a drag, the marker's z-index is temporarily set to 1000000 to
              // ensure it appears above all other markers. Also set the label's z-index
              // to 1000000 (plus or minus 1 depending on whether the label is supposed
              // to be above or below the marker).
              me.labelDiv_.style.zIndex = 1000000 + (this.get("labelInBackground") ? -1 : +1);
            }
          }
        }),
        google.maps.event.addListener(this.marker_, "dragend", function (mEvent) {
          if (!cDraggingLabel) {
            if (cRaiseEnabled) {
              me.setPosition(0); // Also restores z-index of label
            }
          }
        }),
        google.maps.event.addListener(this.marker_, "position_changed", function () {
          me.setPosition();
        }),
        google.maps.event.addListener(this.marker_, "zindex_changed", function () {
          me.setZIndex();
        }),
        google.maps.event.addListener(this.marker_, "visible_changed", function () {
          me.setVisible();
        }),
        google.maps.event.addListener(this.marker_, "labelvisible_changed", function () {
          me.setVisible();
        }),
        google.maps.event.addListener(this.marker_, "title_changed", function () {
          me.setTitle();
        }),
        google.maps.event.addListener(this.marker_, "labelcontent_changed", function () {
          me.setContent();
        }),
        google.maps.event.addListener(this.marker_, "labelanchor_changed", function () {
          me.setAnchor();
        }),
        google.maps.event.addListener(this.marker_, "labelclass_changed", function () {
          me.setStyles();
        }),
        google.maps.event.addListener(this.marker_, "labelstyle_changed", function () {
          me.setStyles();
        })
      ];
    };

    /**
     * Removes the DIV for the label from the DOM. It also removes all event handlers.
     * This method is called automatically when the marker's <code>setMap(null)</code>
     * method is called.
     * @private
     */
    MarkerLabel_.prototype.onRemove = function () {
      var i;
      this.labelDiv_.parentNode.removeChild(this.labelDiv_);
      this.eventDiv_.parentNode.removeChild(this.eventDiv_);

      // Remove event listeners:
      for (i = 0; i < this.listeners_.length; i++) {
        google.maps.event.removeListener(this.listeners_[i]);
      }
    };

    /**
     * Draws the label on the map.
     * @private
     */
    MarkerLabel_.prototype.draw = function () {
      this.setContent();
      this.setTitle();
      this.setStyles();
    };

    /**
     * Sets the content of the label.
     * The content can be plain text or an HTML DOM node.
     * @private
     */
    MarkerLabel_.prototype.setContent = function () {
      var content = this.marker_.get("labelContent");
      if (typeof content.nodeType === "undefined") {
        this.labelDiv_.innerHTML = content;
        this.eventDiv_.innerHTML = this.labelDiv_.innerHTML;
      } else {
        this.labelDiv_.innerHTML = ""; // Remove current content
        this.labelDiv_.appendChild(content);
        content = content.cloneNode(true);
        this.eventDiv_.innerHTML = ""; // Remove current content
        this.eventDiv_.appendChild(content);
      }
    };

    /**
     * Sets the content of the tool tip for the label. It is
     * always set to be the same as for the marker itself.
     * @private
     */
    MarkerLabel_.prototype.setTitle = function () {
      this.eventDiv_.title = this.marker_.getTitle() || "";
    };

    /**
     * Sets the style of the label by setting the style sheet and applying
     * other specific styles requested.
     * @private
     */
    MarkerLabel_.prototype.setStyles = function () {
      var i, labelStyle;

      // Apply style values from the style sheet defined in the labelClass parameter:
      this.labelDiv_.className = this.marker_.get("labelClass");
      this.eventDiv_.className = this.labelDiv_.className;

      // Clear existing inline style values:
      this.labelDiv_.style.cssText = "";
      this.eventDiv_.style.cssText = "";
      // Apply style values defined in the labelStyle parameter:
      labelStyle = this.marker_.get("labelStyle");
      for (i in labelStyle) {
        if (labelStyle.hasOwnProperty(i)) {
          this.labelDiv_.style[i] = labelStyle[i];
          this.eventDiv_.style[i] = labelStyle[i];
        }
      }
      this.setMandatoryStyles();
    };

    /**
     * Sets the mandatory styles to the DIV representing the label as well as to the
     * associated event DIV. This includes setting the DIV position, z-index, and visibility.
     * @private
     */
    MarkerLabel_.prototype.setMandatoryStyles = function () {
      this.labelDiv_.style.position = "absolute";
      this.labelDiv_.style.overflow = "hidden";
      // Make sure the opacity setting causes the desired effect on MSIE:
      if (typeof this.labelDiv_.style.opacity !== "undefined" && this.labelDiv_.style.opacity !== "") {
        this.labelDiv_.style.MsFilter = "\"progid:DXImageTransform.Microsoft.Alpha(opacity=" + (this.labelDiv_.style.opacity * 100) + ")\"";
        this.labelDiv_.style.filter = "alpha(opacity=" + (this.labelDiv_.style.opacity * 100) + ")";
      }

      this.eventDiv_.style.position = this.labelDiv_.style.position;
      this.eventDiv_.style.overflow = this.labelDiv_.style.overflow;
      this.eventDiv_.style.opacity = 0.01; // Don't use 0; DIV won't be clickable on MSIE
      this.eventDiv_.style.MsFilter = "\"progid:DXImageTransform.Microsoft.Alpha(opacity=1)\"";
      this.eventDiv_.style.filter = "alpha(opacity=1)"; // For MSIE

      this.setAnchor();
      this.setPosition(); // This also updates z-index, if necessary.
      this.setVisible();
    };

    /**
     * Sets the anchor point of the label.
     * @private
     */
    MarkerLabel_.prototype.setAnchor = function () {
      var anchor = this.marker_.get("labelAnchor");
      this.labelDiv_.style.marginLeft = -anchor.x + "px";
      this.labelDiv_.style.marginTop = -anchor.y + "px";
      this.eventDiv_.style.marginLeft = -anchor.x + "px";
      this.eventDiv_.style.marginTop = -anchor.y + "px";
    };

    /**
     * Sets the position of the label. The z-index is also updated, if necessary.
     * @private
     */
    MarkerLabel_.prototype.setPosition = function (yOffset) {
      var position = this.getProjection().fromLatLngToDivPixel(this.marker_.getPosition());
      if (typeof yOffset === "undefined") {
        yOffset = 0;
      }
      this.labelDiv_.style.left = Math.round(position.x) + "px";
      this.labelDiv_.style.top = Math.round(position.y - yOffset) + "px";
      this.eventDiv_.style.left = this.labelDiv_.style.left;
      this.eventDiv_.style.top = this.labelDiv_.style.top;

      this.setZIndex();
    };

    /**
     * Sets the z-index of the label. If the marker's z-index property has not been defined, the z-index
     * of the label is set to the vertical coordinate of the label. This is in keeping with the default
     * stacking order for Google Maps: markers to the south are in front of markers to the north.
     * @private
     */
    MarkerLabel_.prototype.setZIndex = function () {
      var zAdjust = (this.marker_.get("labelInBackground") ? -1 : +1);
      if (typeof this.marker_.getZIndex() === "undefined") {
        this.labelDiv_.style.zIndex = parseInt(this.labelDiv_.style.top, 10) + zAdjust;
        this.eventDiv_.style.zIndex = this.labelDiv_.style.zIndex;
      } else {
        this.labelDiv_.style.zIndex = this.marker_.getZIndex() + zAdjust;
        this.eventDiv_.style.zIndex = this.labelDiv_.style.zIndex;
      }
    };

    /**
     * Sets the visibility of the label. The label is visible only if the marker itself is
     * visible (i.e., its visible property is true) and the labelVisible property is true.
     * @private
     */
    MarkerLabel_.prototype.setVisible = function () {
      if (this.marker_.get("labelVisible")) {
        this.labelDiv_.style.display = this.marker_.getVisible() ? "block" : "none";
      } else {
        this.labelDiv_.style.display = "none";
      }
      this.eventDiv_.style.display = this.labelDiv_.style.display;
    };

    inherits(MarkerWithLabel, google.maps.Marker);

    /**
     * Overrides the standard Marker setMap function.
     * @param {Map} theMap The map to which the marker is to be added.
     * @private
     */
    MarkerWithLabel.prototype.setMap = function (theMap) {

      // Call the inherited function...
      google.maps.Marker.prototype.setMap.apply(this, arguments);

      // ... then deal with the label:
      this.label.setMap(theMap);
    };
});
// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @externs_url http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/maps/google_maps_api_v3_3.js
// ==/ClosureCompiler==

/**
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0.1
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */

/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * A Marker Clusterer that clusters markers.
 *
 * @param {google.maps.Map} map The Google map to attach to.
 * @param {Array.<google.maps.Marker>=} opt_markers Optional markers to add to
 *   the cluster.
 * @param {Object=} opt_options support the following options:
 *     'gridSize': (number) The grid size of a cluster in pixels.
 *     'maxZoom': (number) The maximum zoom level that a marker can be part of a
 *                cluster.
 *     'zoomOnClick': (boolean) Whether the default behaviour of clicking on a
 *                    cluster is to zoom into it.
 *     'clusterZoomInc': {number} zoom increment when clicking on a cluster
 *     'averageCenter': (boolean) Wether the center of each cluster should be
 *                      the average of all markers in the cluster.
 *     'minimumClusterSize': (number) The minimum number of markers to be in a
 *                           cluster before the markers are hidden and a count
 *                           is shown.
 *     'styles': (object) An object that has style properties:
 *       'url': (string) The image url.
 *       'height': (number) The image height.
 *       'width': (number) The image width.
 *       'anchor': (Array) The anchor position of the label text.
 *       'textColor': (string) The text color.
 *       'textSize': (number) The text size.
 *       'backgroundPosition': (string) The position of the backgound x, y.
 * @constructor
 * @extends google.maps.OverlayView
 */
function MarkerClusterer(map, opt_markers, opt_options) {
    // MarkerClusterer implements google.maps.OverlayView interface. We use the
    // extend function to extend MarkerClusterer with google.maps.OverlayView
    // because it might not always be available when the code is defined so we
    // look for it at the last possible moment. If it doesn't exist now then
    // there is no point going ahead :)
    this.extend(MarkerClusterer, google.maps.OverlayView);
    this.map_ = map;

    /**
     * @type {Array.<google.maps.Marker>}
     * @private
     */
    this.markers_ = [];

    /**
     *  @type {Array.<Cluster>}
     */
    this.clusters_ = [];

    this.sizes = [53, 56, 66, 78, 90];

    /**
     * @private
     */
    this.styles_ = [];

    /**
     * @type {boolean}
     * @private
     */
    this.ready_ = false;

    var options = opt_options || {};

    /**
     * @type {number}
     * @private
     */
    this.gridSize_ = options['gridSize'] || 60;

    /**
     * @private
     */
    this.minClusterSize_ = options['minimumClusterSize'] || 2;

    /**
     * @type {?number}
     * @private
     */
    this.maxZoom_ = options['maxZoom'] || null;

    this.styles_ = options['styles'] || [];

    /**
     * @type {string}
     * @private
     */
    this.imagePath_ = options['imagePath'] || this.MARKER_CLUSTER_IMAGE_PATH_;

    /**
     * @type {string}
     * @private
     */
    this.imageExtension_ = options['imageExtension'] ||
        this.MARKER_CLUSTER_IMAGE_EXTENSION_;

    /**
     * @type {boolean}
     * @private
     */
    this.zoomOnClick_ = true;

    if (options['zoomOnClick'] != undefined) {
        this.zoomOnClick_ = options['zoomOnClick'];
    }
 
    /**
     * @type {number}
     * @private
     */
    this.clusterZoomInc_ = 2;

    if (options['clusterZoomInc'] !== undefined) {
        this.clusterZoomInc_ = options['clusterZoomInc'];
    }
    /**
     * @type {boolean}
     * @private
     */
    this.averageCenter_ = false;
    
    if (options['averageCenter'] !== undefined) {
        this.averageCenter_ = options['averageCenter'];
    }
    
    this.setupStyles_();
    this.setMap(map);
    /**
     * @type {number}
     * @private
     */
    this.prevZoom_ = this.map_.getZoom();
    
    // Add the map event listeners
    var that = this;
    google.maps.event.addListener(this.map_, 'zoom_changed', function() {
        // Determines map type and prevent illegal zoom levels
        var zoom = that.map_.getZoom();
        var minZoom = that.map_.minZoom || 0;
        var maxZoom = Math.min(
            that.map_.maxZoom || 100,
            that.map_.mapTypes[that.map_.getMapTypeId()].maxZoom
        );
        zoom = Math.min(Math.max(zoom,minZoom),maxZoom);
        if (that.prevZoom_ !== zoom) {
            that.prevZoom_ = zoom;
            that.resetViewport();
        }
    });
    google.maps.event.addListener(this.map_, 'idle', function() {
        that.redraw();
    });
    // Finally, add the markers
    if (opt_markers && (opt_markers.length || Object.keys(opt_markers).length)) {
        this.addMarkers(opt_markers, false);
    }
}

/**
 * The marker cluster image path.
 *
 * @type {string}
 * @private
 */
MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_ =
    'http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/' +
    'images/m';

/**
 * The marker cluster image path.
 *
 * @type {string}
 * @private
 */
MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_ = 'png';

/**
 * Extends a objects prototype by anothers.
 *
 * @param {Object} obj1 The object to be extended.
 * @param {Object} obj2 The object to extend with.
 * @return {Object} The new extended object.
 * @ignore
 */
MarkerClusterer.prototype.extend = function(obj1, obj2) {
    return (function(object) {
        for (var property in object.prototype) {
            this.prototype[property] = object.prototype[property];
        }
        return this;
    }).apply(obj1, [obj2]);
};

/**
 * Implementaion of the interface method.
 * @ignore
 */
MarkerClusterer.prototype.onAdd = function() {
    this.setReady_(true);
};

/**
 * Implementaion of the interface method.
 * @ignore
 */
MarkerClusterer.prototype.draw = function() {};

/**
 * Sets up the styles object.
 *
 * @private
 */
MarkerClusterer.prototype.setupStyles_ = function() {
    if (this.styles_.length) {
        return;
    }

    for (var i = 0, size; size = this.sizes[i]; i++) {
        this.styles_.push({
            url: this.imagePath_ + (i + 1) + '.' + this.imageExtension_,
            height: size,
            width: size
        });
    }
};

/**
 *  Fit the map to the bounds of the markers in the clusterer.
 */
MarkerClusterer.prototype.fitMapToMarkers = function() {
    var markers = this.getMarkers();
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0, marker; marker = markers[i]; i++) {
        bounds.extend(marker.getPosition());
    }
    this.map_.fitBounds(bounds);
};

/**
 *  Sets the styles.
 *
 *  @param {Object} styles The style to set.
 */
MarkerClusterer.prototype.setStyles = function(styles) {
    this.styles_ = styles;
};

/**
 *  Gets the styles.
 *
 *  @return {Object} The styles object.
 */
MarkerClusterer.prototype.getStyles = function() {
    return this.styles_;
};

/**
 * Whether zoom on click is set.
 *
 * @return {boolean} True if zoomOnClick_ is set.
 */
MarkerClusterer.prototype.isZoomOnClick = function() {
    return this.zoomOnClick_;
};

/**
 * Gets the cluster zoom increment.
 *
 * @return {Number} cluster zoom increment.
 */
MarkerClusterer.prototype.getClusterZoomInc = function() {
    return this.clusterZoomInc_;
};

/**
 * Whether average center is set.
 *
 * @return {boolean} True if averageCenter_ is set.
 */
MarkerClusterer.prototype.isAverageCenter = function() {
    return this.averageCenter_;
};

/**
 *  Returns the array of markers in the clusterer.
 *
 *  @return {Array.<google.maps.Marker>} The markers.
 */
MarkerClusterer.prototype.getMarkers = function() {
    return this.markers_;
};

/**
 *  Returns the number of markers in the clusterer
 *
 *  @return {Number} The number of markers.
 */
MarkerClusterer.prototype.getTotalMarkers = function() {
    return this.markers_.length;
};

/**
 *  Sets the max zoom for the clusterer.
 *
 *  @param {number} maxZoom The max zoom level.
 */
MarkerClusterer.prototype.setMaxZoom = function(maxZoom) {
    this.maxZoom_ = maxZoom;
};

/**
 *  Gets the max zoom for the clusterer.
 *
 *  @return {number} The max zoom level.
 */
MarkerClusterer.prototype.getMaxZoom = function() {
    return this.maxZoom_;
};

/**
 *  The function for calculating the cluster icon image.
 *
 *  @param {Array.<google.maps.Marker>} markers The markers in the clusterer.
 *  @param {number} numStyles The number of styles available.
 *  @return {Object} A object properties: 'text' (string) and 'index' (number).
 *  @private
 */
MarkerClusterer.prototype.calculator_ = function(markers, numStyles) {
    var index = 0;
    var count = markers.length;
    var dv = count;
    while (dv !== 0) {
        dv = parseInt(dv / 10, 10);
        index++;
    }
    index = Math.min(index, numStyles);
    return {
        text: count,
        index: index
    };
};

/**
 * Set the calculator function.
 *
 * @param {function(Array, number)} calculator The function to set as the
 *     calculator. The function should return a object properties:
 *     'text' (string) and 'index' (number).
 *
 */
MarkerClusterer.prototype.setCalculator = function(calculator) {
    this.calculator_ = calculator;
};

/**
 * Get the calculator function.
 *
 * @return {function(Array, number)} the calculator function.
 */
MarkerClusterer.prototype.getCalculator = function() {
    return this.calculator_;
};

/**
 * Add an array of markers to the clusterer.
 *
 * @param {Array.<google.maps.Marker>} markers The markers to add.
 * @param {boolean=} opt_nodraw Whether to redraw the clusters.
 */
MarkerClusterer.prototype.addMarkers = function(markers, opt_nodraw) {
    if (markers.length) {
        for (var i = 0, marker; marker = markers[i]; i++) {
            this.pushMarkerTo_(marker);
        }
    } else if (Object.keys(markers).length) {
        for (var marker in markers) {
            this.pushMarkerTo_(markers[marker]);
        }
    }
    if (!opt_nodraw) {
        this.redraw();
    }
};

/**
 * Pushes a marker to the clusterer.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @private
 */
MarkerClusterer.prototype.pushMarkerTo_ = function(marker) {
    marker.isAdded = false;
    if (marker['draggable']) {
        // If the marker is draggable add a listener so we update the clusters on
        // the drag end.
        var that = this;
        google.maps.event.addListener(marker, 'dragend', function() {
            marker.isAdded = false;
            that.repaint();
        });
    }
    this.markers_.push(marker);
};

/**
 * Adds a marker to the clusterer and redraws if needed.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @param {boolean=} opt_nodraw Whether to redraw the clusters.
 */
MarkerClusterer.prototype.addMarker = function(marker, opt_nodraw) {
    this.pushMarkerTo_(marker);
    if (!opt_nodraw) {
        this.redraw();
    }
};

/**
 * Removes a marker and returns true if removed, false if not
 *
 * @param {google.maps.Marker} marker The marker to remove
 * @return {boolean} Whether the marker was removed or not
 * @private
 */
MarkerClusterer.prototype.removeMarker_ = function(marker) {
    var index = -1;
    if (this.markers_.indexOf) {
        index = this.markers_.indexOf(marker);
    } else {
        for (var i = 0, m; m = this.markers_[i]; i++) {
            if (m === marker) {
                index = i;
                break;
            }
        }
    }
    if (index === -1) {
        // Marker is not in our list of markers.
        return false;
    }
    marker.setMap(null);
    this.markers_.splice(index, 1);
    return true;
};

/**
 * Remove a marker from the cluster.
 *
 * @param {google.maps.Marker} marker The marker to remove.
 * @param {boolean=} opt_nodraw Optional boolean to force no redraw.
 * @return {boolean} True if the marker was removed.
 */
MarkerClusterer.prototype.removeMarker = function(marker, opt_nodraw) {
    var removed = this.removeMarker_(marker);
    if (!opt_nodraw && removed) {
        this.resetViewport();
        this.redraw();
        return true;
    } else {
        return false;
    }
};

/**
 * Removes an array of markers from the cluster.
 *
 * @param {Array.<google.maps.Marker>} markers The markers to remove.
 * @param {boolean=} opt_nodraw Optional boolean to force no redraw.
 */
MarkerClusterer.prototype.removeMarkers = function(markers, opt_nodraw) {
    var removed = false;
    for (var i = 0, marker; marker = markers[i]; i++) {
          var r = this.removeMarker_(marker);
          removed = removed || r;
    }
    if (!opt_nodraw && removed) {
        this.resetViewport();
        this.redraw();
        return true;
    }
};

/**
 * Sets the clusterer's ready state.
 *
 * @param {boolean} ready The state.
 * @private
 */
MarkerClusterer.prototype.setReady_ = function(ready) {
    if (!this.ready_) {
        this.ready_ = ready;
        this.createClusters_();
    }
};

/**
 * Returns the number of clusters in the clusterer.
 *
 * @return {number} The number of clusters.
 */
MarkerClusterer.prototype.getTotalClusters = function() {
    return this.clusters_.length;
};

/**
 * Returns the google map that the clusterer is associated with.
 *
 * @return {google.maps.Map} The map.
 */
MarkerClusterer.prototype.getMap = function() {
    return this.map_;
};

/**
 * Sets the google map that the clusterer is associated with.
 *
 * @param {google.maps.Map} map The map.
 */
MarkerClusterer.prototype.setMap = function(map) {
    this.map_ = map;
};

/**
 * Returns the size of the grid.
 *
 * @return {number} The grid size.
 */
MarkerClusterer.prototype.getGridSize = function() {
    return this.gridSize_;
};

/**
 * Sets the size of the grid.
 *
 * @param {number} size The grid size.
 */
MarkerClusterer.prototype.setGridSize = function(size) {
    this.gridSize_ = size;
};

/**
 * Returns the min cluster size.
 *
 * @return {number} The grid size.
 */
MarkerClusterer.prototype.getMinClusterSize = function() {
    return this.minClusterSize_;
};

/**
 * Sets the min cluster size.
 *
 * @param {number} size The grid size.
 */
MarkerClusterer.prototype.setMinClusterSize = function(size) {
    this.minClusterSize_ = size;
};

/**
 * Extends a bounds object by the grid size.
 *
 * @param {google.maps.LatLngBounds} bounds The bounds to extend.
 * @return {google.maps.LatLngBounds} The extended bounds.
 */
MarkerClusterer.prototype.getExtendedBounds = function(bounds) {
    var projection = this.getProjection();
    // Turn the bounds into latlng.
    var tr = new google.maps.LatLng(bounds.getNorthEast().lat(),
        bounds.getNorthEast().lng());
    var bl = new google.maps.LatLng(bounds.getSouthWest().lat(),
        bounds.getSouthWest().lng());
    // Convert the points to pixels and the extend out by the grid size.
    var trPix = projection.fromLatLngToDivPixel(tr);
    trPix.x += this.gridSize_;
    trPix.y -= this.gridSize_;
    var blPix = projection.fromLatLngToDivPixel(bl);
    blPix.x -= this.gridSize_;
    blPix.y += this.gridSize_;
    // Convert the pixel points back to LatLng
    var ne = projection.fromDivPixelToLatLng(trPix);
    var sw = projection.fromDivPixelToLatLng(blPix);
    // Extend the bounds to contain the new bounds.
    bounds.extend(ne);
    bounds.extend(sw);
    return bounds;
};

/**
 * Determins if a marker is contained in a bounds.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @param {google.maps.LatLngBounds} bounds The bounds to check against.
 * @return {boolean} True if the marker is in the bounds.
 * @private
 */
MarkerClusterer.prototype.isMarkerInBounds_ = function(marker, bounds) {
    return bounds.contains(marker.getPosition());
};

/**
 * Clears all clusters and markers from the clusterer.
 */
MarkerClusterer.prototype.clearMarkers = function() {
    this.resetViewport(true);
    // Set the markers a empty array.
    this.markers_ = [];
};

/**
 * Clears all existing clusters and recreates them.
 * @param {boolean} opt_hide To also hide the marker.
 */
MarkerClusterer.prototype.resetViewport = function(opt_hide) {
    // Remove all the clusters
    for (var i = 0, cluster; cluster = this.clusters_[i]; i++) {
        cluster.remove();
    }
    // Reset the markers to not be added and to be invisible.
    for (var i = 0, marker; marker = this.markers_[i]; i++) {
        marker.isAdded = false;
        if (opt_hide) {
            marker.setMap(null);
        }
    }
    this.clusters_ = [];
};

/**
 *
 */
MarkerClusterer.prototype.repaint = function() {
    var oldClusters = this.clusters_.slice();
    this.clusters_.length = 0;
    this.resetViewport();
    this.redraw();
    // Remove the old clusters.
    // Do it in a timeout so the other clusters have been drawn first.
    window.setTimeout(function() {
        for (var i = 0, cluster; cluster = oldClusters[i]; i++) {
            cluster.remove();
        }
    }, 0);
};

/**
 * Redraws the clusters.
 */
MarkerClusterer.prototype.redraw = function() {
    this.createClusters_();
};

/**
 * Calculates the distance between two latlng locations in km.
 * @see http://www.movable-type.co.uk/scripts/latlong.html
 *
 * @param {google.maps.LatLng} p1 The first lat lng point.
 * @param {google.maps.LatLng} p2 The second lat lng point.
 * @return {number} The distance between the two points in km.
 * @private
*/
MarkerClusterer.prototype.distanceBetweenPoints_ = function(p1, p2) {
    if (!p1 || !p2) {
        return 0;
    }
    var R = 6371; // Radius of the Earth in km
    var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
    var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
};

/**
 * Add a marker to a cluster, or creates a new cluster.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @private
 */
MarkerClusterer.prototype.addToClosestCluster_ = function(marker) {
    var distance = 40000; // Some large number
    var clusterToAddTo = null;
    var pos = marker.getPosition();
    for (var i = 0, cluster; cluster = this.clusters_[i]; i++) {
        var center = cluster.getCenter();
        if (center) {
            var d = this.distanceBetweenPoints_(center, marker.getPosition());
            if (d < distance) {
              distance = d;
              clusterToAddTo = cluster;
            }
        }
    }
    if (clusterToAddTo && clusterToAddTo.isMarkerInClusterBounds(marker)) {
        clusterToAddTo.addMarker(marker);
    } else {
        var cluster = new Cluster(this);
        cluster.addMarker(marker);
        this.clusters_.push(cluster);
    }
};

/**
 * Creates the clusters.
 *
 * @private
 */
MarkerClusterer.prototype.createClusters_ = function() {
    if (!this.ready_) {
        return;
    }
    // Get our current map view bounds.
    // Create a new bounds object so we don't affect the map.
    var mapBounds = new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),
        this.map_.getBounds().getNorthEast());
    var bounds = this.getExtendedBounds(mapBounds);
    for (var i = 0, marker; marker = this.markers_[i]; i++) {
        if (!marker.isAdded && this.isMarkerInBounds_(marker, bounds)) {
            this.addToClosestCluster_(marker);
        }
    }
};

/**
 * A cluster that contains markers.
 *
 * @param {MarkerClusterer} markerClusterer The markerclusterer that this
 *     cluster is associated with.
 * @constructor
 * @ignore
 */
function Cluster(markerClusterer) {
    this.markerClusterer_ = markerClusterer;
    this.map_ = markerClusterer.getMap();
    this.gridSize_ = markerClusterer.getGridSize();
    this.minClusterSize_ = markerClusterer.getMinClusterSize();
    this.averageCenter_ = markerClusterer.isAverageCenter();
    this.center_ = null;
    this.markers_ = [];
    this.bounds_ = null;
    this.clusterIcon_ = new ClusterIcon(
        this,
        markerClusterer.getStyles(),
        markerClusterer.getGridSize()
    );
}

/**
 * Determins if a marker is already added to the cluster.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker is already added.
 */
Cluster.prototype.isMarkerAlreadyAdded = function(marker) {
    if (this.markers_.indexOf) {
        return this.markers_.indexOf(marker) !== -1;
    } else {
        for (var i = 0, m; m = this.markers_[i]; i++) {
            if (m === marker) {
                return true;
            }
        }
    }
    return false;
};

/**
 * Add a marker the cluster.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @return {boolean} True if the marker was added.
 */
Cluster.prototype.addMarker = function(marker) {
    if (this.isMarkerAlreadyAdded(marker)) {
        return false;
    }
    if (!this.center_) {
        this.center_ = marker.getPosition();
        this.calculateBounds_();
    } else {
        if (this.averageCenter_) {
            var l = this.markers_.length + 1;
            var lat = (this.center_.lat() * (l-1) + marker.getPosition().lat()) / l;
            var lng = (this.center_.lng() * (l-1) + marker.getPosition().lng()) / l;
            this.center_ = new google.maps.LatLng(lat, lng);
            this.calculateBounds_();
        }
    }
    marker.isAdded = true;
    this.markers_.push(marker);
    var len = this.markers_.length;
    if (len < this.minClusterSize_ && marker.getMap() !== this.map_) {
        // Min cluster size not reached so show the marker.
        marker.setMap(this.map_);
    }
    if (len === this.minClusterSize_) {
        // Hide the markers that were showing.
        for (var i = 0; i < len; i++) {
            this.markers_[i].setMap(null);
        }
    }
    if (len >= this.minClusterSize_) {
        marker.setMap(null);
    }
    this.updateIcon();
    return true;
};

/**
 * Returns the marker clusterer that the cluster is associated with.
 *
 * @return {MarkerClusterer} The associated marker clusterer.
 */
Cluster.prototype.getMarkerClusterer = function() {
    return this.markerClusterer_;
};

/**
 * Returns the bounds of the cluster.
 *
 * @return {google.maps.LatLngBounds} the cluster bounds.
 */
Cluster.prototype.getBounds = function() {
    var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
    var markers = this.getMarkers();
    for (var i = 0, marker; marker = markers[i]; i++) {
        bounds.extend(marker.getPosition());
    }
    return bounds;
};

/**
 * Removes the cluster
 */
Cluster.prototype.remove = function() {
    this.clusterIcon_.remove();
    this.markers_.length = 0;
    delete this.markers_;
};

/**
 * Returns the center of the cluster.
 *
 * @return {number} The cluster center.
 */
Cluster.prototype.getSize = function() {
    return this.markers_.length;
};

/**
 * Returns the center of the cluster.
 *
 * @return {Array.<google.maps.Marker>} The cluster center.
 */
Cluster.prototype.getMarkers = function() {
    return this.markers_;
};

/**
 * Returns the center of the cluster.
 *
 * @return {google.maps.LatLng} The cluster center.
 */
Cluster.prototype.getCenter = function() {
    return this.center_;
};

/**
 * Calculated the extended bounds of the cluster with the grid.
 *
 * @private
 */
Cluster.prototype.calculateBounds_ = function() {
    var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
    this.bounds_ = this.markerClusterer_.getExtendedBounds(bounds);
};

/**
 * Determines if a marker lies in the clusters bounds.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker lies in the bounds.
 */
Cluster.prototype.isMarkerInClusterBounds = function(marker) {
    return this.bounds_.contains(marker.getPosition());
};

/**
 * Returns the map that the cluster is associated with.
 *
 * @return {google.maps.Map} The map.
 */
Cluster.prototype.getMap = function() {
    return this.map_;
};

/**
 * Updates the cluster icon
 */
Cluster.prototype.updateIcon = function() {
    var zoom = this.map_.getZoom();
    var mz = this.markerClusterer_.getMaxZoom();
    if (mz && zoom > mz) {
        // The zoom is greater than our max zoom so show all the markers in cluster.
        for (var i = 0, marker; marker = this.markers_[i]; i++) {
            marker.setMap(this.map_);
        }
        return;
    }
    if (this.markers_.length < this.minClusterSize_) {
        // Min cluster size not yet reached.
        this.clusterIcon_.hide();
        return;
    }
    var numStyles = this.markerClusterer_.getStyles().length;
    var sums = this.markerClusterer_.getCalculator()(this.markers_, numStyles);
    this.clusterIcon_.setCenter(this.center_);
    this.clusterIcon_.setSums(sums);
    this.clusterIcon_.show();
};

/**
 * A cluster icon
 *
 * @param {Cluster} cluster The cluster to be associated with.
 * @param {Object} styles An object that has style properties:
 *     'url': (string) The image url.
 *     'height': (number) The image height.
 *     'width': (number) The image width.
 *     'anchor': (Array) The anchor position of the label text.
 *     'textColor': (string) The text color.
 *     'textSize': (number) The text size.
 *     'backgroundPosition: (string) The background postition x, y.
 * @param {number=} opt_padding Optional padding to apply to the cluster icon.
 * @constructor
 * @extends google.maps.OverlayView
 * @ignore
 */
function ClusterIcon(cluster, styles, opt_padding) {
    cluster.getMarkerClusterer().extend(ClusterIcon, google.maps.OverlayView);
    this.styles_ = styles;
    this.padding_ = opt_padding || 0;
    this.cluster_ = cluster;
    this.center_ = null;
    this.map_ = cluster.getMap();
    this.div_ = null;
    this.sums_ = null;
    this.visible_ = false;
    this.setMap(this.map_);
}

/**
 * Triggers the clusterclick event and zoom's if the option is set.
 */
ClusterIcon.prototype.triggerClusterClick = function() {
    var markerClusterer = this.cluster_.getMarkerClusterer();
    // Trigger the clusterclick event.
    google.maps.event.trigger(markerClusterer, 'clusterclick', this.cluster_);
    CanalTP.lib.clicTemp = true;
    if (markerClusterer.isZoomOnClick()) {
        // Zoom into the cluster.
        this.map_.setZoom(
            markerClusterer.getMaxZoom() + markerClusterer.getClusterZoomInc()
        );
        this.map_.setCenter(this.cluster_.getCenter());
    }
};

/**
 * Adding the cluster icon to the dom.
 * @ignore
 */
ClusterIcon.prototype.onAdd = function() {
    this.div_ = document.createElement('DIV');
    if (this.visible_) {
        var pos = this.getPosFromLatLng_(this.center_);
        this.div_.style.cssText = this.createCss(pos);
        this.div_.innerHTML = this.sums_.text;
    }
    var panes = this.getPanes();
    panes.overlayMouseTarget.appendChild(this.div_);
    var that = this;
    google.maps.event.addDomListener(this.div_, 'click', function() {
        that.triggerClusterClick();
    });
};

/**
 * Returns the position to place the div dending on the latlng.
 *
 * @param {google.maps.LatLng} latlng The position in latlng.
 * @return {google.maps.Point} The position in pixels.
 * @private
 */
ClusterIcon.prototype.getPosFromLatLng_ = function(latlng) {
    var pos = this.getProjection().fromLatLngToDivPixel(latlng);
    pos.x -= parseInt(this.width_ / 2, 10);
    pos.y -= parseInt(this.height_ / 2, 10);
    return pos;
};

/**
 * Draw the icon.
 * @ignore
 */
ClusterIcon.prototype.draw = function() {
    if (this.visible_) {
        var pos = this.getPosFromLatLng_(this.center_);
        this.div_.style.top = pos.y + 'px';
        this.div_.style.left = pos.x + 'px';
    }
};

/**
 * Hide the icon.
 */
ClusterIcon.prototype.hide = function() {
    if (this.div_) {
        this.div_.style.display = 'none';
    }
    this.visible_ = false;
};

/**
 * Position and show the icon.
 */
ClusterIcon.prototype.show = function() {
    if (this.div_) {
        var pos = this.getPosFromLatLng_(this.center_);
        this.div_.style.cssText = this.createCss(pos);
        this.div_.style.display = '';
    }
    this.visible_ = true;
};

/**
 * Remove the icon from the map
 */
ClusterIcon.prototype.remove = function() {
    this.setMap(null);
};

/**
 * Implementation of the onRemove interface.
 * @ignore
 */
ClusterIcon.prototype.onRemove = function() {
    if (this.div_ && this.div_.parentNode) {
        this.hide();
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
    }
};

/**
 * Set the sums of the icon.
 *
 * @param {Object} sums The sums containing:
 *   'text': (string) The text to display in the icon.
 *   'index': (number) The style index of the icon.
 */
ClusterIcon.prototype.setSums = function(sums) {
    this.sums_ = sums;
    this.text_ = sums.text;
    this.index_ = sums.index;
    if (this.div_) {
        this.div_.innerHTML = sums.text;
    }
    this.useStyle();
};

/**
 * Sets the icon to the the styles.
 */
ClusterIcon.prototype.useStyle = function() {
    var index = Math.max(0, this.sums_.index - 1);
    index = Math.min(this.styles_.length - 1, index);
    var style = this.styles_[index];
    this.url_ = style['url'];
    this.height_ = style['height'];
    this.width_ = style['width'];
    this.textColor_ = style['textColor'];
    this.anchor_ = style['anchor'];
    this.textSize_ = style['textSize'];
    this.backgroundPosition_ = style['backgroundPosition'];
};

/**
 * Sets the center of the icon.
 *
 * @param {google.maps.LatLng} center The latlng to set as the center.
 */
ClusterIcon.prototype.setCenter = function(center) {
    this.center_ = center;
};

/**
 * Create the css text based on the position of the icon.
 *
 * @param {google.maps.Point} pos The position.
 * @return {string} The css style text.
 */
ClusterIcon.prototype.createCss = function(pos) {
    var style = [];
    style.push('background-image:url(' + this.url_ + ');');
    var backgroundPosition = this.backgroundPosition_ ? this.backgroundPosition_ : '0 0';
    style.push('background-position:' + backgroundPosition + ';');

    if (typeof this.anchor_ === 'object') {
        if (typeof this.anchor_[0] === 'number' && this.anchor_[0] > 0 &&
            this.anchor_[0] < this.height_) {
            style.push('height:' + (this.height_ - this.anchor_[0]) +
            'px; padding-top:' + this.anchor_[0] + 'px;');
        } else {
            style.push('height:' + this.height_ + 'px; line-height:' + this.height_ / 2 +
            'px;');
        }
        if (typeof this.anchor_[1] === 'number' && this.anchor_[1] > 0 &&
            this.anchor_[1] < this.width_) {
            style.push('width:' + (this.width_ - this.anchor_[1]) +
            'px; padding-left:' + this.anchor_[1] + 'px;');
        } else {
            style.push('width:' + this.width_ + 'px; text-align:center;');
        }
    } else {
        style.push('height:' + this.height_ + 'px; line-height:' +
        this.height_ / 2 + 'px; width:' + this.width_ + 'px; text-align:center;');
    }
    var txtColor = this.textColor_ ? this.textColor_ : 'black';
    var txtSize = this.textSize_ ? this.textSize_ : 11;
    style.push('cursor:pointer; top:' + pos.y + 'px; left:' +
        pos.x + 'px; color:' + txtColor + '; position:absolute; font-size:' +
        txtSize + 'px; font-family:Arial,sans-serif; font-weight:bold');
    return style.join('');
};

// Export Symbols for Closure
// If you are not going to compile with closure then you can remove the
// code below.
window['MarkerClusterer'] = MarkerClusterer;
MarkerClusterer.prototype['addMarker'] = MarkerClusterer.prototype.addMarker;
MarkerClusterer.prototype['addMarkers'] = MarkerClusterer.prototype.addMarkers;
MarkerClusterer.prototype['clearMarkers'] = MarkerClusterer.prototype.clearMarkers;
MarkerClusterer.prototype['fitMapToMarkers'] = MarkerClusterer.prototype.fitMapToMarkers;
MarkerClusterer.prototype['getCalculator'] = MarkerClusterer.prototype.getCalculator;
MarkerClusterer.prototype['getGridSize'] = MarkerClusterer.prototype.getGridSize;
MarkerClusterer.prototype['getExtendedBounds'] = MarkerClusterer.prototype.getExtendedBounds;
MarkerClusterer.prototype['getMap'] = MarkerClusterer.prototype.getMap;
MarkerClusterer.prototype['getMarkers'] = MarkerClusterer.prototype.getMarkers;
MarkerClusterer.prototype['getMaxZoom'] = MarkerClusterer.prototype.getMaxZoom;
MarkerClusterer.prototype['getStyles'] = MarkerClusterer.prototype.getStyles;
MarkerClusterer.prototype['getTotalClusters'] = MarkerClusterer.prototype.getTotalClusters;
MarkerClusterer.prototype['getTotalMarkers'] = MarkerClusterer.prototype.getTotalMarkers;
MarkerClusterer.prototype['redraw'] = MarkerClusterer.prototype.redraw;
MarkerClusterer.prototype['removeMarker'] = MarkerClusterer.prototype.removeMarker;
MarkerClusterer.prototype['removeMarkers'] = MarkerClusterer.prototype.removeMarkers;
MarkerClusterer.prototype['resetViewport'] = MarkerClusterer.prototype.resetViewport;
MarkerClusterer.prototype['repaint'] = MarkerClusterer.prototype.repaint;
MarkerClusterer.prototype['setCalculator'] = MarkerClusterer.prototype.setCalculator;
MarkerClusterer.prototype['setGridSize'] = MarkerClusterer.prototype.setGridSize;
MarkerClusterer.prototype['setMaxZoom'] = MarkerClusterer.prototype.setMaxZoom;
MarkerClusterer.prototype['onAdd'] = MarkerClusterer.prototype.onAdd;
MarkerClusterer.prototype['draw'] = MarkerClusterer.prototype.draw;

Cluster.prototype['getCenter'] = Cluster.prototype.getCenter;
Cluster.prototype['getSize'] = Cluster.prototype.getSize;
Cluster.prototype['getMarkers'] = Cluster.prototype.getMarkers;

ClusterIcon.prototype['onAdd'] = ClusterIcon.prototype.onAdd;
ClusterIcon.prototype['draw'] = ClusterIcon.prototype.draw;
ClusterIcon.prototype['onRemove'] = ClusterIcon.prototype.onRemove;

Object.keys = Object.keys || function(o) {
    var result = [];
    for (var name in o) {
        if (o.hasOwnProperty(name)) {
            result.push(name);
        }
    }
    return result;
};

/**
 * Model de polyline
 * Author RNE
 * CanalTP - 2013
 * @type @exp;CanalTP.lib.map.models@pro;polyline@call;extend
 */
var ctpCircle = CanalTP.lib.map.models.circle.extend({
    /**
     * Fonction permettant de créer un cercle
     */
    createModelCircle: function()
    {
        if(!_.isEmpty(this.get('center'))){
            this.createCircleObject();
        }
        else{
            console.log('log Erreur: center is missing.');
        }
    },
    /**
     * Création du circle Google
     */
    createCircleObject: function()
    {
        var circle = new google.maps.Circle({
            center: this.get('center'),
            clickable: this.get('isClickable'),
            editable: this.get('isEditable'),
            draggable: this.get('isDraggable'),
            fillColor: this.get('fillColor'),
            fillOpacity: this.get('fillOpacity'),
            radius: this.get('radius'),
            strokeColor: this.get('strokeColor'),
            strokeOpacity: this.get('strokeOpacity'),
            strokeWeight: this.get('strokeWeight'),
            visible: this.get('visible'),
            zIndex: this.get('zIndex')
        });
        this.set('mapElement', circle);
    }
});
/**
 * Model de polyline
 * Author RNE
 * CanalTP - 2013
 * @type @exp;CanalTP.lib.map.models@pro;polyline@call;extend
 */
var ctpControl = Backbone.Model.extend({

    // Set CSS styles for the DIV containing the control
    // Setting padding to 5 px will offset the control
    // from the edge of the map.
    parameters: {
        controlDiv: null,
        controlPosition: 'RIGHT_BOTTOM',
        eventName: 'center',
        eventCenter: null,
        map: null,
        divStyle: {},
        divOptions: {},
        uIStyle: {
            padding: '4px',
            backgroundColor: '#007e8e',
            borderStyle: 'solid',
            cursor: 'pointer',
            textAlign: 'center'
        },
        uIOptions: {
            title: 'Click to set the map to Home'
        },
        textStyle: {
            fontFamily: 'Arial,sans-serif',
            fontSize: '12px',
            paddingLeft: '4px',
            paddingRight: '4px'
        },
        textOptions: {
            innerHTML: '<strong>Home</strong>'
        },
        control: null
    },
    /**
     * Fonction permettant l'initialisation
     * @param {object} options
     */
    initialize: function(options)
    {
        CanalTP.lib.map.wrapper.addDomListener = google.maps.event.addDomListener;
        CanalTP.lib.map.wrapper.trigger = google.maps.event.trigger;
        CanalTP.lib.map.wrapper.ControlPosition = google.maps.ControlPosition;
        this.parameters = _.extend({}, this.parameters, options);
        this.parameters.divStyle = _.extend({}, this.parameters.divStyle, options.divStyle);
        this.parameters.divOptions = _.extend({}, this.parameters.divOptions, options.divOptions);
        this.parameters.uIStyle = _.extend({}, this.parameters.uIStyle, options.uIStyle);
        this.parameters.uIOptions = _.extend({}, this.parameters.uIOptions, options.uIOptions);
        this.parameters.textStyle = _.extend({}, this.parameters.textStyle, options.textStyle);
        this.parameters.textOptions = _.extend({}, this.parameters.textOptions, options.textOptions);
        this.createCustomControl();
        this.controlEvent();
        this.addControlPosition();
    },
    /**
     * Function to create the control
     */
    createCustomControl: function()
    {
        var controlUI = document.createElement('div');
        var controlText = document.createElement('div');
        if (this.parameters.controlDiv === null) {
            this.parameters.controlDiv = document.createElement('div');
        }
        this.addCustomOptions(this.parameters.controlDiv, 'div');
        this.addCustomOptions(controlUI, 'uI');
        this.addCustomOptions(controlText, 'text');
        this.parameters.controlDiv.appendChild(controlUI);
        controlUI.appendChild(controlText);
        this.parameters.control = controlUI;
    },

    /**
     * Function to add the options (style and other)
     * @param {object} element html element
     * @param {object} type type of parameters
     */
    addCustomOptions: function(element, type)
    {
        _.each(this.parameters[type+'Style'], function(value, key){
            element.style[key] = value;
        }, this);
        _.each(this.parameters[type+'Options'], function(value, key){
            element[key] = value;
        }, this);
        return element;
    },

    /**
     * Function to get the control
     */
    getControl: function()
    {
        return this.parameters.control;
    },

    /**
     * Function to add event
     * The default event is to recenter the map
     * Trigger for custom event
     */
    controlEvent: function()
    {
        if (this.parameters.eventName !== 'center'){
            CanalTP.lib.map.wrapper.trigger(
                this.parameters.control, this.parameters.triggerCustomControl, this
            );
        } else {
            this.recenterEvent();
        }
    },

    // Setup the click event listeners: simply set the map to homeCenter.
    recenterEvent: function()
    {
        CanalTP.lib.map.wrapper.addDomListener(this.parameters.control, 'click',
            CanalTP.jQuery.proxy(function() {
                this.parameters.map.setCenter(this.parameters.eventCenter);
            }, this)
        );
    },

    /**
     * Function to add the control button on the map
     */
    addControlPosition: function()
    {
        this.parameters.control.index = 10;
        this.parameters.map.controls[
            CanalTP.lib.map.wrapper.ControlPosition[this.parameters.controlPosition]
        ].push(this.parameters.control);
    }
});
/**
 * Model d'initialisation de la map
 * Author RNE
 * CanalTP - 2013
 * @type @exp;CanalTP.lib.map.models@pro;initMap@call;extend
 */
var ctpInitMap = CanalTP.lib.map.models.initMap.extend({
    // Surcharge des paramètres par défauts avec les paramètres spécifiques gmap
    defaults: _.extend({}, CanalTP.lib.map.models.infobulle.prototype.defaults,
        {
            mapTypeId: "roadmap",
            scaleControl: true,
            zoomControl: true,
            zoomStyle: "SMALL",
            // MapTypeControl: 0=>default, 1=>Horizontal_bar, 2=>DropDown_Menu
            mapTypeControl: 2,
            mapTypePosition: 'LEFT_BOTTOM',
            styles: [{
                featureType: "poi.business",
                stylers: [
                  {visibility: "off"}
                ]
            }]
        }
    ),

    /**
     * Fonction de validation des paramètres
     * @param {object} attr attributs du model
     */
    validate: function(attr){
        if (!_.isNumber(attr.centerX) || !_.isNumber(attr.centerY) || !_.isNumber(attr.zoom)){
             return 'log Erreur: center and zoom must be number';
        }
    },

    /**
     * Fonction permettant de créer le model
     */
    createMapModel: function()
    {
        this.set('point',new CanalTP.lib.map.wrapper.LatLng(this.get('centerX'), this.get('centerY')));
        var mapOptions = {
            id: this.cid,
            zoom: this.get('zoom'),
            center: this.get('point'),
            mapTypeId: this.get('mapTypeId'),
            scaleControl: this.get('scaleControl'),
            zoomControl: this.get('zoomControl'),
            zoomControlOptions: {
                style: this.get('zoomStyle')
            },
            mapTypeControlOptions: {
                style: this.get('mapTypeControl'),
                position: CanalTP.lib.map.wrapper.ControlPosition[this.get('mapTypePosition')]
            },
            styles: this.get('styles')
        };
        this.set('objMap', mapOptions);
        this.createInfobulle();
    },

    setWrappers: function ()
    {
        CanalTP.lib.map.wrapper.LatLng = google.maps.LatLng;
        CanalTP.lib.map.wrapper.ControlPosition = google.maps.ControlPosition;
    }
});
/**
 * Model KML
 * Author RNE
 * CanalTP - 2013
 * @type @exp;CanalTP.lib.map.models@pro;kml@call;extend
 */
var ctpKmlLayer = CanalTP.lib.map.models.kml.extend({
    // Surcharge des paramètres par défauts avec les paramètres spécifiques gmap
    defaults: {
        "preserveViewPort": true,
        "isAlwaysVisible" : true
    },
    /**
     * Fonction permettant l'initialisation
     */
    initialize: function()
    {
        _.extend(
            CanalTP.lib.map.models.kml.prototype.defaults,
            CanalTP.lib.map.models.infobulle.prototype.defaults
        );
        this.createModelKml();
        if (this.get('kmlActions') === "infobulle") {
            this.createInfobulle();
        }
        this.getKmlStatus();
        this.bind('change:iContent', function(model, value){
            model.setObjInfobulle({content: value});
        });
        this.bind('change:point', function(model, value){
            model.setObjInfobulle({position: value});
        });
        this.on("remove", this.deleteObjectOnMap);
    },
    /**
     * Fonction permettant de créer un kmlLayer
     */
    createModelKml: function()
    {
        var ctaLayer = new google.maps.KmlLayer(
                this.get('url'),
                {
                    suppressInfoWindows: this.get('suppressInfowindow'),
                    preserveViewport: this.get('preserveViewPort'),
                    clickable: this.get('isClickable'),
                    type: this.get('type')
                }
            );
        this.set('mapElement', ctaLayer);
    },
    /**
     * Fonction pour récupérer le status du chargement du kml
     * to debug uncomment
     */
    getKmlStatus: function()
    {
        google.maps.event.addListener(this.get('mapElement'), "status_changed", function() {
            /*console.log(
                this.getUrl() + ": KML Status = " + this.getStatus()
            );*/
        });
    },

    /**
     * Modification du contenu de l'infobulle
     * @param {object} attributes
     */
     setObjInfobulle: function(attributes){
        var objInfobulle = this.get("objInfobulle") || {};
        _.extend(objInfobulle, attributes);
        this.set({objInfobulle:objInfobulle});
    }
});

/**
 * Model de markers
 * Author RNE
 * CanalTP 2013
 * @type @exp;Backbone@pro;Model@call;extend
 */
var ctpMarker = CanalTP.lib.map.models.marker.extend({
    /**
     * Fonction permettant de créer le model marker
     */
    createModelMarker: function()
    {
        if ( _.isNumber(this.get('lat')) && _.isNumber(this.get('lon'))) {
            var point = new google.maps.LatLng(this.get('lat'), this.get('lon'), true);
            this.set({point: point});
            this.createMarkerObject();
            if (this.get('isClickable') === true) {
                this.createInfobulle();
            }
        } else {
            console.log('log Erreur: lat will be a number and lon will be a number ');
            return false;
        }
    },
    /**
     * Création du marker google
     */
    createMarkerObject: function()
    {
        var marker;
        var image = this.get('image');
        var isFont = image && image.match(/\.[a-z]{3,4}$/i) === null;
        if (isFont) {
            marker = new MarkerWithLabel({
                position: this.get('point'),
                title: this.get('title'),
                draggable: this.get('isDraggable'),
                icon: ' ',
                labelContent: '<span class="' + image + '" style="font-size: 1em;"></span>',
                labelStyle: {
                    fontSize: this.get('graphicWidth') + 'px'
                },
                labelAnchor: new google.maps.Point(
                    this.get('graphicWidth') / 2,
                    this.get('graphicHeight') / 2
                )
            });
        } else {
            marker = new google.maps.Marker({
                position: this.get('point'),
                icon: image,
                title: this.get('title'),
                draggable: this.get('isDraggable')
            });
        }
        this.set('mapElement', marker);
    }
});

/**
 * Model de polyline
 * Author RNE
 * CanalTP - 2013
 * @type @exp;CanalTP.lib.map.models@pro;polyline@call;extend
 */
var ctpPolyline = CanalTP.lib.map.models.polyline.extend({
    /**
     * Fonction permettant de créer un polyline
     */
    createModelPolyline: function()
    {
        var latLngs = [];
        if(!_.isEmpty(this.get('path'))){
            _.each(this.get('path'), function(value){
                if(value.lat !== 0 || value.lon !== 0){
                    value.point = new google.maps.LatLng(value.lat, value.lon, true);
                    latLngs.push(value.point);
                }
            });
            this.set('latLngsPath', latLngs);
            this.setPolylineColor();
            this.createPolylineObject();
            /*if (this.get('isClickable') === true) {
                this.createInfobulle();
            }*/
        }
        else{
            console.log('log Erreur: path is missing');
        }
    },
    /**
     * Création du polyline Google
     */
    createPolylineObject: function()
    {
        var polyline = new google.maps.Polyline({
            path: this.get('latLngsPath'),
            icons: this.getIcons(),
            strokeColor: this.get('color'),
            strokeOpacity: this.get('opacity'),
            strokeWeight: this.get('weight'),
            zIndex: this.get('zIndex'),
            clickable: this.get('isClickable'),
            hoverable: this.get('isHoverable'),
            editable: this.get('isEditable'),
            draggable: this.get('isDraggable')
        });
        this.set('mapElement', polyline);
    },
    /**
     * Function to get icons according to the browser version
     * @returns {Anonym$0.getIcons@call;get|Array.getIcons.icons}
     */
    getIcons: function()
    {
        var icons = null;
        if (parseFloat(navigator.appVersion.split("MSIE")[1]) > 8) {
            icons = this.get('icons');
        }
        return icons;
    }
});
/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
CanalTP.lib.map.collections = Backbone.Collection.extend({
    visibility: {
        value: 'true',
        except: []
    },
    map: null,
    view: ctpMap,
    issuer: '',

    setVisibility: function(visibility, except)
    {
        _.each(this.models, function(value){
            if (!_.contains(except, value.get('step'))) {
                value.set('isVisible', visibility);
            } else {
                value.set('isVisible', !visibility);
            }
        });
        var type = s = this.collectionType.substring(0, this.collectionType.length - 1);
        this.view.prototype.manageDisplayMapObject(this, type);
    },

    setMapView: function(map)
    {
        this.map = map;
    },

    getMapView: function()
    {
        return this.map;
    },

    /**
     * Function to return the excluded points
     * coords(0,0) and coord(-3.404561, 27.40972)
     * The last is coords (0,0) in Lambert II
     */
    getExcludedPoint: function()
    {
        this.excludedPoints = [
            { point: new CanalTP.lib.map.wrapper.latLon(0, 0) },
            { point: new CanalTP.lib.map.wrapper.latLon(30.129281, 2.038886) }
        ];
        return this.excludedPoints;
    },

    /**
     * Function to remove the excluded point from the collection
     */
    removeExcludedPoint: function()
    {
        this.getExcludedPoint();
        _.each(this.excludedPoints, function(excluded) {
            _.each(this.models, function(model, modelKey) {
                if (this.collectionType === 'polylines') {
                    this.managePolylinePath(model, modelKey, excluded.point);
                } else {
                    if(_.isEqual(excluded.point, model.get('point'))) {
                        this.remove(model);
                    }
                }
            }, this);
       }, this);
    },

    /**
     * Function to remove polyline paths
     * the goal is to link point when a delete is done.
     * If the deleted point is the last of the path array, we replace this point with the first
     * of the next model (if exist)
     * If the deleted point is the first of the path array, we replace this point with the last
     * of the previous model
     * else this point is deleted from the array
     * @param {object} model
     * @param {object} modelKey
     * @param {object} excludedPoint
     */
    managePolylinePath: function(model, modelKey, excludedPoint)
    {
        _.each(model.get('latLngsPath'), function(point, key) {
            if(_.isEqual(excludedPoint, point)) {
                if (point === _.last(model.get('latLngsPath'))) {
                    if (typeof(this.models[modelKey + 1]) !== 'undefined') {
                        model.get('latLngsPath')[key] = _.first(
                            this.models[modelKey + 1].get('latLngsPath')
                        );
                    } else {
                        model.get('latLngsPath').splice(key, 1);
                    }
                } else if (point === _.first(model.get('latLngsPath'))){
                    if (typeof(this.models[modelKey - 1]) !== 'undefined') {
                        model.get('latLngsPath')[key] = _.last(
                            this.models[modelKey - 1].get('latLngsPath')
                        );
                    } else {
                        model.get('latLngsPath').splice(key, 1);
                    }
                } else {
                    model.get('latLngsPath').splice(key, 1);
                }
            }
        }, this);
        return model;
    }
});

/**
 * Collection de polylines
 * Author RNE
 * CanalTP 2013
 * @type @exp;Backbone@pro;Collection@call;extend
 */
var ctpCircles = CanalTP.lib.map.collections.extend({
    model: ctpCircle,
    collectionType: 'circles'
});

/**
 * Collection de polylines
 * Author RNE
 * CanalTP 2013
 * @type @exp;Backbone@pro;Collection@call;extend
 */
var ctpControls = Backbone.Collection.extend({
    model: ctpControl,
    collectionType: 'controls'
});

/**
 * Collection initialisation Maps
 * Author RNE
 * CanalTP 2013
 * @type @exp;Backbone@pro;Collection@call;extend
 */
var ctpInitMaps = Backbone.Collection.extend({
    model: ctpInitMap,
    collectionType: 'initMaps'
});

/**
 * Collection de KMLLayer
 * Author RNE
 * CanalTP 2013
 * @type @exp;Backbone@pro;Collection@call;extend
 */
var ctpKmlLayers = CanalTP.lib.map.collections.extend({
    model: ctpKmlLayer,
    collectionType: 'kmlLayers'
});



/**
 * Collection de markers
 * Author RNE
 * CanalTP 2013
 * @type @exp;Backbone@pro;Collection@call;extend
 */
var ctpMarkers = CanalTP.lib.map.collections.extend({
    model: ctpMarker,
    collectionType: 'markers',

    /**
     * Fonction permettant l'initialisation
     */
    initialize: function()
    {
        this.bind("add", function(){
            this.removeExcludedPoint();
        });
    }
});

/**
 * Collection de polylines
 * Author RNE
 * CanalTP 2013
 * @type @exp;Backbone@pro;Collection@call;extend
 */
var ctpPolylines = CanalTP.lib.map.collections.extend({
    model: ctpPolyline,
    collectionType: 'polylines',

    /**
     * Fonction permettant l'initialisation
     */
    initialize: function()
    {
        this.bind("add", function(){
            this.removeExcludedPoint();
        });
    },

    /**
     * Fonction permettant de setter l'option weight (strokeWeight de gm)
     * @param {Number} weight taille (grosseur) de la polyline
     */
    setWeight: function(weight)
    {
        this.weight = weight;
        _.each(this.models, CanalTP.jQuery.proxy(function(value){
            value.get('mapElement').setOptions({strokeWeight: this.weight});
        }), this);
    },

    /**
     * Fonction permettant de reset l'option weight
     */
    resetWeight: function()
    {
        _.each(this.models, CanalTP.jQuery.proxy(function(value){
            this.weight = value.previous('weight');
            value.get('mapElement').setOptions({strokeWeight: this.weight});
        }), this);
    },

    /**
     * Fonction permettant de récupérer le weight
     */
    getWeight: function()
    {
        return this.weight;
    },

    /**
     * Fonction permettant de setter l'option color (strokecolor de gm)
     * @param {String} color
     */
    setColor: function(color)
    {
        this.color = color;
        _.each(this.models, CanalTP.jQuery.proxy(function(value){
            value.get('mapElement').setOptions({strokeColor: this.color});
        }), this);
    },

    /**
     * Fonction permettant de reset l'option color
     */
    resetColor: function()
    {
        _.each(this.models, CanalTP.jQuery.proxy(function(value){
            this.color = value.previous('color');
            value.get('mapElement').setOptions({strokeColor: this.color});
        }), this);
    },

    /**
     * Fonction permettant de récupérer l'option color
     */
    getColor: function()
    {
        return this.color;
    },

    /**
     * Fonction permettant de setter l'option opacity (strokeOpacity de gm)
     * @param {Number} opacity
     */
    setOpacity: function(opacity)
    {
        this.opacity = opacity;
        _.each(this.models, CanalTP.jQuery.proxy(function(value){
            value.get('mapElement').setOptions({strokeOpacity: this.opacity});
        }), this);
    },

    /**
     * Fonction permettant de reset l'option opacity
     */
    resetOpacity: function()
    {
       _.each(this.models, CanalTP.jQuery.proxy(function(value){
            this.opacity = value.previous('opacity');
            value.get('mapElement').setOptions({strokeOpacity: this.opacity});
        }), this);
    },

    /**
     * Fonction permettant de récupérer l'opacity
     */
    getOpacity: function()
    {
        return this.opacity;
    },

    /**
     * Fonction permettant de setter l'option zIndex (zIndex de gm)
     * @param {Number} zIndex
     */
    setzIndex: function(zIndex)
    {
        this.zIndex = parseInt(zIndex);
        _.each(this.models, CanalTP.jQuery.proxy(function(value){
            value.get('mapElement').setOptions({zIndex: this.zIndex});
        }), this);
    },

    /**
     * Fonction permettant de reset l'option zIndex
     */
    resetzIndex: function()
    {
       _.each(this.models, CanalTP.jQuery.proxy(function(value){
            this.zIndex = value.previous('zIndex');
            value.get('mapElement').setOptions({zIndex: this.zIndex});
        }), this);
    },

    /**
     * Fonction permettant de récupérer le zIndex
     */
    getzIndex: function()
    {
        return this.zIndex;
    },

    /**
     * Fonction permettant de setter l'option Icons (zIndex de gm)
     * @param {Array} icons
     */
    setIcons: function(icons)
    {
        this.icons = null;
        if (parseFloat(navigator.appVersion.split("MSIE")[1]) > 8) {
            this.icons = icons;
            _.each(this.models, CanalTP.jQuery.proxy(function(value){
                value.get('mapElement').setOptions({icons: this.icons});
            }), this);
        }
    },

    /**
     * Fonction permettant de reset l'option icons
     */
    resetIcons: function()
    {
        if (parseFloat(navigator.appVersion.split("MSIE")[1]) > 8) {
            _.each(this.models, CanalTP.jQuery.proxy(function(value){
                this.icons = value.previous('icons');
                value.get('mapElement').setOptions({icons: this.icons});
            }), this);
        }
    },

    /**
     * Fonction permettant de récupérer le icons
     */
    getIcons: function()
    {
        return this.icons;
    }
});
