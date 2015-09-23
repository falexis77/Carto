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