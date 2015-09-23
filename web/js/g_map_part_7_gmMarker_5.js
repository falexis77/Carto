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
