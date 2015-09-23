var DOMReady = DOMReady || false;
var MapReady = MapReady || false;

initializeOsm();

CanalTP.jQuery(window).load(function () {
    setCtpMapVariables();
    if (DOMReady === false) {
        DOMReady = true;
        if (window.OpenLayers !== undefined) {
            setMapReady();
        }
    }
});

function initializeOsm() {
   if (window.OpenLayers !== undefined) {
        OpenLayers._getScriptLocation = function() {
            return CanalTP.img_path;
        };
        OpenLayers.ImgPath = CanalTP.img_path +'img/';
        // Cette instruction permet de corriger un bug irrégulier dans OpenLayers.
        // Parfois, certaine tuiles ne sont pas chargées
        OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
        // Par défaut, les images qui ne sont pas disponibles sont en rose.
        // Mise des dalles en trasnparent
        OpenLayers.Util.onImageLoadErrorColor = "transparent";
    }
}
