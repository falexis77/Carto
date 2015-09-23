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