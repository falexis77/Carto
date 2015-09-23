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
        var feature = {
            point : new OpenLayers.Geometry.Polygon.createRegularPolygon(
                new OpenLayers.Geometry.Point(this.get('center').lon, this.get('center').lat),
                this.get('radius') * 2,
                50,
                0
            ),
            attributes : {
                clickable: this.get('isClickable'),
                editable: this.get('isEditable'),
                draggable: this.get('isDraggable')
            },
            style : {
                fillColor: this.get('fillColor'),
                fillOpacity: this.get('fillOpacity'),
                strokeColor: this.get('strokeColor'),
                strokeOpacity: this.get('opacity'),
                strokeWidth: this.get('weight'),
                zIndex: this.get('zIndex')
            }
        };
        feature.point.transformation = 'done';
        this.set('mapElement', new OpenLayers.Feature.Vector(
            feature.point, feature.attributes, feature.style
        ));
    }
});