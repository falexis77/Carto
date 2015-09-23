var DOMReady = DOMReady || false;
var MapReady = MapReady || false;

CanalTP.jQuery(function () {
    setCtpMapVariables();
    if (DOMReady === false) {
        DOMReady = true;
        if (window.google === undefined) {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "https://maps.googleapis.com/maps/api/js?sensor=false&callback=setMapReady";
            document.body.appendChild(script);
        }
    }
});
