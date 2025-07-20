(function() {
    UPDATE_DELAY = 1000;

    function InputRangeFilter(container) {
        this.$container = $(container);
        this.$container.addClass('loaded');

        this.fieldName = this.$container.attr('data-field-name');

        this.$form = this.$container.parents('.faceted-search');
        this.$inputs = this.$container.find('input[type=text]');
        this.$ranges = this.$container.find('.range');

        var eventData = { filter: this };
        this.$ranges.find('.clear-btn').bind('click', eventData, clearBtnClickListener);
        this.$inputs.bind('blur', eventData, inputBlurListener);
        this.$inputs.bind('change', eventData, inputBlurListener);
        this.$inputs.bind('keypress', eventData, inputKeypressListener);

        addFilterSummaryListeners.call(this);
        this.$form.bind('new_results', $.proxy(addFilterSummaryListeners,this));

    }

    function clearBtnClickListener(e) {
        var filter = e.data.filter;
        var $range = $(this).parents('.range');

        var $minInput = $range.find('input[name*=_min_]');
        var $maxInput = $range.find('input[name*=_max_]');

        $minInput.val('').trigger('change');
        $maxInput.val('').trigger('change');

        return false;
    }

    function inputBlurListener(e) {
        var filter = e.data.filter;

        if (filter.updateTimeout) {
            clearTimeout(filter.updateTimeout);
        }

        triggerSearchUpdate.call(filter);
    }

    function inputKeypressListener(e) {
        if (e.keyCode == 13) {
            var filter = e.data.filter;

            if (filter.updateTimeout) {
                clearTimeout(filter.updateTimeout);
            }

            filter.$container.trigger('range_submitted');
            triggerSearchUpdate.call(filter);

            return false;
        }
    }

    function delayedTriggerUpdate() {
        var filter = this;

        if (filter.updateTimeout) {
            clearTimeout(filter.updateTimeout);
        }

        filter.updateTimeout = setTimeout($.proxy(triggerSearchUpdate,filter), UPDATE_DELAY);
    };

    function triggerSearchUpdate() {
        var filter = this;
        filter.$form.trigger('search_update');
    }

    function addFilterSummaryListeners() {
        var eventData = { filter: this };
        $('.clear-filter-'+this.fieldName).bind('click', eventData, filterSummaryClearListener);
    }

    function clearRange(range) {

    }

    function filterSummaryClearListener(e) {
        var filter = e.data.filter;
        var $toggle = $(this);
        var value = $toggle.attr('data-value');

        var parts = value.split('..');

        filter.$ranges.each(function(i, el) {
            var $minInput = $(el).find('input[name*=_min_]');
            var $maxInput = $(el).find('input[name*=_max_]');

            if ($minInput.val() == parts[0] && $maxInput.val() == parts[1]) {
                $toggle.addClass('removing');
                $minInput.val('').trigger('change');
                $maxInput.val('').trigger('change');
            }
        });
    }

    $(window).bind('load', function() {
        $('.inputrangefilter:not(.loaded)').each(function(i, $el) {
            new InputRangeFilter($el);
        });
    });

})();
