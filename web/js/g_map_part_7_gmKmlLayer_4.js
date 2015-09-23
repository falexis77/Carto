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
