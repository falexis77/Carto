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
            if (this.get('isClickable') === true) {
                this.createInfobulle();
            }
            this.createMarkerObject();
        } else {
            console.log('log Erreur: lat will be a number and lon will be a number ');
            return false;
        }
    },

    /**
     * Création du marker openstreetmap
     */
    createMarkerObject: function()
    {
        var point = new OpenLayers.Geometry.Point(this.get('lon'), this.get('lat'));
        if (this.get('transformation') !== 'done') {
            point = this.coordTransformation(point);
        }
        var style;
        var image = this.get('image');
        var isFont = image && image.match(/\.[a-z]{3,4}$/i) === null;

        if (isFont) {
            var css = this.getCssInfos(image);
            style = {
                label: css.content,
                labelSelect: true,
                fontSize: this.get('graphicWidth') + 'px',
                fontFamily: css.fontFamily,
                title: this.get('title'),
                cursor: "pointer"
            };
        } else {
            style = {
                externalGraphic: image,
                graphicWidth: this.get('graphicWidth'),
                graphicXOffset: this.get('graphicXOffset'),
                graphicYOffset: this.get('graphicYOffset'),
                graphicOpacity: this.get('graphicOpacity'),
                graphicZIndex: this.get('zIndex'),
                title: this.get('title'),
                cursor: "pointer"
            };
        }
        var feature = {
            point: point,
            attributes: {
                draggable: this.get('isDraggable'),
                id: this.get('id')
            },
            style: style
        };
        this.set('mapElement', new OpenLayers.Feature.Vector(
            feature.point, feature.attributes, feature.style
        ));
    },

    /**
     * Création du marker openstreetmap
     */
    getCssInfos: function(className)
    {
        var css = {};
        var span = CanalTP.jQuery('<span id="osm_compute_css" class="' + className + '"></span>');
        span.css('display', 'none');
        CanalTP.jQuery('body').append(span);
        var element = CanalTP.jQuery('span#osm_compute_css').get(0);
        if (element) {
            var styles = getComputedStyle(element, ':before');
            css.content = styles.content.replace(/^("|')(.*)("|')$/g, '$2');
            css.fontFamily = styles.fontFamily.replace(/^("|')(.*)("|')$/g, '$2');
            CanalTP.jQuery(element).remove();
        }
        return css;
    }
});
