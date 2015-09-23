/**
 * Model de polyline
 * Author RNE
 * CanalTP - 2013
 * @type @exp;CanalTP.lib.map.models@pro;polyline@call;extend
 */
var ctpControl = Backbone.Model.extend({

    // Set CSS styles for the DIV containing the control
    // Setting padding to 5 px will offset the control
    // from the edge of the map.
    parameters: {
        controlDiv: null,
        controlPosition: 'RIGHT_BOTTOM',
        eventName: 'center',
        eventCenter: null,
        map: null,
        divStyle: {},
        divOptions: {},
        uIStyle: {
            padding: '4px',
            backgroundColor: '#007e8e',
            borderStyle: 'solid',
            cursor: 'pointer',
            textAlign: 'center'
        },
        uIOptions: {
            title: 'Click to set the map to Home'
        },
        textStyle: {
            fontFamily: 'Arial,sans-serif',
            fontSize: '12px',
            paddingLeft: '4px',
            paddingRight: '4px'
        },
        textOptions: {
            innerHTML: '<strong>Home</strong>'
        },
        control: null
    },
    /**
     * Fonction permettant l'initialisation
     * @param {object} options
     */
    initialize: function(options)
    {
        CanalTP.lib.map.wrapper.addDomListener = google.maps.event.addDomListener;
        CanalTP.lib.map.wrapper.trigger = google.maps.event.trigger;
        CanalTP.lib.map.wrapper.ControlPosition = google.maps.ControlPosition;
        this.parameters = _.extend({}, this.parameters, options);
        this.parameters.divStyle = _.extend({}, this.parameters.divStyle, options.divStyle);
        this.parameters.divOptions = _.extend({}, this.parameters.divOptions, options.divOptions);
        this.parameters.uIStyle = _.extend({}, this.parameters.uIStyle, options.uIStyle);
        this.parameters.uIOptions = _.extend({}, this.parameters.uIOptions, options.uIOptions);
        this.parameters.textStyle = _.extend({}, this.parameters.textStyle, options.textStyle);
        this.parameters.textOptions = _.extend({}, this.parameters.textOptions, options.textOptions);
        this.createCustomControl();
        this.controlEvent();
        this.addControlPosition();
    },
    /**
     * Function to create the control
     */
    createCustomControl: function()
    {
        var controlUI = document.createElement('div');
        var controlText = document.createElement('div');
        if (this.parameters.controlDiv === null) {
            this.parameters.controlDiv = document.createElement('div');
        }
        this.addCustomOptions(this.parameters.controlDiv, 'div');
        this.addCustomOptions(controlUI, 'uI');
        this.addCustomOptions(controlText, 'text');
        this.parameters.controlDiv.appendChild(controlUI);
        controlUI.appendChild(controlText);
        this.parameters.control = controlUI;
    },

    /**
     * Function to add the options (style and other)
     * @param {object} element html element
     * @param {object} type type of parameters
     */
    addCustomOptions: function(element, type)
    {
        _.each(this.parameters[type+'Style'], function(value, key){
            element.style[key] = value;
        }, this);
        _.each(this.parameters[type+'Options'], function(value, key){
            element[key] = value;
        }, this);
        return element;
    },

    /**
     * Function to get the control
     */
    getControl: function()
    {
        return this.parameters.control;
    },

    /**
     * Function to add event
     * The default event is to recenter the map
     * Trigger for custom event
     */
    controlEvent: function()
    {
        if (this.parameters.eventName !== 'center'){
            CanalTP.lib.map.wrapper.trigger(
                this.parameters.control, this.parameters.triggerCustomControl, this
            );
        } else {
            this.recenterEvent();
        }
    },

    // Setup the click event listeners: simply set the map to homeCenter.
    recenterEvent: function()
    {
        CanalTP.lib.map.wrapper.addDomListener(this.parameters.control, 'click',
            CanalTP.jQuery.proxy(function() {
                this.parameters.map.setCenter(this.parameters.eventCenter);
            }, this)
        );
    },

    /**
     * Function to add the control button on the map
     */
    addControlPosition: function()
    {
        this.parameters.control.index = 10;
        this.parameters.map.controls[
            CanalTP.lib.map.wrapper.ControlPosition[this.parameters.controlPosition]
        ].push(this.parameters.control);
    }
});