pb = window.pb || {};

(function() {
    var rsbs = {}
      , curRsb
      ;

    pb.rsb =
      { create: function(selector, options) {
            /* options:
             *
             * dataFunction - required
             * onChange - function to be called when the value changes
             * onOpen
             * onClose
             * type
             * initialValue
             */

            /*********************** keep track of state ****************/

            var el = pb.elements(selector)[0], elContainer = el
              // we change the z-index and position of the element (to make sure
              // it is on top of everything else), but want to be able to set it
              // back to what it was, keep track of that here...
              , naturalElProps

              // a function that should be called when we want to load in the
              // elements of the list.  it should take a callback, and call that
              // callback with the data
              , dataFunction = options.dataFunction
              // after we load in data (presumably from an rms call) store the
              // items here
              , dataCache
              // if the type is for a search rsb (type == 1) then we create an
              // 'all' data item ourselves
              , dataAllItem = {}
              // when we're loading in data this is an array of callbacks to call
              // once the data is loaded
              , loading = false

              // keep track of the selected item when the rsb is opened, so if
              // they hit escape or click else where we go back to what it was
              // (the way a regular html select box works)
              , previouslySelectedItem

              // keep track of elements
              , searchBG, toc, results, currentItem, formContainer

              // we don't want to be researching the list (and building up the
              // results) if nothing has changed, so keep track of what we have
              // currently searched for
              , currentSearch

              // keep track of current mode
              , mode
              ;

            // they passed some other element in as the id, we assume this is because
            // they want that element to show up as the "tab" for the rsb (visually).
            // so, we just find a text input inside there and use that one
            if (el.nodeName != 'INPUT') {
                var els = el.getElementsByTagName('input');
                for (var i = 0; i < els.length; i++) {
                    if (els[i].type == 'text') {
                        el = els[i];
                        break;
                    }
                }
            }

            //currentSearch = el.value.toUpperCase();

            // we disable the element in the php rendering code to make sure
            // no one tries to interact with the element until we have loaded
            // the code for it, so we make sure it isn't disabled:
            el.disabled = false;

            // keep track of the actual value
            var hiddenEl = document.createElement('input');
            hiddenEl.setAttribute('type', 'hidden');
            hiddenEl.setAttribute('name', el.getAttribute('name'));
            pb.setVal(hiddenEl, options.initialValue || '');

            // make sure no autocomplete
            el.setAttribute('autocomplete', 'disabled');
            // stop conflicting names with the just created hiddenEl
            el.removeAttribute('name');
            // add the hiddenEl
            el.parentNode.insertBefore(hiddenEl, el);

            /******************************** the rsb object ****************
             * we eventually return this.  all public facing functions
             * get added to this
             */

            var rsb =
                {   el: el
                ,   hiddenEl: hiddenEl
                //  the mode for rsb, 0 for must select an item, 1 for not
                ,   type: options.type || 0
                ,   value: options.initialValue

                ,   index: typeof options.index === 'undefined' ? true : options.index
                ,   columns: options.columns || 4

                ,   setDataFunction: function rsb_setDataFunction(func) {
                        // clear our cached results when the data function is reset
                        rsb.box = null;
                        currentSearch = '';
                        dataFunction = func;
                        rsb.close();
                        rsb.setValue();
                    }
                ,   addDataItem: function(item) {
                        // make sure the new item has the properties it needs
                        item.el = createItemLi(item.name, item.id);
                        item.ascii = asciiName(item.name);
                        item.name = item.name.toUpperCase();

                        // add the new item to the list
                        dataCache.push(item);

                        // resort the list
                        dataCache.sort(function(a,b) {
                            if (a.id == -3) return -1;
                            else if (b.id == -3) return 1;
                            else if (a.ascii < b.ascii) return -1;
                            else if (a.ascii > b.ascii) return 1;
                            else return 0;
                        });

                        // check if the toc needs a new letter
                        var firstChar = (item.ascii || item.name).charAt(0).toUpperCase();
                        if (firstChar.search(/[0-9]/) > -1) { firstChar = '0-9'; }

                        for (var i = 0, len = toc.childNodes.length; i < len; i++) {
                            var li = toc.childNodes[i];
                            if (pb.hasClass(li, 'rsb-empty-letter') && firstChar === li.innerHTML) {
                              var newLi = createTocLi(firstChar);
                              toc.insertBefore(newLi, li);
                              toc.removeChild(li);
                              break;
                            }
                        }

                        return item;
                    }
                ,   loadData: function(cb) {
                        loading = [];
                        if (cb) loading.push(cb);

                        dataFunction(dataLoaded);
                    }

                ,   open: function() {
                        if (rsb.opened) { return; }

                        mode = 'opening';

                        if (rsb.box) {
                            // we've already loaded the data
                            showBox();
                        }
                        else if (loading) {
                            pb.addClass(el, 'rsb-loading');
                            // make sure to show box when data is done loading
                            loading.push(showBox);
                        }
                        else {
                            pb.addClass(el, 'rsb-loading');
                            // load data
                            rsb.loadData(showBox);
                        }
                    }
                ,   close: function(reset) {
                        // if not even open, do nothing
                        if (!rsb.opened) { return; }

                        // we're not open anymore
                        rsb.opened = false;
                        curRsb = null;


                        // we're calling close while the "Add New" form is open, close it
                        if (formContainer) {
                            rsb.hideAddNewForm();
                        }

                        // make sure we either have an item selected or not
                        if (reset && previouslySelectedItem) {
                            // reset indicates we want to set this rsb back to what
                            // it was when it was opened
                            selectItem(previouslySelectedItem);
                        }
                        else if (currentItem && currentItem.parentNode.parentNode === results) {
                            // they have an item selected, so select that
                            selectItem(currentItem);
                        }
                        else if (rsb.type == 1
                                && results.childNodes.length == 1
                                && results.firstChild.nodeName.toLowerCase() == 'ul'
                                && results.firstChild.childNodes.length == 1) {
                            selectItem(results.firstChild.firstChild);
                        }
                        else {
                            //otherwise, select nothing
                            rsb.setValue();
                        }

                        // reset the form element (and or container) back to what it is naturally
                        elContainer.style.position = naturalElProps.position;
                        elContainer.style.zIndex = naturalElProps.zIndex;
                        pb.removeClass(el, 'rsb-active');

                        if (el === currentItem) {
                            setCurrentItem();
                        }

                        // pblib box close
                        pb.box.close();

                        // set our event handlers to what they are supposed to be
                        // when this is closed
                        closedEventHandlers();

                        // notify listeners
                        if (rsb.onClose) {
                            rsb.onClose();
                        }
                    }
                ,   onChange: options.onChange
                ,   onClose: options.onClose
                ,   onOpen: options.onOpen

                ,   addNewForm: options.addNewForm
                ,   showAddNewForm: function() {
                        el.style.visibility = 'hidden';

                        formContainer = document.createElement('div');
                        formContainer.className = 'rsb-addNewForm';
                        pb.setHTML(formContainer, rsb.addNewForm());

                        setContents(formContainer);

                        // select the first element of the first form supplied by
                        // the form function.
                        //
                        // if no form or no element, do nothing;
                        var form = formContainer.getElementsByTagName('form')[0];
                        if (form && form.elements[0]) {
                            form.elements[0].focus();
                        }
                    }
                ,   hideAddNewForm: function(e) {
                        // don't do anything if form wasn't open
                        if (formContainer) {
                            el.style.visibility = 'visible';
                            // reset box back
                            setContents(rsb.box);
                            formContainer = null;
                        }
                    }

                ,   setValue: function(id, name, skipChange) {
                        if (typeof id == 'undefined' || id === null) {
                            id = rsb.type == 0 ? -1 : -3;
                        }
                        if (id == -1) {
                            name = '';
                        }
                        else if (id == -3) {
                            name = 'All';
                        }

                        currentSearch = name.toUpperCase();
                        pb.setVal(el, name);
                        // save previous so we can check if things changed
                        var previous = pb.getVal(hiddenEl);
                        pb.setVal(hiddenEl, id);
                        if (typeof jQuery != 'undefined') $(hiddenEl).trigger('change'); //fire JQuery change event on hidden input

                        if (rsb.opened) {
                            el.focus();
                        }

                        rsb.value = id;
                        if(previous != id && rsb.onChange && skipChange == undefined) {
                            rsb.onChange(id);
                        }
                    }

                ,   showAll: function search(str, opening) {
                        var matches = [];
                        for (var i = 0; i < dataCache.length; i++) {
                            matches.push(dataCache[i].el);
                        }

                        var len = matches.length
                          , colSwitch = len/rsb.columns
                          , curCol = 0
                          ;

                        while(results.firstChild) results.removeChild(results.firstChild);

                        if (len > 0) {
                            var col = document.createElement('ul');
                            col.style.width = Math.floor(100/rsb.columns) + '%';
                            for (var i = 0; i < len; i++) {
                                if (i >= (curCol+1)*colSwitch) {
                                    results.appendChild(col);
                                    curCol++;
                                    col = document.createElement('ul');
                                    col.style.width = Math.floor(100/rsb.columns) + '%';
                                }
                                col.appendChild(matches[i]);
                            }
                            results.appendChild(col);
                        }
                        else {
                            results.innerHTML = '<p class="rsb-empty">No results...</p>';
                        }

                    }

                ,   search: function search(str, opening) {
                        // make sure have have something to search for
                        str = str || '';
                        // case insensitive search
                        var searchTerm = str.toUpperCase();

                        if (searchTerm === currentSearch) {

                    makeVisibleEl = pb.firstElement('.rsb-current');
                    if (makeVisibleEl) {
                        if (makeVisibleEl.offsetTop <= results.scrollTop) {
                            results.scrollTop = makeVisibleEl.offsetTop;
                        }
                        else if (makeVisibleEl.offsetTop+makeVisibleEl.offsetHeight >= results.scrollTop+results.offsetHeight) {
                            results.scrollTop = makeVisibleEl.offsetTop+makeVisibleEl.offsetHeight-results.offsetHeight;
                        }
                    }
                            // nothing different, don't do anything
                            return;
                        }
                        rsb.setValue();

                        // show new search
                        pb.setVal(el, str);
                        // keep record of current searchTerm
                        currentSearch = searchTerm;

                        // remove the current selection, a new search resets it
                        setCurrentItem();

                        if (rsb.index) {
                            var tocEls = toc.getElementsByTagName('li');
                            for (var i = 0; i < tocEls.length; i++) {
                                  var inner = tocEls[i].firstChild.innerHTML;
                                  if (inner == searchTerm || (searchTerm == '' && inner == 'ALL') || (inner == '0-9' && searchTerm == '[0-9]') ) {
                                        setCurrentItem(tocEls[i]);
                                  }
                            }
                        }

                        var matches = [], regex = new RegExp('^'+searchTerm);
                        for (var i = 0; i < dataCache.length; i++) {
                          if (dataCache[i].name.search(regex) == 0 || dataCache[i].ascii.search(regex) == 0) {
                              matches.push(dataCache[i].el);

                              if (dataCache[i].name == searchTerm) {
                                  // if we selected a toc item, this trumps it
                                  setCurrentItem(dataCache[i].el);
                              }
                          }
                          else if (mode === 'opening') {
                            matches.push(dataCache[i].el);
                          }
                        }

                        var len = matches.length
                          , colSwitch = len/rsb.columns
                          , curCol = 0
                          ;

                        while(results.firstChild) results.removeChild(results.firstChild);

                        if (len > 0) {
                            if (len === 1 && matches[0] === dataAllItem.el) {
                                setCurrentItem();
                            }
                            var col = document.createElement('ul');
                            col.style.width = Math.floor(100/rsb.columns) + '%';
                            for (var i = 0; i < len; i++) {
                                if (i >= (curCol+1)*colSwitch) {
                                    results.appendChild(col);
                                    curCol++;
                                    col = document.createElement('ul');
                                    col.style.width = Math.floor(100/rsb.columns) + '%';
                                }
                                col.appendChild(matches[i]);
                            }
                            results.appendChild(col);
                        }
                        else {
                            results.innerHTML = '<p class="rsb-empty">No results...</p>';
                        }

                        if (!currentItem) {
                            setCurrentItem(el);
                        }

                        if (rsb.type == 1 && len == 1) {
                            pb.addClass(matches[0], 'rsb-single-item');
                        }
                    }
                };

            addAutoOpenHandlers();

            if (el.id) {
                rsbs[el.id] = rsb;
            }

            return rsb;

            /************** utility functions used by the prevous code but that
             * don't need to be publicly available **************************/

            function setCurrentItem(n) {
                if (currentItem) {
                    // we already have a current item, so remove it
                    pb.removeClass(currentItem, 'rsb-current');
                    currentItem = null;
                }

                // remove this purely visual highlight
                pb.removeClass('.rsb-single-item', 'rsb-single-item');

                if (typeof  n == 'undefined' || n == null) {
                    // nothing to set item to, just move on
                    return;
                }
                currentItem = n;
                pb.addClass(currentItem, 'rsb-current');

                // make sure the current item is visible in the results div
                if (currentItem && currentItem.parentNode && currentItem.parentNode.parentNode !== results) {
                    // if we aren't even in results div, don't do anything
                    return;
                }

                if (currentItem.offsetTop <= results.scrollTop) {
                    results.scrollTop = currentItem.offsetTop;
                }
                else if (currentItem.offsetTop+currentItem.offsetHeight >= results.scrollTop+results.offsetHeight) {
                    results.scrollTop = currentItem.offsetTop+currentItem.offsetHeight-results.offsetHeight;
                }
            }

            function showBox() {
                if (rsb.opened) { return; }
                rsb.opened = true;
                curRsb = rsb;

                pb.addClass(el, 'rsb-active');
                pb.removeClass(el, 'rsb-loading');

                var sWidth = elContainer.offsetWidth + 8
                  , sHeight = elContainer.offsetHeight + 10
                  ;

                searchBG.style.width = sWidth + 'px';
                searchBG.style.height = sHeight + 'px';
                searchBG.style.top = (-sHeight+2) + 'px'

                naturalElProps =
                  {   zIndex: pb.getStyle(elContainer, 'zIndex')
                  ,   position: pb.getStyle(elContainer, 'position')
                  };
                elContainer.style.position = 'relative';
                elContainer.style.zIndex = '200';

                var searchTerm = pb.getVal(el) || '';

                setContents(rsb.box);

                openedEventHandlers();

                rsb.search(pb.getVal(hiddenEl) == dataAllItem.id && searchTerm.toUpperCase() == dataAllItem.name ? '' : searchTerm);

                previouslySelectedItem = currentItem;
                if (previouslySelectedItem && previouslySelectedItem.parentNode.parentNode !== results) {
                    previouslySelectedItem = null;
                }

                if (rsb.onOpen) {
                    rsb.onOpen();
                }

                mode = 'opened';
            }

            // this function sizes and shows the pb.box with the passed in elements
            function setContents(contents) {
                var sWidth = searchBG.style.width;
                sWidth = parseInt(sWidth.substr(0, sWidth.length - 2));
                var sHeight = searchBG.style.height;
                sHeight = parseInt(sHeight.substr(0, sHeight.length - 2));

                var width = rsb.columns == 1 ? sWidth : Math.max(rsb.columns * 170 + 30, sWidth)
                  , height
                  ;

                // create div in DOM for checking height of elements
                var div = document.createElement('div');
                document.body.appendChild(div);
                div.style.width = width + 'px';

                var container;

                if (contents === rsb.box) {
                    var tocHeight = 0;
                    if (toc) {
                      div.appendChild(toc);
                      tocHeight = toc.offsetHeight;

                      results.parentNode.insertBefore(toc, results);
                    }

                    // search for nothing to make sure we are showing all results
                    rsb.showAll();
                    //rsb.search('', true);

                    // put results into dom so we can get its size
                    div.appendChild(results);
                    // grab size
                    var resultsHeight = Math.min(248, results.firstChild.offsetHeight);
                    // put back
                    rsb.box.appendChild(results);
                    // set its height
                    results.style.height = resultsHeight + 'px';

                    height = resultsHeight + tocHeight + 10;

                    container = rsb.box;
                }
                else {
                    div.appendChild(contents);
                    container = document.createElement('div');
                    container.appendChild(contents);
                    pb.addClass(container, 'rsb-container');
                    div.appendChild(container);
                    height = contents.offsetHeight;
                }

                // get rid of extra div for checking height
                document.body.removeChild(div);

                container.insertBefore(searchBG, container.firstChild);

                var pos = pb.getPosition(elContainer);
                pos.x = pos.x - 5;
                pos.y = pos.y + sHeight - 8;

                if (pos.x + width > document.body.clientWidth) {
                    var diff = pos.x + width - document.body.clientWidth + 50;
                    if (diff > (width-sWidth)/2) {
                        diff = width - sWidth - 0;
                    }
                    else {
                        diff = Math.round((width-sWidth)/2);
                    }

                    pos.x -= diff;
                    searchBG.style.left = (diff - 1) + 'px';
                }

                pb.box.close();
                pb.box.open(null, 'tooltip', false, pos, {x: width, y: height});

                pb.box.load(container);
            }

            function asciiName(str) {
                if (str) {
                    return newStr = str.toLowerCase()
                        .replace(/[àáâãäå]/g, "a")
                        .replace(/æ/g, "ae")
                        .replace(/ç/g, "c")
                        .replace(/[èéêë]/g, "e")
                        .replace(/[ìíîï]/g, "i")
                        .replace(/ñ/g, "n")
                        .replace(/[òóôõö]/g, "o")
                        .replace(/œ/g, "oe")
                        .replace(/ł/g, "l")
                        .replace(/ś/g, "s")
                        .replace(/[ùúûü]/g, "u")
                        .replace(/[ýÿ]/g, "y")
                        .replace(/ż/g, "z")
                        .replace(/\\W/g, "")
                        .toUpperCase();
                } else {
                    return str;
                }
            }

            function dataLoaded(data) {
                if (data.constructor != Array) {
                    var newData = [];
                    for (var id in data) {
                        newData.push({id: id, name: data[id]});
                    }
                    data = newData;
                }
                for (var i = 0; i < data.length; i++) {
                    data[i].ascii = asciiName(data[i].name);
                }

                dataCache = data;

                rsb.box = createBox();

                var cbs = loading;
                loading = false;
                for (var i = 0; i < cbs.length; i++) {
                    cbs[i]();
                }
            }

            function openedEventHandlers() {
                // listen for key commands to exit
                pb.addEvent(document, 'keyup', documentKeyupHandler);

                // prevent clicks from going through to the document
                pb.addEvent('#pbBox', 'click', stopClickPropagationHandler);
                pb.addEvent(searchBG, 'click', stopClickPropagationHandler);
                pb.addEvent(el, 'click', stopClickPropagationHandler);

                // remove auto open listeners, doesn't matter if autoopen is
                // turned on or not, removing can't hurt
                removeAutoOpenHandlers();

                // listen to keyboard events on the element
                pb.addEvent(el, 'keyup', searchFieldKeyupHandler);
                if (pb.useragent() == 'gecko') {
                    pb.addEvent(el, 'keypress', searchFieldKeydownHandler);
                }
                else {
                    pb.addEvent(el, 'keydown', searchFieldKeydownHandler);
                }

                // listen for clicks else where in document to close pop up
                pb.addEvent(document, 'click', documentClickHandler);
            }

            function closedEventHandlers() {
                // undo everything done in openedEventHandlers
                pb.removeEvent(document, 'keyup', documentKeyupHandler);

                pb.removeEvent('#pbBox', 'click', stopClickPropagationHandler);
                pb.removeEvent(searchBG, 'click', stopClickPropagationHandler);
                pb.removeEvent(el, 'click', stopClickPropagationHandler);

                addAutoOpenHandlers();

                pb.removeEvent(el, 'keyup', searchFieldKeyupHandler);
                if (pb.useragent() == 'gecko') {
                    pb.removeEvent(el, 'keypress', searchFieldKeydownHandler);
                }
                else {
                    pb.removeEvent(el, 'keydown', searchFieldKeydownHandler);
                }

                pb.removeEvent(document, 'click', documentClickHandler);
            }

            function addAutoOpenHandlers() {
                pb.addEvent(el, 'keydown', searchFieldAutoOpenKeydownHandler);
                pb.addEvent(el, 'keyup', searchFieldAutoOpenKeyupHandler);
                pb.addEvent(el, 'focus', searchFieldFocusHandler);
                pb.addEvent(el, 'click', searchFieldFocusHandler);
            }
            function removeAutoOpenHandlers() {
                pb.removeEvent(el, 'keydown', searchFieldAutoOpenKeydownHandler);
                pb.removeEvent(el, 'keyyp', searchFieldAutoOpenKeyupHandler);
                pb.removeEvent(el, 'focus', searchFieldFocusHandler);
                pb.removeEvent(el, 'click', searchFieldFocusHandler);
            }

            function createBox() {
                var div = document.createElement('div');
                div.className = 'rsb';

                searchBG = document.createElement('p');
                searchBG.className = "rsb-search-bg";
                div.appendChild(searchBG);

                toc = document.createElement('ol');
                toc.className = 'rsb-toc';
                div.appendChild(toc);

                results = document.createElement('div');
                results.className = 'rsb-results';
                div.appendChild(results);

                var len = dataCache.length;
                for (var i = 0; i < len; i++) {
                    if (dataCache[i] && dataCache[i].id) {
                        dataCache[i].el = createItemLi(dataCache[i].name, dataCache[i].id);
                        dataCache[i].name = dataCache[i].name.toUpperCase();
                    } else {
                        dataCache.splice(i, 1);
                    }
                }

                dataCache.sort(function(a,b) {
                    if (a.ascii < b.ascii) return -1;
                    else if (a.ascii > b.ascii) return 1;
                    else return 0;
                });

                if (rsb.type == 1) {
                    dataAllItem = rsb.addDataItem({name: 'All', id: -3});
                }

                if (rsb.index) {
                  var li;

                  li = document.createElement('li');
                  li.className = 'rsb-all';
                  li.innerHTML = '<a href="javascript:;">ALL</a>';
                  pb.addEvent(li.firstChild, 'click', function() {
                      rsb.search('');
                      return false;
                  });
                  toc.appendChild(li);

                  li = document.createElement('li');
                  li.innerHTML = '<a href="javascript:;">&ensp;</a>';
                  pb.addEvent(li.firstChild, 'click', function() {
                      return false;
                  });
                  toc.appendChild(li);

                  var letters = ['0-9', 'A', 'B', 'C','D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
                  var previousLetter = 0;
                  var previousChar = '';
                  for (var i = (rsb.type == 1 ? 1 : 0); i <= len; i++) {
                    if (typeof dataCache[i] !== 'undefined') {
                      var firstChar = (dataCache[i].ascii || dataCache[i].name).charAt(0).toUpperCase();
                      if (firstChar.search(/^[A-Z0-9]/) == 0) {
                          if (firstChar.search(/[0-9]/) > -1) { firstChar = '0-9'; }
                          if (firstChar != previousChar) {
                              while (previousLetter < letters.length && letters[previousLetter] != firstChar) {
                                  li = document.createElement('li');
                                  pb.addClass(li, 'rsb-empty-letter');
                                  li.innerHTML = letters[previousLetter];
                                  previousLetter++;
                                  toc.appendChild(li);
                              }

                              previousLetter++;
                              li = createTocLi(firstChar);
                              toc.appendChild(li);
                              previousChar = firstChar;
                          }
                      }
                    }
                  }
                  while (previousLetter < letters.length) {
                      li = document.createElement('li');
                      pb.addClass(li, 'rsb-empty-letter');
                      li.innerHTML = letters[previousLetter];
                      previousLetter++;
                      toc.appendChild(li);
                  }

                  if (toc.childNodes.length == 2) {
                      while (toc.firstChild) toc.removeChild(toc.firstChild);
                  }

                  if (rsb.type === 0 && rsb.addNewForm) {
                    var points = document.getElementById('userPoints');
                    if (points && typeof points.value !== 'undefined' && parseInt(points.value) > 1000) {
                        var li = document.createElement('li');
                        li.className = "rsb-add-new-button";
                        li.innerHTML = (toc.childNodes.length > 0 ? 'or ' : '') + '<a href="javascript:;">ADD NEW</a>';
                        pb.addEvent(li.childNodes[1], 'click', function () {
                            rsb.showAddNewForm();
                        });
                        toc.appendChild(li);
                    }
                  }
                }

                return div;
            }

            function createItemLi(name, id) {
                var li = document.createElement('li');
                li.innerHTML = '<a href="javascript:;">'+name+'</a>';
                li.setAttribute('data-id', id);

                pb.addEvent(li.firstChild, 'click', function() {
                    selectItem(li);

                    // we do this in a time out because selectItem calls focus()
                    // on an element, and we want to make sure IE is done dealing
                    // with that before we close, otherwise this rsb gets immediately
                    // opened
                    setTimeout(function() {
                        rsb.close();
                    }, 50);
                });

                return li;
            }

            function createTocLi(char) {
                var li = document.createElement('li');
                li.innerHTML = '<a href="javascript:;">'+char+'</a>';
                pb.addEvent(li.firstChild, 'click', function() {
                    rsb.search(char == '0-9' ? '[0-9]' : char);
                    return false;
                });

                return li;
            }

            function selectItem(item) {
                setCurrentItem(item);

                rsb.setValue(item.getAttribute('data-id'), pb.useragent() == 'ie' ? item.innerText : item.textContent);
            }


            /********************* EVENT HANDLERS *********************/
            function searchFieldAutoOpenKeydownHandler(e) {
                var code = e.which || e.keyCode;
                if (code == 38 || code == 40) {
                    if (e.preventDefault) { e.preventDefault(); }
                    else e.returnValue = false;
                    rsb.open();
                }
            }
            function searchFieldAutoOpenKeyupHandler(e) {
                if(pb.getVal(el).toUpperCase() !== currentSearch) {
                    rsb.open();
                }
            }
            function searchFieldFocusHandler(e) {
                if (e.stopPropagation) e.stopPropagation();
                else e.cancelBubble = true;

                if (curRsb && curRsb !== rsb) {
                    curRsb.close();
                }
                rsb.open();

                return false;
            }

            function documentKeyupHandler(e) {
                if (e.keyCode == 27) { // esc
                    rsb.close(true);
                }
            }
            function documentClickHandler(e) {
                rsb.close(true);
            }

            function stopClickPropagationHandler(e) {
                if (e.stopPropagation) e.stopPropagation();
                else e.cancelBubble = true;

                el.focus();
            }

            function searchFieldKeydownHandler(e) {
              var code = e.which || e.keyCode;
              // prevent the arrow keys from moving the cursor
              if (code >= 37 && code <= 40) {
                  if (!currentItem || currentItem === el ) {
                      if (code != 40 && code != 38) { return; }
                      else {
                          // if we don't have a current item or the current item is
                          // equal to the search field, we choose a toc element
                          var tmpEl = tocElement();

                          // if there is no tocElement (because the toc is not visible)
                          // we choose the first result
                          if (!tmpEl) {
                            tmpEl = results.firstChild.firstChild;

                            // if the first result is not an li then we have no first
                            // result (and instead have the <p>saying such)
                            if (tmpEl.nodeName !== 'LI') tmpEl = null;
                          }

                          setCurrentItem(tmpEl);
                          return;
                      }
                  }

                  if (e.preventDefault) { e.preventDefault(); }
                  else e.returnValue = false;

                  if (currentItem.parentNode.parentNode === results) {
                      directionKeyActivatedResults(code);
                  }
                  else {
                      directionKeyActivatedTOC(code);
                  }
                  return false;
              }

              switch(code) {
                case 13: // enter/return
                  if (e.preventDefault) { e.preventDefault(); }
                  else e.returnValue = false;

                  if (currentItem && currentItem.parentNode === toc) {
                      var txt = pb.useragent() == 'ie' ? currentItem.innerText : currentItem.textContent;
                      if (txt == 'or ADD NEW') {
                          return rsb.showAddNewForm();
                      }
                  }

                  rsb.close();
                  break;
                case 34: // page down
                  if (e.preventDefault) { e.preventDefault(); }
                  else e.returnValue = false;
                  scrollPage(true);
                  break;
                case 33: // page up
                  if (e.preventDefault) { e.preventDefault(); }
                  else e.returnValue = false;
                  scrollPage(false);
                  break;
                case 68: // ctrl+d
                  if (e.ctrlKey) {
                      if (e.preventDefault) { e.preventDefault(); }
                      else e.returnValue = false;
                      scrollPage(true);
                  }
                  break;
                case 85: // ctrl+u
                  if (e.ctrlKey) {
                      if (e.preventDefault) { e.preventDefault(); }
                      else e.returnValue = false;
                      scrollPage(false);
                  }
                  break;
                case 9: // tab
                  //if (e.preventDefault) { e.preventDefault(); }
                  //else e.returnValue = false;

                  rsb.close();
              }
            }

            function searchFieldKeyupHandler(e) {
                rsb.search(pb.getVal(el));
            }

            /***************** UTILITY FUNCTIONS USED BY searchField handlers *****/

            function directionKeyActivatedResults(code) {
                var tmpEl;

                switch(code) {
                  case 37: // left
                    // which row are we in
                    var index = 0;
                    for (var i = 0; i < currentItem.parentNode.childNodes.length; i++) {
                        if (currentItem.parentNode.childNodes[i] == currentItem) {
                            index = i;
                            break;
                        }
                    }

                    var col = currentItem.parentNode.previousSibling || results.lastChild;
                    if (col) {
                        index = Math.min(col.childNodes.length - 1, index);
                        tmpEl = col.childNodes[index];
                    }
                    else {
                        tmpEl = null;
                    }

                    break;
                  case 38: // up
                    tmpEl = currentItem.previousSibling || tocElement();
                    break;
                  case 39: // right
                    // which row are we in
                    var index = 0;
                    for (var i = 0; i < currentItem.parentNode.childNodes.length; i++) {
                        if (currentItem.parentNode.childNodes[i] == currentItem) {
                            index = i;
                            break;
                        }
                    }

                    // which col are we moving to
                    col = currentItem.parentNode.nextSibling || currentItem.parentNode.parentNode.firstChild;
                    if (col) {
                      index = Math.min(col.childNodes.length - 1, index);
                      tmpEl = col.childNodes[index];
                    }
                    else {
                      tmpEl = null;
                    }

                    break;
                  case 40: // down
                    tmpEl = currentItem.nextSibling;
                    break;
                }

                if (tmpEl) {
                  setCurrentItem(tmpEl);
                }
            }

            function directionKeyActivatedTOC(code) {
                var tmpEl;

                switch(code) {
                  case 37: // left
                      tmpEl = currentItem.previousSibling;
                      while (tmpEl && pb.hasClass(tmpEl, 'rsb-empty-letter')) {
                          tmpEl = tmpEl.previousSibling;
                      }

                      if (!tmpEl) {
                          tmpEl = toc.lastChild;
                          while (tmpEl && pb.hasClass(tmpEl, 'rsb-empty-letter')) {
                              tmpEl = tmpEl.previousSibling;
                          }
                      }
                      break;
                  case 38: // up
                      // unselect everything
                      setCurrentItem(el);
                      break;
                  case 39: // right
                      tmpEl = currentItem;
                      while ((tmpEl = tmpEl.nextSibling) && pb.hasClass(tmpEl, 'rsb-empty-letter'));

                      if (!tmpEl) {
                          tmpEl = toc.firstChild;
                      }
                      break;
                  case 40: // down
                      // TODO be smarter about which column we jump to?
                      tmpEl = results.firstChild.firstChild;
                      break;
                }

                if (tmpEl) {
                    if (tmpEl.parentNode === toc) {
                        var searchTerm = pb.useragent() == 'ie' ? tmpEl.innerText : tmpEl.textContent;
                        if (searchTerm != "or ADD NEW" && searchTerm != " ") {
                            if (searchTerm === "ALL") searchTerm = "";
                            if (searchTerm === "0-9") searchTerm = "[0-9]";

                            rsb.search(searchTerm);
                        }
                    }

                    setCurrentItem(tmpEl);
                }
            }

            function tocElement() {
              if (rsb.index) {
                  var tmpEls = toc.getElementsByTagName('li');

                  for (var i = 0; i < tmpEls.length; i++) {
                      var inner = tmpEls[i].firstChild.innerHTML;
                      if (inner == currentSearch || (currentSearch == '' && inner == 'ALL') || (inner == '0-9' && currentSearch == '[0-9]') ) {
                          return tmpEls[i];
                      }
                  }

                  return tmpEls[1];
              }
            }

            function scrollPage(down) {
              if (!currentItem) {
                // we have no current item, can't scroll, really this shouldn't
                // happen to often
                return;
              }

              if (currentItem.parentNode.parentNode !== results) {
                // if not in results just select first item of results
                var fc = results.firstChild;
                //check to see if we have any results to show...
                if (fc.nodeName == 'UL') {
                  setCurrentItem(down ? fc.firstChild : fc.lastChild);
                }
                return;
              }

              var cur = currentItem;
              if (down) {
                start = cur.offsetTop-cur.offsetHeight;
                while (cur.nextSibling) {
                  cur = cur.nextSibling;
                  if (cur.offsetTop-start >= results.offsetHeight) {
                    break;
                  }
                }

                results.scrollTop += results.offsetHeight;
                setCurrentItem(cur);
                return;
              }
              else {
                start = cur.offsetTop+cur.offsetHeight;
                while (cur.previousSibling) {
                  cur = cur.previousSibling;
                  if (start-cur.offsetTop >= results.offsetHeight) {
                    break;
                  }
                }
                setCurrentItem(cur);
                return;
              }
            }

        }
      ,   getById: function(id) {
              return rsbs[id];
          }
      };

})();
