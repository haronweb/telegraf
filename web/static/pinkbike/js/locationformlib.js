pb = window.pb || {};

pb.countryform = { initialize: function(type, countryid, countryinit, ar, toc) {
        if (typeof toc == 'undefined') {
            toc = true;
        }

        var countryRSB = pb.rsb.create('#'+countryid, {
            type: type,
            index: toc,
            initialValue: countryinit,
            dataFunction: function(cb) {
                pb.rmsSend({mod: "region2", op: "country"}, function success(data) {
                    var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                    if (list) cb(list);
                    else pb.errorHandler(new Error('Could not get country list'));
                });
            },
            onChange: function(val) {

            }
        });
    }
};

pb.locationform =
    { initialize: function(type, countryid, provid, region2id, region3id, cityid, ridingareaid, countryinit, provinit, cityinit, region2init, region3init, ridingareainit, ar, toc) {
            var newCityContainer;
            var newRegionContainer;
            var newRidingareaContainer;

            if (ridingareainit >= 0) {
                var ridingareaLoad = true;
            } else {
                var ridingareaLoad = false;
            }

            if (typeof toc == 'undefined') {
                toc = true;
            }

            var countryRSB = pb.rsb.create('#'+countryid, {
                type: type,
                index: toc,
                initialValue: countryinit,
                dataFunction: function(cb) {
                    pb.rmsSend({mod: "region2", op: "country"}, function success(data) {
                        var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                        if (list) cb(list);
                        else pb.errorHandler(new Error('Could not get country list'));
                    });
                },
                onChange: function(val) {
                    newCityContainer = null;

                    if (val == 35 || val == 194) {
                        provRSB.setDataFunction(function(cb) {
                            pb.rmsSend(
                                {mod:'region2', op:'prov', iC: val},
                                function success(data) {
                                    var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                    if (list) {
                                         pb.setHTML(provRSB.el.parentNode.parentNode.getElementsByTagName('td')[0], data.rmsD.sProvTag);
                                         cb(list);
                                    }
                                    else pb.errorHandler(new Error('Could not get province list'));
                                });
                        });

                        provRSB.loadData();

                        pb.hide(cityRSB.el.parentNode.parentNode);
                        pb.show(provRSB.el.parentNode.parentNode);

                        cityRSB.setValue();
                    }
                    else if (val > 0) {
                        cityRSB.setDataFunction(function(cb) {
                            pb.rmsSend(
                                {mod:'region2', op:'city', iP: 0, iC: val},
                                function success(data) {
                                    var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                    if (list) cb(list);
                                    else pb.errorHandler(new Error('Could not get city list'));
                                });
                        });

                        cityRSB.loadData();

                        pb.hide(provRSB.el.parentNode.parentNode);
                        pb.show(cityRSB.el.parentNode.parentNode);

                        provRSB.setValue(-4,'');
                    }
                    else {
                        pb.hide(provRSB.el.parentNode.parentNode);
                        pb.hide(cityRSB.el.parentNode.parentNode);

                        provRSB.setValue(-4,'');
                        cityRSB.setValue();
                    }

                    //refresh ridingareas
                    if (ridingareaLoad == true && val > 0) {
                        ridingareaRSB.setDataFunction(function(cb) {
                            console.log('refresh ridingareas, country: ', val);
                            pb.rmsSend(
                                {mod: 'region2', op: 'ridingareas', iC: val},
                                function success(data) {
                                    var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                    if (list) cb(list);
                                    else pb.errorHandler(new Error('Could not get ridingareas list'));
                                });

                        });
                        ridingareaRSB.loadData();
                    }
                }
            });

            if (provid) {
                var provRSB = pb.rsb.create('#' + provid, {
                    type: type,
                    index: toc,
                    initialValue: provinit,
                    onChange: function (val) {
                        newCityContainer = null;

                        if (val > 0) {
                            cityRSB.setDataFunction(function (cb) {
                                pb.rmsSend(
                                    {mod: 'region2', op: 'city', iP: val, iC: countryRSB.value},
                                    function success(data) {
                                        var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                        if (list) cb(list);
                                        else pb.errorHandler(new Error('Could not get city list'));
                                    });
                            });

                            cityRSB.loadData();

                            var region_type_element = document.getElementById("region_type");
                            var region_type = region_type_element ? region_type_element.value : '';
                            if (region_type != 'region3' && region_type != 'region2') {
                                pb.show(cityRSB.el.parentNode.parentNode);
                            }

                            if (ar == 'trailforks') {
                                region2RSB.setDataFunction(function (cb) {
                                    pb.rmsSend(
                                        {mod: 'region2', op: 'region2', type: 'prov', iP: val},
                                        function success(data) {
                                            var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                            if (list) cb(list);
                                            else pb.errorHandler(new Error('Could not get region2 list'));
                                            if (list.length > 1) {
                                                pb.show(region2RSB.el.parentNode.parentNode);
                                            } else {
                                                region2RSB.setValue(-3, '');
                                                region3RSB.setValue(-3, '');
                                                pb.hide(region2RSB.el.parentNode.parentNode);
                                                pb.hide(region3RSB.el.parentNode.parentNode);
                                            }
                                        });
                                });
                                region2RSB.loadData();

                                if (region2RSB.value) {
                                    region3RSB.setDataFunction(function (cb) {
                                        pb.rmsSend(
                                            {mod: 'region2', op: 'region3', iR2: region2RSB.value},
                                            function success(data) {
                                                var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                                if (list) cb(list);
                                                else pb.errorHandler(new Error('Could not get region3 list'));
                                                if (list !== null && list.length > 1) {
                                                    pb.show(region3RSB.el.parentNode.parentNode);
                                                } else {
                                                    region3RSB.setValue(-3, '');
                                                    pb.hide(region3RSB.el.parentNode.parentNode);
                                                }
                                            });
                                    });
                                    region3RSB.loadData();
                                }

                                //refresh ridingareas
                                if (ridingareaLoad == true) {
                                    //if (ridingareaRSB.value <= 0) {
                                    ridingareaRSB.setDataFunction(function (cb) {
                                        console.log('refresh ridingareas, prov: ', val);
                                        pb.rmsSend(
                                            {mod: 'region2', op: 'ridingareas', iP: val},
                                            function success(data) {
                                                var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                                if (list) cb(list);
                                                else pb.errorHandler(new Error('Could not get ridingareas list'));
                                            });
                                    });
                                    ridingareaRSB.loadData();
                                    //}
                                }

                            }
                        } else {
                            if (countryRSB.value > 0) {
                                pb.show(cityRSB.el.parentNode.parentNode);
                            } else {
                                pb.hide(cityRSB.el.parentNode.parentNode);
                            }

                            cityRSB.setValue();
                        }
                    },
                    dataFunction: function (cb) {
                        pb.rmsSend(
                            {mod: 'region2', op: 'prov', iC: countryinit},
                            function success(data) {
                                var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                if (list) {
                                    pb.setHTML(provRSB.el.parentNode.parentNode.getElementsByTagName('td')[0], data.rmsD.sProvTag);
                                    cb(list);
                                } else pb.errorHandler(new Error('Could not get province list'));
                            });
                    }
                });
            }

            if (ar == 'trailforks' && region2id) {
                var region2RSB = pb.rsb.create('#'+region2id, {
                    type: type,
                    index: toc,
                    initialValue: region2init,
                    addNewForm: newRegionForm,
                    onChange: function(val) {
                        newRegion2Container = null;
                        if (val > 0) {
                            region3RSB.setDataFunction(function(cb) {
                                pb.rmsSend(
                                    {mod:'region2', op:'region3', iR2: val},
                                    function success(data) {
                                        var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                        if (list) cb(list);
                                        else pb.errorHandler(new Error('Could not get region3 list'));
                                        if (list.length > 1) {
                                            pb.show(region3RSB.el.parentNode.parentNode);
                                        } else {
                                            region3RSB.setValue(-3, '');
                                            pb.hide(region3RSB.el.parentNode.parentNode);
                                        }
                                    });
                            });
                            region3RSB.loadData();

                            //refresh ridingareas
                            if (ridingareaLoad == true) {
                                //if (ridingareaRSB.value <= 0) {
                                    ridingareaRSB.setDataFunction(function(cb) {
                                        console.log('refresh ridingareas, region2: ', val);
                                        pb.rmsSend(
                                            {mod:'region2', op:'ridingareas', iR2: val},
                                            function success(data) {
                                                var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                                if (list) cb(list);
                                                else pb.errorHandler(new Error('Could not get ridingareas list'));
                                            });
                                    });
                                    ridingareaRSB.loadData();
                               //}
                            }
                        }
                    },
                    dataFunction: function(cb) {
                        if (provRSB.value > 0) {
                            var id = provRSB.value;
                            var type = 'prov';
                        } else {
                            var id = countryRSB.value;
                            var type = 'country';
                        }
                        pb.rmsSend(
                            {mod:'region2', op:'region2', type: type, iP: id},
                            function success(data) {
                                var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                if (list) cb(list);
                                else pb.errorHandler(new Error('Could not get region2 list'));
                            });
                    }
                });

                var region3RSB = pb.rsb.create('#'+region3id, {
                    type: type,
                    index: toc,
                    initialValue: region3init,
                    addNewForm: newRegionForm,
                    onChange: function(val) {
                        newRegion3Container = null;
                        if (val > 0) {
                            //refresh ridingareas
                            if (ridingareaLoad == true) {
                                //if (ridingareaRSB.value <= 0) {
                                    ridingareaRSB.setDataFunction(function(cb) {
                                        console.log('refresh ridingareas, region3: ', val);
                                        pb.rmsSend(
                                            {mod:'region2', op:'ridingareas', iR3: val},
                                            function success(data) {
                                                var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                                if (list) cb(list);
                                                else pb.errorHandler(new Error('Could not get ridingareas list'));
                                            });
                                    });
                                    ridingareaRSB.loadData();
                                //}
                            }
                        }
                    },
                    dataFunction: function(cb) {
                        pb.rmsSend(
                            {mod:'region2', op:'region3', iR2: region2RSB.value},
                            function success(data) {
                                var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                if (list) {
                                     cb(list);
                                }
                                else pb.errorHandler(new Error('Could not get region3 list'));
                            });
                    }
                });


                if (ridingareaLoad == true) {
                    var ridingareaRSB = pb.rsb.create('#'+ridingareaid, {
                        type: type,
                        index: toc,
                        initialValue: ridingareainit,
                        addNewForm: newRidingareaForm,
                        onChange: function(val) {
                            newRidingareaContainer = null;
                            if (val > 0) {
                                pb.RSBload = true;
                                //auto select locations based on the ridingarea selected
                                pb.rmsSend(
                                    {mod:'region2', op:'ridingarea_regions', iRA: val},
                                    function success(data) {
                                        ridingareaLoad = false;
                                        if (data.rmsD.data.wos_country > 0) {
                                            countryRSB.setValue(data.rmsD.data.wos_country, data.rmsD.data.country_title, true);
                                        }
                                        if (data.rmsD.data.wos_prov > 0) {
                                            provRSB.setDataFunction(function(cb) {
                                                pb.rmsSend(
                                                    {mod:'region2', op:'prov', iC: countryRSB.value},
                                                    function success(data) {
                                                        var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                                        if (list) cb(list);
                                                        else pb.errorHandler(new Error('Could not get prov/state list'));
                                                        if (list.length > 1) {
                                                            pb.show(provRSB.el.parentNode.parentNode);
                                                        }
                                                    });
                                            });
                                            ridingareaLoad = false;
                                            provRSB.loadData();
                                            provRSB.setValue(data.rmsD.data.wos_prov, data.rmsD.data.prov_title, true);
                                        }
                                        if (data.rmsD.data.region2 > 0) {
                                            region2RSB.setDataFunction(function(cb) {
                                                pb.rmsSend(
                                                    {mod:'region2', op:'region2', iP: data.rmsD.data.wos_prov},
                                                    function success(data) {
                                                        var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                                        if (list) cb(list);
                                                        else pb.errorHandler(new Error('Could not get region2 list'));
                                                        if (list.length > 1) {
                                                            pb.show(region2RSB.el.parentNode.parentNode);
                                                        }
                                                    });
                                            });
                                            region2RSB.loadData();
                                            region2RSB.setValue(data.rmsD.data.region2, data.rmsD.data.region2_title, true);
                                        }
                                        if (data.rmsD.data.region3 > 0) {
                                            region3RSB.setDataFunction(function(cb) {
                                                pb.rmsSend(
                                                    {mod:'region2', op:'region3', iR2: data.rmsD.data.region2},
                                                    function success(data) {
                                                        var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                                        if (list) cb(list);
                                                        else pb.errorHandler(new Error('Could not get region3 list'));
                                                        if (list.length > 1) {
                                                            pb.show(region3RSB.el.parentNode.parentNode);
                                                        }
                                                    });
                                            });
                                            region3RSB.loadData();
                                            region3RSB.setValue(data.rmsD.data.region3, data.rmsD.data.region3_title, true);
                                        }
                                        if (data.rmsD.data.wos_city > 0) {
                                            cityRSB.setDataFunction(function(cb) {
                                                pb.rmsSend(
                                                    {mod:'region2', op:'city', iP: data.rmsD.data.wos_prov},
                                                    function success(data) {
                                                        var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                                        if (list) cb(list);
                                                        else pb.errorHandler(new Error('Could not get region3 list'));
                                                        if (list.length > 1) {
                                                            pb.show(cityRSB.el.parentNode.parentNode);
                                                        }
                                                    });
                                            });
                                            cityRSB.loadData();
                                            if (data.rmsD.data.wos_city && data.rmsD.data.city_title) {
                                                cityRSB.setValue(data.rmsD.data.wos_city, data.rmsD.data.city_title, true);
                                            }
                                        }

                                        ridingareaLoad = true;
                                });
                            }
                        },
                        dataFunction: function(cb) {
                            console.log('refresh ridingareas', countryRSB.value, provRSB.value, cityRSB.value);
                            pb.rmsSend(
                                {mod:'region2', op:'ridingareas', iC: countryRSB.value, iP: provRSB.value, iT: cityRSB.value},
                                function success(data) {
                                    var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                    if (list) cb(list);
                                    else pb.errorHandler(new Error('Could not get region3 list'));
                                });
                        }
                    });
                }

            }

            if (cityid) {
                var cityRSB = pb.rsb.create('#' + cityid, {
                    type: type,
                    index: toc,
                    initialValue: cityinit,
                    addNewForm: newCityForm,
                    dataFunction: function (cb) {
                        pb.rmsSend(
                            {mod: 'region2', op: 'city', iP: provinit, iC: countryinit, iT: cityinit},
                            function success(data) {
                                var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                if (list) cb(list);
                                else pb.errorHandler(new Error('Could not get city list'));
                            });
                    },
                    onChange: function (val) {
                        if (ar == 'trailforks') {
                            // auto select regions based on which city is picked
                            pb.rmsSend(
                                {mod: 'region2', op: 'city_regions', iT: val},
                                function success(data) {
                                    if (data.rmsD.data.region2 > 0) {
                                        region2RSB.setDataFunction(function (cb) {
                                            pb.rmsSend(
                                                {mod: 'region2', op: 'region2', iP: data.rmsD.data.wos_prov},
                                                function success(data) {
                                                    var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                                    if (list) cb(list);
                                                    else pb.errorHandler(new Error('Could not get region2 list'));
                                                    if (list.length > 1) {
                                                        pb.show(region2RSB.el.parentNode.parentNode);
                                                    }
                                                });
                                        });
                                        region2RSB.loadData();
                                        region2RSB.setValue(data.rmsD.data.region2, data.rmsD.data.region2_title, true);
                                    }
                                    if (data.rmsD.data.region3 > 0) {
                                        region3RSB.setDataFunction(function (cb) {
                                            pb.rmsSend(
                                                {mod: 'region2', op: 'region3', iR2: data.rmsD.data.region2},
                                                function success(data) {
                                                    var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                                    if (list) cb(list);
                                                    else pb.errorHandler(new Error('Could not get region3 list'));
                                                    if (list.length > 1) {
                                                        pb.show(region3RSB.el.parentNode.parentNode);
                                                    }
                                                });
                                        });
                                        region3RSB.loadData();
                                        region3RSB.setValue(data.rmsD.data.region3, data.rmsD.data.region3_title, true);
                                    }
                                });

                            //refresh ridingareas
                            if (ridingareaLoad == true && val > 0) {
                                //if (ridingareaRSB.value <= 0) {
                                ridingareaRSB.setDataFunction(function (cb) {
                                    console.log('refresh ridingareas, city: ', val);
                                    pb.rmsSend(
                                        {mod: 'region2', op: 'ridingareas', iT: val},
                                        function success(data) {
                                            var list = data.rmsList || (data.rmsD ? data.rmsD.data : null);
                                            if (list) cb(list);
                                            else pb.errorHandler(new Error('Could not get ridingareas list'));
                                        });
                                });
                                ridingareaRSB.loadData();
                                //}
                            }
                        }
                    }
                });
            }

            function newCityForm() {
                if (newCityContainer) return newCityContainer;

                newCityContainer = document.createElement('div');
                newCityContainer.innerHTML =
                    '<h2>Are we missing a city in ' +
                      (provRSB.el.value ? provRSB.el.value + ', ' : '') +
                      countryRSB.el.value + '?' +
                    '</h2>' +
                    '<p>Enter valid major cities only.</p>' +
                    '<form>' +
                        '<p><label>Name:<br><input type="text" name="name"></label></p>' +
                        '<p>' +
                            '<input type="submit" value="Save">' +
                            ' or <a href="javascript:;">cancel</a>' +
                        '</p>' +
                    '</form>';

                pb.addEvent(newCityContainer.getElementsByTagName('a')[0], 'click', cityRSB.hideAddNewForm);

                // we don't use the addEvent element because we can only cancel submit
                // if we add our listener like this...
                newCityContainer.getElementsByTagName('form')[0].onsubmit = newCitySubmitHandler;

                return newCityContainer;
            }

            function newCitySubmitHandler() {
                var name = pb.getVal(newCityContainer.getElementsByTagName('input')[0]);

                if (!name) { alert("City name is required"); return false; }

                pb.addClass(newCityContainer, 'loading');

                var data = {mod:'region2', op:'addCity', iC: countryRSB.hiddenEl.value, iP: provRSB.hiddenEl.value, name: name}
                pb.rmsSend(data, success);

                function success(data) {
                    cityRSB.addDataItem({name: name, id: data.rmsD.data.id});
                    cityRSB.hideAddNewForm();
                    cityRSB.search(name);
                }

                return false;
            }

            function newRegionForm() {
                if (newRegionContainer) return newRegionContainer;

                newRegionContainer = document.createElement('div');
                newRegionContainer.innerHTML =
                    '<h2>Are we missing a Sub Region in ' +
                      (provRSB.el.value ? provRSB.el.value + ', ' : '') +
                      countryRSB.el.value + '?' +
                    '</h2>' +
                    '<p>Sub regions are commonly known geopgrahic areas within a province or state.</p>' +
                    '<p>country -> province -> <b>sub region 1</b> -> <b>sub region 2</b> -> city -> riding area</p>' +
                    '<a href="https://www.trailforks.com/contribute/region/" target="_blank">add a new sub-region here</a>' +
                    '<br /><br />';
                pb.addEvent(newRegionContainer.getElementsByTagName('a')[0], 'click', region2RSB.hideAddNewForm);

                return newRegionContainer;
            }

            function newRidingareaForm() {
                if (newRidingareaContainer) return newRidingareaContainer;

                newRidingareaContainer = document.createElement('div');
                newRidingareaContainer.innerHTML =
                    '<h2>Are we missing a Riding Area in ' +
                      (provRSB.el.value ? provRSB.el.value + ', ' : '') +
                      countryRSB.el.value + '?' +
                    '</h2>' +
                    '<p>Riding areas or trail networks are groups of trails and are at the bottom of the region hierarchy.</p>' +
                    '<p>country -> province -> sub region 1 -> sub region 2 -> city -> <b>riding area</b></p>' +
                    '<a href="https://www.trailforks.com/contribute/region/" target="_blank">add a new riding area here</a>' +
                    '<br /><br />';
                pb.addEvent(newRidingareaContainer.getElementsByTagName('a')[0], 'click', ridingareaRSB.hideAddNewForm);

                return newRidingareaContainer;
            }

        }
    };
