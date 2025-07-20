(function() {
    var ALL = 'all';
    var SOME = 'some';
    var NONE = 'none';

    var CHECK_CLASS_NAMES_TIME = 0;
    var CHECK_ALIASES_CHECKED_TIMEOUT = 0;

    function CheckboxFilter(container) {
        this.$container = $(container);
        this.$container.addClass('loaded');

        this.fieldName = this.$container.attr('data-field-name');

        this.$form = this.$container.parents('.faceted-search');
        this.$checkboxes = this.$container.find('input[type=checkbox]');
        this.$aliases = this.$container.find('input[data-alias-for]');

        var eventData = { filter: this };
        this.$form.bind('new_facet_data', eventData, form_newFacetData_listener);
        this.$form.bind('new_results', eventData, form_newResults_listener);
        this.$checkboxes.bind('change', eventData, checkbox_change_listener);
        this.$aliases.bind('change', eventData, alias_change_listener);

        addFilterSummaryListeners.call(this);

        if (this.$container.hasClass('use-view-all-btn')) {
            addViewAllBtnListeners.call(this);
        }

        this.$container.find('.show-more-btn').bind('click', eventData, showMoreBtn_click_Listener);

        checkAliasesChecked.call(this);
        checkClassNames.call(this);
    }

    function addViewAllBtnListeners() {
        var filter = this;

        var $btn = filter.$container.find('.view-all-btn');

        var eventData = { filter: this };
        $btn.bind('click', eventData, viewAllBtn_click_listener);

        filter.$container.on('pbZoomOpened', function() {
            $btn.addClass('selected');
        });
        filter.$container.on('pbZoomClosed', function() {
            // reset recent stuff, when toggling the popup.
            filter.$container.find('.has-recent').removeClass('has-recent');
            filter.$container.find('.recent').removeClass('recent');

            $btn.removeClass('selected');
        });
    }

    function showMoreBtn_click_Listener(e) {
        var filter = e.data.filter;
        filter.$container.toggleClass('only-show-always-show');
        $(this).toggleClass('target-visible');

        return false;
    }

    function addFilterSummaryListeners() {
        var eventData = { filter: this };
        $('.clear-filter-'+this.fieldName).bind('click', eventData, filterSummaryClearListener);
    }

    function filterSummaryClearListener(e) {
        var filter = e.data.filter;
        var $toggle = $(this);
        var value = $toggle.attr('data-value');
        value = JSON.parse(value);

        var $checkbox;
        if (value instanceof Array) {
            // cache current recent
            var recent = filter.$container.find('.recent');

            // toggle all the applicable checkboxes
            for (var i = 0; i < value.length; i++) {
                $checkbox = filter.$checkboxes.filter('[data-value='+value[i]+']');
                $checkbox.removeAttr('checked');
                $checkbox.trigger('change');
            }

            // reset recent classes
            filter.$container.find('.recent').removeClass('recent');
            recent.addClass('recent');

            // make sure classNames are in sync
            checkAliasesChecked.call(filter);
            checkClassNames.call(filter);
        }
        else {
            $checkbox = filter.$checkboxes.filter('[data-value='+value+']');
            $checkbox.removeAttr('checked');
            $checkbox.trigger('change');
        }


        $toggle.addClass('removing');
    }

    function checkbox_change_listener(e) {
        var filter = e.data.filter;
        var $checkbox = $(this);

        updateCheckboxStyling(filter, $checkbox);
    }

    function alias_change_listener(e) {
        var filter = e.data.filter;
        var $checkbox = $(this);

        var aliasedIDs = $checkbox.attr('data-alias-for');

        var checkedStatus = checkCheckedStatusForCheckboxIDs(filter, aliasedIDs);

        var $group = $checkbox.parents('.group');
        var $aliasedCheckboxes = $(aliasedIDs);
        switch(checkedStatus) {
            case ALL:
                // uncheck them

                // all of them were checked, so uncheck all of them
                $aliasedCheckboxes.removeAttr('checked').trigger('change');
                $checkbox.removeAttr('checked');

                if (filter.$container.hasClass('hide-selected-groups')) {
                    $group.find('li').removeClass('recent');
                }
                break;
            case SOME:
                // uncheck some of them
                // some of them were checked, so uncheck all of them
                $aliasedCheckboxes.filter(':checked').removeAttr('checked').trigger('change');
                $checkbox.removeAttr('checked');
                $checkbox[0].indeterminate = false;
                break;
            case NONE:
                // check them

                // none were checked, so check all of them
                $aliasedCheckboxes.attr('checked', 'checked').trigger('change');
                $checkbox.attr('checked', 'checked');

                if (filter.$container.hasClass('hide-selected-groups')) {
                    $group.find('li').removeClass('recent');
                }
                break;
        }

        checkClassNames.call(filter);
    }

    function checkCheckedStatusForCheckboxIDs(filter, ids) {
        var areAllChecked = true;
        var areNoneChecked = true;

        ids = ids.split(',');

        for (var i = 0; i < ids.length; i++) {
            var $aliasedCheckbox = filter.$container.find(ids[i]);

            var isChecked = $aliasedCheckbox.attr('checked');
            areAllChecked = areAllChecked && isChecked;
            areNoneChecked = areNoneChecked && !isChecked;
        }

        if (areAllChecked) {
            return ALL;
        }
        else if (areNoneChecked) {
            return NONE;
        }
        else {
            return SOME;
        }
    }

    function updateCheckboxStyling(filter, $checkbox) {
        filter.$form.trigger('search_update', ['.checkboxfilter-'+filter.fieldName]);

        var $li = $checkbox.parents('li');

        $li.addClass('recent');

        if ($checkbox.attr('checked')) {
            $li.addClass('selected');
            $li.find('.facet-count').addClass('selected');
        }
        else {
            $li.removeClass('selected');
            $li.find('.facet-count').removeClass('selected');
        }

        triggerCheckAliasesChecked(filter);
        triggerCheckClassNames(filter);
    }

    function triggerCheckAliasesChecked(filter) {
        clearTimeout(filter.checkAliasesCheckedTimeout);
        filter.checkAliasesCheckedTimeout = setTimeout($.proxy(checkAliasesChecked, filter), CHECK_ALIASES_CHECKED_TIMEOUT);
    }

    function checkAliasesChecked() {
        var filter = this;
        clearTimeout(filter.checkAliasesCheckedTimeout);

        filter.$aliases.each(function(elIndex, el) {
            $checkbox = $(el);
            var checkedStatus = checkCheckedStatusForCheckboxIDs(filter, $checkbox.attr('data-alias-for'));

            switch(checkedStatus) {
                case ALL:
                    $checkbox.attr('checked', 'checked');
                    $checkbox[0].indeterminate = false;
                    break;
                case SOME:
                    $checkbox.removeAttr('checked');
                    $checkbox[0].indeterminate = true;
                    break;
                case NONE:
                    $checkbox.removeAttr('checked');
                    $checkbox[0].indeterminate = false;
                    break;
            }
        });
    }

    function triggerCheckClassNames(filter) {
        clearTimeout(filter.checkClassNamesTimeout);
        filter.checkClassNamesTimeout = setTimeout($.proxy(checkClassNames, filter), CHECK_CLASS_NAMES_TIME);
    }

    function checkClassNames() {
        var filter = this;
        clearTimeout(filter.checkClassNamesTimeout);
        // find all the checked items
        var $checked = filter.$container.find('li.selected');
        var $recent = filter.$container.find('li.recent');

        var $groups = filter.$container.find('.group');

        $groups.removeClass('alias-selected');
        $groups.find('.group-alias .facet-count').removeClass('selected');
        var $aliasCheckedGroups = $groups.find('input[data-alias-for]').filter(':checked').parents('.group');
        if ($aliasCheckedGroups.length > 0) {
            $aliasCheckedGroups.find('.group-alias .facet-count').addClass('selected');
            $aliasCheckedGroups.addClass('alias-selected');
        }

        // remove all 'has-selected', 'has-recent' classes
        $groups.removeClass('has-selected').removeClass('has-recent');
        // find the groups that have checked items
        $checked.parents('.filter-items .group').addClass('has-selected');
        $recent.parents('.filter-items .group').addClass('has-recent');

        /*
        // reset all groups to have 'no-results' class
        var $results = filter.$container.find('li:not(.no-results)');
        $groups.addClass('no-results')
        $results.parents('.filter-items .group').removeClass('no-results');
        */
    }

    function form_newResults_listener(e) {
        var filter = e.data.filter;
        addFilterSummaryListeners.call(filter);
    }

    function form_newFacetData_listener(e, data) {
        var filter = e.data.filter;

        var iHaveCount = 0;

        if (!(filter.fieldName in data.aFacetData)) {
            console.log('no facet data for this filter: ' + filter.fieldName);
        }

        filter.$checkboxes.each(function(elIndex, el) {
            var $checkbox = $(el);
            var key = $checkbox.attr('data-value');

            var count;
            if (filter.fieldName in data.aFacetData && key in data.aFacetData[filter.fieldName]) {
                count = data.aFacetData[filter.fieldName][key];
            }
            else {
                count = 0;
            }

            var $li = $checkbox.parents('li');
            var countField = $li.find('.facet-count');

            if (count === 0) {
                $li.addClass('no-results');
            }
            else {
                iHaveCount++;
                $li.removeClass('no-results');
            }
            countField.html(addCommas(count));

        });

        filter.$aliases.each(function(elIndex, el) {
            var $checkbox = $(el);
            var count = 0;
            $checkbox.parents('.group').find('ul .facet-count').each(function(elIndex, el) {
                count += Number(el.innerHTML.replace(',',''));
            });

            var $alias = $checkbox.parents('.group-alias');
            $alias.find('.facet-count').html(addCommas(count));

            if (count > 0) {
                $alias.removeClass('no-results');
            }
            else {
                $alias.addClass('no-results');
            }
        });

        filter.$container.find('.summary-have').html(iHaveCount);
    }

    function viewAllBtn_click_listener(e) {
        var filter = e.data.filter;
        filter.$container.pbToggleZoom();
    }

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

    $(window).bind('load', function() {
        $('.checkboxfilter:not(.loaded)').each(function(i, $el) {
            new CheckboxFilter($el);
        });
    });


})();
