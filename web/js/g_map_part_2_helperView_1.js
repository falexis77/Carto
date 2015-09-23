/**
 * Library Carto
 * View with function in order to help use
 * @type @exp;Backbone@pro;View@call;extend
 */
var ctpHelperView = Backbone.View.extend({

    /**
     * Function to create the div map
     * @param {object} attrs object div's css attributes
     * @param {object} styles object div's css styles
     * @param {object} parentSelector
     * @returns {unresolved}
     */
    createMapDiv: function(attrs, styles, parentSelector)
    {
        var mapDiv = CanalTP.jQuery(document.createElement("div"));
        if (typeof attrs !== 'undefined' || attrs !== null) {
            for (var attr in attrs) {
                mapDiv = mapDiv.attr(attr, attrs[attr]);
            }
        }
        if (typeof styles !== 'undefined' || styles !== null) {
            var allStyle = '';
            for (var style in styles) {
                allStyle = allStyle + style +":"+ styles[style] + ";";
            }
            mapDiv = mapDiv.attr('style', allStyle);
        }
        if (parentSelector !== 'undefined') {
            CanalTP.jQuery(parentSelector).append(mapDiv);
        }
        return mapDiv;
    },

    /**
     * Function to create map link
     * @param {Object} attrs link's css attributes
     * @param {String} html link's html text
     * @param {String} parentSelector the selector of the parent
     */
    createMapLink: function(attrs, html, parentSelector)
    {
        var aLink = CanalTP.jQuery(document.createElement("a"));
        if (typeof attrs !== 'undefined') {
            for (var attr in attrs) {
                aLink = aLink.attr(attr, attrs[attr]);
            }
        }
        if (typeof html !== 'undefined' && typeof(html) === 'string') {
            aLink = aLink.html(html);
        }
        if (parentSelector !== 'undefined') {
            CanalTP.jQuery(parentSelector).append(aLink);
        }
        return aLink;
    },

    executeFntoElement: function(elementId, fn, type)
    {
        type = (type === 'class') ? '.' : '#';
        CanalTP.jQuery(type+elementId)[fn]();
    },

    addCssToElement: function(element, css)
    {
        CanalTP.jQuery(element).css(css);
    },

    addStyleToElement: function(element, styles)
    {
        CanalTP.jQuery(element).attr('style', styles);
    },

    /**
     * Function to automatically calculate the width based on the map div
     * If width is not defined it is in 'auto' mode
     * @param {String} blockId
     * @param {number} width
     * @returns {undefined}
     */
    manageWidth: function(blockId, width)
    {
       if(width === undefined || width === 'auto'){
           var id = CanalTP.jQuery('#'+blockId).attr('id');
           width = document.getElementById(id).offsetWidth;
       }
       return width;
    },

    /**
     * Function to add a control to recenter the map when dragged
     */
    addControlRecenter: function(map, center, options)
    {
        var controls = {
            map: map,
            eventCenter: center,
            textOptions: {innerHTML: '<img src="'+options.image+'"/>'},
            uIStyle: {backgroundColor: options.background},
            uIOptions: {title: options.title}
        };
        return new ctpControls([
            new ctpControl(controls)
        ]);
    },

    /**
     * Function to create the map's collection
     * @param {object} createOpts options in configuration
     * @param {Object} opts Additional map's options
     * @returns {ctpInitMaps}
     */
    createMapCollection: function(createOpts, opts)
    {
        if (opts !== undefined) {
            createOpts = CanalTP.jQuery.extend({}, createOpts, opts);
        }
        return new ctpInitMaps([new ctpInitMap(createOpts)]);
    },

    /**
     * Function to enable the AutoZoom
     * @param {String} id map id
     * @param {Object} options
     * @returns {Boolean}
     */
    autoZoomActive: function(id, options)
    {
       if(options !== undefined){
           var zoomOpts = options.split(':');
           var isActive = (zoomOpts[1] === 'true') ? true : false;
           CanalTP.lib.map.config[id][zoomOpts[0]].autoZoom = isActive;
       }
       return true;
    },

    /**
     * Function to set the geocoding
     * The list of types is available here:
     * https://developers.google.com/maps/documentation/geocoding/#Types
     * @param {Boolean} active boolean to activate or desactivate geocodage
     * @param {Object} scenario way to display informations
     */
    activateGeocode: function(active, scenario)
    {
        if (active === true) {
            CanalTP.lib.map.config.geocode = {
                "alwaysActive": true,
                "addPopin": true,
                "scenario": scenario
            };
        }
    },

    /**
     * Function to customize tooltips geocodage
     * The goal is to add address of geocodage in a popup already create
     * @param {object} map
     * @param {string} url url to get the popup's template
     */
    getAddressInPopup: function(map, url)
    {
        var that = this ;
        CanalTP.lib.map.wrapper.addListener(map, 'customGeoInfobulle', function(iOptions){
            var id = CanalTP.lib.map.wrapper.getLon(iOptions.point, 'reverse') + ';'
                    + CanalTP.lib.map.wrapper.getLat(iOptions.point, 'reverse');
            CanalTP.jQuery.ajax({
                url: url,
                type: 'POST',
                data: {'point_type':'address', 'name': iOptions.iContent, 'id': id},
                async: false
            }).done(function(result) {
                that.searchEvent(iOptions.iContent,map);
                iOptions.iContent = result;

            });
        });
    },

    /**
     * Function Hide google map
     * @param {string} element to manage
     * @param {string} el_display element to display
     * @param {string} el_css element to add css
     * @param {string} el_fade element to fade
     */
    eventClicklink: function(element, el_display, el_css, el_fade)
    {
        var that = this;
        CanalTP.jQuery(element).on('click', function(e) {
            e.preventDefault();
            var status = CanalTP.jQuery(element).data('status');
            if ("hide" === status) {
                CanalTP.jQuery(element).text(CanalTP.jQuery(element).data('hide'))
                    .data('status', 'show');
                that.visibilityMap(el_display, el_css, el_fade,'hidden');
            } else {
                CanalTP.jQuery(element).text(CanalTP.jQuery(element).data('show'))
                    .data('status', 'hide');
                that.visibilityMap(el_display, el_css, el_fade, 'visible');
            }
        });
    },

    /**
     * Function to show or hide map
     * @param {string} el_display element to display
     * @param {string} el_css element to add css
     * @param {string} el_fade element to fade
     * @param {string] visibility 'visible' or 'hidden'
     */
    visibilityMap: function(el_display, el_css, el_fade, visibility)
    {
        var height;
        var fade;
        var display;
        if (visibility === 'visible') {
            height = '100%';
            fade = 'fadeOut';
            display = 'show';
        } else {
            height = 0;
            fade = 'fadeIn';
            display = 'hide';
        }
        CanalTP.jQuery(el_display)[display]();
        CanalTP.jQuery(el_css).css({
            'visibility': visibility,
            'height': height
        });
        if (fade !== null) {
            CanalTP.jQuery(el_fade)[fade]('fast');
        }
    },


    /**
     * Function to add an event to the geocoding tooltip
     * @param {String} address
     * @returns {undefined}
     */
    searchEvent: function(address,map)
    {
        var that = this;
        CanalTP.lib.map.wrapper.addListener(map,
            'infobubbleEvent',
            CanalTP.jQuery.proxy(function(infoBubble){
                CanalTP.jQuery(infoBubble.content_).on(
                    'click','.ctp-journey-links',{view: that},
                    function(e) {
                        e.preventDefault();
                        var fieldType = CanalTP.jQuery(this).attr('data-type');
                        e.data.view.fillSearchForm(fieldType, address, infoBubble.position);
                    }
                );
                CanalTP.lib.map.wrapper.clearListeners(
                     map,
                    'infobubbleEvent'
                );
            }, this)
        );
    },

    /**
     * Function to fill in the search form
     * @param {String} fieldType field's type (from , to)
     * @param {String} address description of the location (adress)
     * @param {Object} position position of the location (point coordinates)
     * @returns {undefined}
     */
    fillSearchForm: function(fieldType, address, position)
    {
        var coordLon = CanalTP.lib.map.wrapper.getLon(position, 'reverse');
        var coordLat = CanalTP.lib.map.wrapper.getLat(position, 'reverse');
        var coord = coordLon + ';' + coordLat;

        CanalTP.jQuery('#search_' + fieldType + '_autocomplete').val(address);
        CanalTP.jQuery('#search_' + fieldType + '_autocomplete-hidden').val(coord);
        CanalTP.jQuery('#search_' + fieldType + '_autocomplete-hidden').data(
                'coord',
                {"lat": coordLat, "lon": coordLon}
        );
        CanalTP.jQuery('#search_' + fieldType + '_autocomplete-hidden').trigger('AutoCompleteCoord');
        var tab_to_show = "li a[href='#ctp-journey']";
        CanalTP.jQuery(tab_to_show).click();
    }
});
