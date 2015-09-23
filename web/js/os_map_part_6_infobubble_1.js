function InfoBubble(opt_options) {
    this.extend(InfoBubble, OpenLayers.Popup);
    this.additionalContent = new Array();
}
window['InfoBubble'] = InfoBubble;

/**
 * Extends a objects prototype by anothers.
 *
 * @param {Object} obj1 The object to be extended.
 * @param {Object} obj2 The object to extend with.
 * @return {Object} The new extended object.
 * @ignore
 */
InfoBubble.prototype.extend = function(obj1, obj2) {
    return (function(object) {
        for (var property in object.prototype) {
            this.prototype[property] = object.prototype[property];
        }
        return this;
    }).apply(obj1, [obj2]);
};

/**
 * Sets the content of the infobubble.
 *
 * @param {string|Node} content The content to set.
 */
InfoBubble.prototype.setContent = function(content) {
    this.setContentHTML(content);
};
InfoBubble.prototype['setContent'] = InfoBubble.prototype.setContent;


/**
 * Get the content of the infobubble.
 *
 * @return {string|Node} The marker content.
 */
InfoBubble.prototype.getContent = function() {
    return /** @type {Node|string} */ (this.content);
};
InfoBubble.prototype['getContent'] = InfoBubble.prototype.getContent;

/**
 * Sets the additional contents of the infobubble.
 *
 * @param {string} index The key of the additional content
 * @param {string|Node} additionalContent The additional content to set.
 */
InfoBubble.prototype.setAdditionalContent = function(index, additionalContent) {
    this.additionalContent[index] = additionalContent;
};
InfoBubble.prototype['setAdditionalContent'] = InfoBubble.prototype.setAdditionalContent;


/**
 * Get the additional contents of the infobubble.
 *
 * @param {string} index The key of the additional content
 * @return {string|Node} The marker additionalContent.
 */
InfoBubble.prototype.getAdditionalContent = function(index) {
    return /** @type {Node|string} */ (this.additionalContent[index]);
};
InfoBubble.prototype['getAdditionalContent'] = InfoBubble.prototype.getAdditionalContent;

/**
 * Set the min width of the InfoBubble and the min height
 *
 * @param {number} width The min width.
 * @param {number} height The min height.
 */
InfoBubble.prototype.setMinSize = function(width, height) {
    this.minSize = new OpenLayers.Size(width, height);
};
InfoBubble.prototype['setMinSize'] = InfoBubble.prototype.setMinSize;

/**
 * Set the max width of the InfoBubble and the max height
 *
 * @param {number} width The max width.
 * @param {number} height The max height.
 */
InfoBubble.prototype.setMaxSize = function(width, height) {
    this.maxSize = new OpenLayers.Size(width, height);
};
InfoBubble.prototype['setMaxSize'] = InfoBubble.prototype.setMaxSize;

InfoBubble.prototype.setClass = function(iClass) {
    this.displayClass = iClass;
};
InfoBubble.prototype['setClass'] = InfoBubble.prototype.setClass;