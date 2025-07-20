(function() {
    // this should not be zero
    var MIN_DELAY = 50;

    function possibleSearchUpdate(e, triggeringSelector, delay) {
        var $form = $(this);
        var serializedForm = $form.serialize();

        if (typeof delay != 'number') {
            delay = 0;
        }
        delay = Math.max(delay, MIN_DELAY);

        if (!$form.data('oldForm')) {
            $form.data('oldForm', serializedForm);
        }
        else if (serializedForm != $form.data('oldForm')) {
            $form.data('oldForm', serializedForm);
            doSearchUpdate($form, triggeringSelector, delay);
        }
        else if (delay == MIN_DELAY && $form.data('updateTimeout')) {
            doSearchUpdate($form, triggeringSelector, delay);
        }
    }

    function doSearchUpdate($form, triggeringSelector, delay) {
        // don't fetch new results immediately, wait a certain amount in case
        // other changes happen.  If we are already waiting, then reset our
        // timeout. Basically, wait for the user to stop changing things
        if ($form.data('updateTimeout')) {
            clearTimeout($form.data('updateTimeout'));
        }

        $form.trigger('loading_new_data');
        setCountProgressIndicator($form, true, triggeringSelector);
        setResultsProgressIndicator($form, true);

        if (delay > 0) {
            $form.data('updateTimeout', setTimeout($.proxy(searchUpdateTimeout,$form), delay));
        }
        else {
            searchUpdateTimeout.call($form);
        }
    }

    function searchUpdateTimeout() {
        // fresh state
        this.data('updateTimeout', null);

        fetchFacetData(this);
    }

    function fetchFacetData($form) {
        var data = $form.serializeArray();
        pb.rmsSend({ mod:'buysell', op:'facet-counts', data: data }, function(response) {
            // don't bother loading results in via ajax if they don't support pushState
            if ($.pbCheckIfLoadFromWorks()) {
                $form.trigger('new_facet_data', [response.rmsM]);
                setCountProgressIndicator($form, false);
                fetchSearchResults($form, '?'+response.rmsM.queryString);

                response.rmsM.formfiltersdynamic.forEach(function(filterName) { 
                    if (response.rmsM.formfiltersvisible.includes(filterName)) {
                        document.querySelector('[data-field-name='+filterName+']').style.display = 'block';
                    } else {
                        document.querySelector('[data-field-name='+filterName+']').style.display = 'none';
                    }
                });


            }
            else {
                window.location = '?'+response.rmsM.queryString;
            }
        });
    }

    function fetchSearchResults($form, url) {
        var targetSelector = $form.attr('data-results-target');
        if (targetSelector) {
            $(targetSelector).pbLoadFrom(url, {changeURL: true, replaceHistory: true}, function() {
                setResultsProgressIndicator($form, false);
                $form.trigger('new_results');
            });
        }
    }

    function setResultsProgressIndicator($form, on) {
        var targetSelector = $form.attr('data-results-target');
        if (targetSelector) {
            var fn = on ? 'addClass' : 'removeClass';
            if (on) {
                $(targetSelector).removeClass('filter-search-has-results').addClass('filter-search-loading-results');
            }
            else {
                $(targetSelector).addClass('filter-search-has-results').removeClass('filter-search-loading-results');
            }
        }
    }

    function setCountProgressIndicator($form, on, ignoreSelector) {
        var fn = on ? 'addClass' : 'removeClass';

        var countElements = $form.find('.facet-count');

        if (ignoreSelector) {
            countElements = countElements.not(ignoreSelector+' .facet-count');
        }

        countElements[fn]('pb-loading');
    }

    function initializeFacetFilter(i, el) {
        var $form = $(el);
        $form.bind('search_update', possibleSearchUpdate);

        // trigger an update, because the first time it doesn't do anything but
        // store the current state of the form
        $form.trigger('search_update');
    }

    $(document).ready(function() {
        $('.faceted-search').each(initializeFacetFilter);
    });
})();
