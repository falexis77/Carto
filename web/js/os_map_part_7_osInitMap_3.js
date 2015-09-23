/**
 * Model d'initialisation de la map
 * Author RNE
 * CanalTP - 2013
 * @type @exp;CanalTP.lib.map.models@pro;initMap@call;extend
 */
var ctpInitMap = CanalTP.lib.map.models.initMap.extend({
    // Surcharge des paramètres par défauts avec les paramètres spécifiques gmap
    defaults: _.extend({},{}),

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
        this.set('point', new CanalTP.lib.map.wrapper.LonLat(this.get('centerY'), this.get('centerX')));
        var mapOptions = {
            id: this.cid,
            zoom: this.get('zoom'),
            center: this.get('point')
        };
        this.set('objMap', mapOptions);
        //this.createInfobulle();
    },

    setWrappers: function ()
    {
        CanalTP.lib.map.wrapper.LonLat = OpenLayers.LonLat;
    }
});