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
