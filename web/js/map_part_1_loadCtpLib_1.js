function setMapReady() {
    if (MapReady === false) {
        MapReady = true;
        triggerEvent();
    }
}

function triggerEvent() {
    if (DOMReady && MapReady) {
        CanalTP.jQuery(document).trigger('GmapReady');
    }
}

function setCtpMapVariables() {
    window.CanalTP = window.CanalTP || {};
    CanalTP.lib = CanalTP.lib || {};
    CanalTP.lib.map = CanalTP.lib.map || {};
    CanalTP.lib.map.config = CanalTP.lib.map.config || {};
    CanalTP.lib.map.config.ign = CanalTP.lib.map.config.ign || {};
    if (typeof(ign_key) !== 'undefined') {
        CanalTP.lib.map.config.ign.key = ign_key;
    }
    if (typeof(ign_url) !== 'undefined') {
        CanalTP.lib.map.config.ign.url = ign_url;
    }
    CanalTP.lib.map.config.geocode = CanalTP.lib.map.config.geocode || {};
    CanalTP.lib.map.config.infobubble = CanalTP.lib.map.config.infobubble || {};
    CanalTP.lib.map.config.debug = CanalTP.lib.map.config.debug || {};
    CanalTP.lib.map.config.switcher = CanalTP.lib.map.config.switcher || {};
    if (typeof(reverse_location) !== 'undefined') {
        CanalTP.lib.map.config.reverse_location = reverse_location;
    }
}
