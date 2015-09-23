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
                value.point = new OpenLayers.Geometry.Point(value.lon, value.lat);
                latLngs.push(value.point);
            });
            this.set('latLngsPath', latLngs);
            this.setPolylineColor();
            this.createPolylineObject();
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
        var feature = {
            point : this.coordTransformation(
                new OpenLayers.Geometry.LineString(this.get('latLngsPath'))),
            attributes : {
                icon : new OpenLayers.Icon(this.get('icons')),
                clickable: this.get('isClickable'),
                editable: this.get('isEditable'),
                draggable: this.get('isDraggable')
            },
            style : {
                strokeColor: this.get('color'),
                strokeOpacity: this.get('opacity'),
                strokeWidth: this.get('weight'),
                graphicZIndex: this.get('zIndex')
            }
        };
        this.set('mapElement', new OpenLayers.Feature.Vector(
            feature.point, feature.attributes, feature.style
        ));
    }
});