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


