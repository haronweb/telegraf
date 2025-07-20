(function() {
    UPDATE_DELAY = 1000;

    function QueryFilter(container) {
        this.$container = $(container);
        this.$container.addClass('loaded');

        this.$form              = this.$container.parents('.faceted-search');
        this.$input             = this.$container.find('input[type=text]');
        this.$fieldDropdown     = this.$container.find('.pb-popup');
        this.$fieldToggleBtn    = this.$container.find('.pb-popup-anchor .pb-button');
        this.$fieldBtns         = this.$container.find('.pb-popup button');

        var fields = this.fields = {};
        this.$fieldBtns.each(function(elIndex, el) {
            fields[el.getAttribute('data-value')] = el.innerHTML;
        });

        this.currentField = this.$container.find('li.selected button').attr('data-value');

        this.$hidden = $('<input type="hidden">');
        this.$hidden.attr('name', this.$input.attr('name'));
        this.$input.removeAttr('name', '');
        this.$hidden.val(this.$input.val());
        this.$container.append(this.$hidden);

        this.$input.bind('input', { filter: this }, input_input_listener);
        this.$input.bind('blur', { filter: this }, input_blur_listener);
        this.$input.bind('keypress', { filter: this }, input_keypress_listener);
        this.$fieldToggleBtn.bind('click', { filter: this }, fieldToggleBtn_click_listener);
        this.$fieldBtns.bind('click', { filter: this }, fieldBtn_click_listener);

        syncHiddenInput(this);
        addFilterSummaryListeners.call(this);
        this.$form.bind('new_results', $.proxy(addFilterSummaryListeners,this));

    }

    function fieldToggleBtn_click_listener(e) {
        var filter = e.data.filter;
        filter.$fieldDropdown.pbTogglePopup();

        return false;
    }

    function fieldBtn_click_listener(e) {
        var filter = e.data.filter;

        var $selected = $(this);
        filter.currentField = $selected.attr('data-value');

        filter.$fieldBtns.parents('.pb-popup li').removeClass('selected');
        $selected.parents('.pb-popup li').addClass('selected');
        filter.$fieldToggleBtn.html($selected.html());

        filter.$fieldDropdown.pbClosePopup();

        syncHiddenInput(filter);
        triggerSearchUpdate.call(filter);

        return false;
    }

    function input_input_listener(e) {
        var filter = e.data.filter;
        syncHiddenInput(filter);
    }

    function syncHiddenInput(filter) {
        var v = filter.$input.val();
        if (v) {
            if (filter.currentField) {
                v = filter.currentField+': '+v;
            }
            filter.$hidden.val(v);
        }
        else {
            filter.$hidden.val('');
        }
    }

    function input_blur_listener(e) {
        var filter = e.data.filter;

        if (filter.updateTimeout) {
            clearTimeout(filter.updateTimeout);
        }

        syncHiddenInput(filter);
        triggerSearchUpdate.call(filter);
    }

    function input_keypress_listener(e) {
        if (e.keyCode == 13) {
            var filter = e.data.filter;

            if (filter.updateTimeout) {
                clearTimeout(filter.updateTimeout);
            }

            syncHiddenInput(filter);
            filter.$container.trigger('query_submitted');
            triggerSearchUpdate.call(filter);

            return false;
        }
    }

    function triggerSearchUpdate() {
        var filter = this;
        filter.$form.trigger('search_update');
    }

    function addFilterSummaryListeners() {
        var eventData = { filter: this };
        $('.clear-queryfilter').bind('click', eventData, clearQueryFilter_click_listener);
    }

    function clearQueryFilter_click_listener(e) {
        var filter = e.data.filter;
        filter.$input.val('');
        syncHiddenInput(filter);
        triggerSearchUpdate.call(filter);
    }

    $(window).bind('load', function() {
        $('.queryfilter:not(.loaded)').each(function(i, $el) {
            new QueryFilter($el);
        });
    });

})();
