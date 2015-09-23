/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
CanalTP.lib.map.collections = Backbone.Collection.extend({
    visibility: {
        value: 'true',
        except: []
    },
    map: null,
    view: ctpMap,
    issuer: '',

    setVisibility: function(visibility, except)
    {
        _.each(this.models, function(value){
            if (!_.contains(except, value.get('step'))) {
                value.set('isVisible', visibility);
            } else {
                value.set('isVisible', !visibility);
            }
        });
        var type = s = this.collectionType.substring(0, this.collectionType.length - 1);
        this.view.prototype.manageDisplayMapObject(this, type);
    },

    setMapView: function(map)
    {
        this.map = map;
    },

    getMapView: function()
    {
        return this.map;
    },

    /**
     * Function to return the excluded points
     * coords(0,0) and coord(-3.404561, 27.40972)
     * The last is coords (0,0) in Lambert II
     */
    getExcludedPoint: function()
    {
        this.excludedPoints = [
            { point: new CanalTP.lib.map.wrapper.latLon(0, 0) },
            { point: new CanalTP.lib.map.wrapper.latLon(30.129281, 2.038886) }
        ];
        return this.excludedPoints;
    },

    /**
     * Function to remove the excluded point from the collection
     */
    removeExcludedPoint: function()
    {
        this.getExcludedPoint();
        _.each(this.excludedPoints, function(excluded) {
            _.each(this.models, function(model, modelKey) {
                if (this.collectionType === 'polylines') {
                    this.managePolylinePath(model, modelKey, excluded.point);
                } else {
                    if(_.isEqual(excluded.point, model.get('point'))) {
                        this.remove(model);
                    }
                }
            }, this);
       }, this);
    },

    /**
     * Function to remove polyline paths
     * the goal is to link point when a delete is done.
     * If the deleted point is the last of the path array, we replace this point with the first
     * of the next model (if exist)
     * If the deleted point is the first of the path array, we replace this point with the last
     * of the previous model
     * else this point is deleted from the array
     * @param {object} model
     * @param {object} modelKey
     * @param {object} excludedPoint
     */
    managePolylinePath: function(model, modelKey, excludedPoint)
    {
        _.each(model.get('latLngsPath'), function(point, key) {
            if(_.isEqual(excludedPoint, point)) {
                if (point === _.last(model.get('latLngsPath'))) {
                    if (typeof(this.models[modelKey + 1]) !== 'undefined') {
                        model.get('latLngsPath')[key] = _.first(
                            this.models[modelKey + 1].get('latLngsPath')
                        );
                    } else {
                        model.get('latLngsPath').splice(key, 1);
                    }
                } else if (point === _.first(model.get('latLngsPath'))){
                    if (typeof(this.models[modelKey - 1]) !== 'undefined') {
                        model.get('latLngsPath')[key] = _.last(
                            this.models[modelKey - 1].get('latLngsPath')
                        );
                    } else {
                        model.get('latLngsPath').splice(key, 1);
                    }
                } else {
                    model.get('latLngsPath').splice(key, 1);
                }
            }
        }, this);
        return model;
    }
});
