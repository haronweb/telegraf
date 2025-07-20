(function() {
    var UPDATE_DELAY = 300;

    function addCommas(nStr) {
        //http://www.mredkj.com/javascript/nfbasic.html
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    var MAP_UTILS = {
        RADIUS_ZOOM: [
            [0.4,       14],
            [0.8,       13],
            [1,         12],
            [3,         11],
            [6,         10],
            [12,         9],
            [24,         8],
            [48,         7],
            [96,         6],
            [192,        5],
            [384,        4],
            [768,        3],
            [1536,       2],
            [3072,       1],
        ],
        METERS_IN_MILE: 1609.34,
        KILOMETERS_IN_MILE: 1.60934,

        isNumber: function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },

        getDistanceFromZoom: function(zoom) {
            for (var i = MAP_UTILS.RADIUS_ZOOM.length-1; i > 0; i--) {
                if (zoom <= MAP_UTILS.RADIUS_ZOOM[i][1]) {
                    return (MAP_UTILS.RADIUS_ZOOM[i][0]+MAP_UTILS.RADIUS_ZOOM[i-1][0])/2;
                }
            }
        },
        getZoomFromDistance: function(d) {
            for (var i = 0; i < MAP_UTILS.RADIUS_ZOOM.length; i++) {
                if (d < MAP_UTILS.RADIUS_ZOOM[i][0]) {
                    break;
                }
            }
            return MAP_UTILS.RADIUS_ZOOM[i][1];
        },

        distanceToRange: function(d, min, max, steps) {
            var r = min + steps - Math.pow(2, Math.log(steps)/Math.log(2) - (d - min)/(steps/(Math.log(steps)/Math.log(2))));
            r = Math.round(r*100)/100;
            return r;
        },
        rangeToDistance: function(r, min, max, steps) {
            var d = (Math.log(steps)/Math.log(2)-Math.log(steps-(r-min))/Math.log(2))*(steps/(Math.log(steps)/Math.log(2))) + min;
            return d;
        },

        getDistanceLabel: function(units, r) {
            switch(units) {
                case 'imperial':
                    //r = Math.round(r);
                    //r = Math.round(r*10)/10;
                    //r = Math.round(r*2)/2;
                    r = r + ' mile'+(r == 1 ? '' : 's');
                    break;
                case 'metric':
                    r = Math.round(r*MAP_UTILS.KILOMETERS_IN_MILE);
                    r = r+'km';
                    break;
            }

            return r;
        },
    };

    function LocationFilter(container) {
        this.$container = $(container);
        this.$container.addClass('loaded');

        this.fieldName = this.$container.attr('data-field-name');

        this.$form = this.$container.parents('.faceted-search');

        this.$latInput          = this.$container.find('input[name=filterdata_'+this.fieldName+'_lat]');
        this.$lngInput          = this.$container.find('input[name=filterdata_'+this.fieldName+'_lng]');
        this.$distanceInput     = this.$container.find('input[name=filterdata_'+this.fieldName+'_distance]');
        this.$rangeInput        = this.$container.find('.range-slider');
        this.$rangeLabel        = this.$container.find('.range-value');
        this.$typeInput         = this.$container.find('input[name=filterdata_'+this.fieldName+'_type]');
        this.$typeToggleBtns    = this.$container.find('.type-toggle .pb-button');
        this.$mapToggle         = this.$container.find('.type-toggle .latlng-toggle');

        this.units   = this.$rangeInput.attr('data-units');
        this.min     = Number(this.$rangeInput.attr('min'));
        this.max     = Number(this.$rangeInput.attr('max'));
        this.steps   = this.max - this.min;

        if (this.$mapToggle.hasClass('target-visible')) {
            ensureMapLoaded(this);
        }

        addListenersToFilter(this);
    }

    LocationFilter.prototype.getDistance = function() {
        return Number(this.$distanceInput.val());
    };

    LocationFilter.prototype.getRange = function() {
        return Number(this.$rangeInput.val());
    };

    LocationFilter.prototype.getType = function() {
        return this.$typeInput.val();
    };

    LocationFilter.prototype.getLat = function() {
        return this.$latInput.val();
    };

    LocationFilter.prototype.getLng = function() {
        return this.$lngInput.val();
    };

    LocationFilter.prototype.setRadiusFromDistance = function(d) {
        var r = MAP_UTILS.distanceToRange(d, this.min, this.max, this.steps);
        this.setRadiusFromRange(r);
    };

    LocationFilter.prototype.setRadiusFromRange = function(r) {
        this.$rangeInput.val(r);
        r = MAP_UTILS.rangeToDistance(r, this.min, this.max, this.steps);

        if (r < this.min) {
            r = this.min;
        }
        else if (r > this.max) {
            r = this.max;
        }

        // round up to nearest half number (e.g. 1, .5, 20.5)
        var distanceValue = r > 5 ? Math.ceil(r) : Math.ceil(r*2)/2;
        this.$distanceInput.val(distanceValue);
        this.$rangeLabel.html(MAP_UTILS.getDistanceLabel(this.units, distanceValue));
        this.saveToCookie();
        this.delayedTriggerUpdate();

        if (typeof this.map !== 'undefined') {
            curZoom = this.map.getZoom();
            for (var i = 0; i < MAP_UTILS.RADIUS_ZOOM.length; i++) {
                if (r < MAP_UTILS.RADIUS_ZOOM[i][0]) {
                    if (curZoom != MAP_UTILS.RADIUS_ZOOM[i][1]) {
                        this.map.setZoom(MAP_UTILS.RADIUS_ZOOM[i][1]);
                    }
                    break;
                }
            }
        }

        // convert to meters
        //r = r*MAP_UTILS.METERS_IN_MILE;
        r = Math.round(r);
        if (typeof this.map !== 'undefined') {
            if (this.map.getSource('circles-filter')) {
                //console.log('radius', r, curZoom);
                this.map.setPaintProperty('circles-filter', 'circle-radius', r);
            }
        }
    };

    LocationFilter.prototype.saveToCookie = function() {
        $container = this.$container;

        var type        = this.getType();
        var lat         = this.getLat();
        var lng         = this.getLng();
        var distance    = $container.find('input[name=filterdata_'+this.fieldName+'_distance]').val();
        var name        = $container.find('input[name=filterdata_'+this.fieldName+'_name]').val();
        var region      = $container.find('input[name=filterdata_'+this.fieldName+'_region]:checked').val();

        if (type && MAP_UTILS.isNumber(lat) && MAP_UTILS.isNumber(lng) && MAP_UTILS.isNumber(distance) && name && MAP_UTILS.isNumber(distance)) {
            parts = [type, lat, lng, distance, name, region];
            if ('pb' in window && 'setCookie' in pb) {
                pb.setCookie('bs_loc',parts.join(','));
            }
        }
    };

    LocationFilter.prototype.delayedTriggerUpdate = function() {
        this.$form.trigger('search_update', ['.locationfilter-'+this.fieldName, UPDATE_DELAY]);
    };


    LocationFilter.prototype.triggerSearchUpdate = function() {
        this.$form.trigger('search_update', ['.locationfilter-'+this.fieldName]);
    };

    function initializeRadiusMap(element, initLat, initLng) {
        mapboxgl.accessToken = 'pk.eyJ1IjoidHJhaWxmb3JrcyIsImEiOiJjancxNjlhcm8waW1sNDltd2IwZnp6anFuIn0.qJ5GkSu0sebR-bgfa6J9xQ';
        var zoom = 6;
        var mapOptions = {
            container: element,
            attributionControl: false,
            maxZoom: 10,
            zoom: zoom,
            center: [initLng, initLat],
            style: {
                'version': 8,
                'sources': {
                    'trailforks-topo': {
                        'type': 'raster',
                        'tiles': [
                            '//gis.pinkbike.org/tiles/osmtf/{z}/{x}/{y}.png'
                        ],
                        'tileSize': 256
                    }
                },
                'layers': [{
                    'id': 'trailforks-topo',
                    'type': 'raster',
                    'source': 'trailforks-topo',
                    'minzoom': 0,
                    'maxzoom': 22
                }]
            }
        };

        mapFilter = new mapboxgl.Map(mapOptions);

        // geo locate control
        mapFilter.addControl(new mapboxgl.NavigationControl(), 'top-right');
        var geoLocate = new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: false
        });
        mapFilter.addControl(geoLocate, 'top-right');

        // red marker
        var startIcon = document.createElement('img');
        startIcon.src = 'https://es.pinkbike.org/246/sprt/i/trailforks/mapicons/trail_diff9.png';
        var marker = new mapboxgl.Marker(startIcon)
            .setLngLat(mapFilter.getCenter())
            .addTo(mapFilter);

        mapFilter.on('load', function() {
            // circle radius
            mapFilter.addSource('circles-filter', {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [mapFilter.getCenter().lng, mapFilter.getCenter().lat]
                        }
                    }]
                }
            });
            mapFilter.addLayer({
                "id": "circles-filter",
                "source": "circles-filter",
                "type": "circle",
                "paint": {
                    "circle-radius": 96,
                    "circle-opacity": 0,
                    "circle-stroke-width": 2,
                    "circle-stroke-color": '#B60000'
                }
            });

            geoLocate.on('geolocate', function(geo) {
                if (geo) {
                    mapCenterChanged();
                    mapFilter.jumpTo({
                        center: [geo.coords.longitude, geo.coords.latitude],
                        zoom: zoom
                    });
                }
            });

            mapFilter.on('zoomend', mapCenterChanged);
            mapFilter.on('moveend', mapCenterChanged);
            mapFilter.on('drag', mapCenterChanged);

            function mapCenterChanged() {
                zoom = mapFilter.getZoom();
                var center = mapFilter.getCenter();
                marker.setLngLat(center);

                if (mapFilter.getSource('circles-filter')) {
                    mapFilter.getSource('circles-filter').setData({
                        "type": "FeatureCollection",
                        "features": [{
                            "type": "Feature",
                            "geometry": {
                                "type": "Point",
                                "coordinates": [center.lng, center.lat]
                            }
                        }]
                    });
                }
            }
        });
        return {map: mapFilter};
    }

    function addListenersToFilter(filter) {
        var eventData = { filter: filter };
        filter.$rangeInput.bind('input change', eventData, rangeChangeListener);
        filter.$distanceInput.bind('change', eventData, distanceChangeListener);
        filter.$typeInput.bind('change', eventData, typeChangeListener);

        var $country    = filter.$container.find('[name=country-locationselect]');
        var $prov       = filter.$container.find('[name=prov-locationselect]');
        var $city       = filter.$container.find('[name=city-locationselect]');
        $country.add($prov).add($city)
            .bind('change', eventData, locationRSBChangeListener);

        // trick pblib.js into thinking jquery is already required (it is)
        if (('pb' in window) && ('require' in pb) && ('required' in pb.require) && pbjs) {
            pb.require.required[pbjs+'jquery.min.js'] = true;
        }

        filter.$typeToggleBtns.bind('click', eventData, typeButtonClickListener);

        filter.$container.find('.region-chooser input[type=radio]')
            .bind('change', eventData, regionRadioChangeListener);

        filter.$form.bind('new_facet_data', eventData, newFacetDataListener);
    }

    function regionRadioChangeListener(e) {
        var filter = e.data.filter;
        filter.saveToCookie();
        filter.triggerSearchUpdate();

        var $radio = $(this);
        var $li = $radio.parents('li');
        var $container = $li.parents('.region-chooser');

        $container.find('.selected').removeClass('selected');

        if ($radio.attr('checked')) {
            $li.addClass('selected');
            $li.find('.facet-count').addClass('selected');
        }
    }

    function typeChangeListener(e) {
        var filter = e.data.filter;
        if (this.value == 'latlng') {
            filter.map.resize();
        }
    }

    function distanceChangeListener(e) {
        var filter = e.data.filter;
        filter.setRadiusFromDistance(filter.getDistance());
    }

    function rangeChangeListener(e) {
        var filter = e.data.filter;
        filter.setRadiusFromRange(filter.getRange());
    }

    function locationRSBChangeListener(e) {
        var filter = e.data.filter;

        var $this = $(this);
        var $container = $this.parents('.locationfilter');

        var country     = $container.find('[name=country-locationselect]').val();
        var prov        = $container.find('[name=prov-locationselect]').val();
        var city        = $container.find('[name=city-locationselect]').val();

        if (country < 1) {
            country = '*';
        }
        if (prov < 1) {
            prov = '*';
        }
        if (city < 1) {
            city = '*';
        }

        var sGeoString = country+'-'+prov+'-'+city;
        $container.find('input[name=filterdata_'+filter.fieldName+'_name]').val(sGeoString);
        filter.saveToCookie();
        filter.triggerSearchUpdate();
    }

    function typeButtonClickListener(e) {
        var filter = e.data.filter;

        var $btn                = $(this);
        var $btnGroup           = $btn.parents('.type-toggle');
        var $container          = $btn.parents('.locationfilter');

        if ($btn.hasClass('name-toggle')) {
            var type = 'name';
        } else if ($btn.hasClass('region-toggle')) {
            var type = 'region';
        } else if ($btn.hasClass('latlng-toggle')) {
            var type = 'latlng';

            ensureMapLoaded(filter);

            // cache map location
            var center = filter.map.getCenter();
        }

        if ($container.hasClass('show-'+type)) {
            // already selected, don't do anythign
            return;
        }

        $btnGroup.find('.pb-button').removeClass('target-visible');
        $btn.addClass('target-visible');

        $container
            .removeClass('show-region show-name show-latlng')
            .addClass('show-'+type);

        $container.find('#locationtype').val(type);

        filter.$typeInput[0].value = type;
        filter.$typeInput.trigger('change');

        if (type == 'latlng') {
            // make sure map has correct location
            if (filter.nameLatLng) {
                filter.map.setCenter(filter.nameLatLng[0]);
                filter.setRadiusFromDistance(filter.nameLatLng[1]);
            }
            else {
                filter.map.setCenter(center);
            }
            filter.nameLatLng = null;
        }

        filter.saveToCookie();
        filter.triggerSearchUpdate();
    }

    function ensureMapLoaded(filter) {
        if (filter.mapLoaded) {
            // already loaded
            return;
        }

        var mapElement = filter.$container.find('.latlng-chooser-map')[0];
        var mapLat = filter.$latInput.val();
        var mapLng = filter.$lngInput.val();
        var mapObjects = initializeRadiusMap(mapElement, mapLat, mapLng);

        filter.map = mapObjects.map;
        filter.setRadiusFromDistance(filter.getDistance());
        filter.mapLoaded = true;

        filter.map.on('zoomend', $.proxy(mapZoomedListener, filter));
        filter.map.on('moveend', $.proxy(mapLocationChangedListener, filter));

        if (typeof mapGlobal !== 'undefined') {
            mapGlobal = filter.map;
        }
    }

    function mapZoomedListener() {
        var filter = this;

        var newZoom = filter.map.getZoom();
        var currentZoom = MAP_UTILS.getZoomFromDistance(filter.getDistance());

        if (newZoom != currentZoom) {
            var d = MAP_UTILS.getDistanceFromZoom(newZoom);
            filter.setRadiusFromDistance(d);
        }
    }

    function mapLocationChangedListener() {
        var filter = this;
        var c = filter.map.getCenter();

        filter.$latInput.val(Math.round(Number(c.lat)*10000)/10000);
        filter.$lngInput.val(Math.round(Number(c.lng)*10000)/10000);
        filter.saveToCookie();
        filter.delayedTriggerUpdate();
    }

    function newFacetDataListener(e, data) {
        var filter = e.data.filter;

        if (filter.fieldName in data.aFacetData) {
            switch(filter.getType()) {
                case 'region':
                    filter.$container.find('.region-chooser input[type=radio]').each(function(i, el) {
                        $el = $(el);
                        var value = $el.val();
                        var count = data.aFacetData[filter.fieldName][value] || 0;

                        var $li = $el.parents('li');
                        var countField = $li.find('.facet-count');

                        countField.html(addCommas(count));
                    });
                    break;
                //case 'latlng':
                //    filter.$container.find('.latlng-chooser .facet-count').html(addCommas(data.iCount));
                //    break;
            }
        }
    }

    $(window).bind('load', function() {
        $('.locationfilter:not(.loaded)').each(function(i, el) {
            new LocationFilter(el);
        });
    });
})();
