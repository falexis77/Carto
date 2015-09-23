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