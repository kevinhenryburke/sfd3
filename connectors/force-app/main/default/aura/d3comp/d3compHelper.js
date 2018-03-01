({

    /* CHART methods - Initialize */

    // called by initializeData
    transform: function(component, d) {
        var _this = this;
        var dx = _this.limitborderx(component, d.x);
        var dy = _this.limitbordery(component, d.y);
        var retVal = "translate(" + dx + "," + dy + ")";
        return retVal;
    },

    // called by initializeData -> transform
    limitborderx: function(component, x) {
        var width = component.get("v.width");
        return Math.max(Math.min(x, width), 20);
    },

    // called by initializeData -> transform
    limitbordery: function(component, y) {
        var height = component.get("v.height");
        return Math.max(Math.min(y, height - 50), 20 );
    },    

    // called by initializeData -> transform
    initializeData: function(component, datastring) {
        var _this = this;
        var initialized = component.get("v.initialized");
        console.log("init:initialized: " + initialized);

        if (initialized != true) {

            console.log("init:initializing .... ");
            var svg = component.get("v.svg");
            var sfd3nodes = component.get("v.sfd3nodes");
            var sfd3paths = component.get("v.sfd3paths");
            var sfd3force = component.get("v.sfd3force");

            var chartArea = d3.select("#chartarea");
            var width = component.get("v.width") / 2;
            var height = component.get("v.height") / 2;


            // Styling of tooltips - see GitHub prior to Feb 24, 2018
            var nodeToolTipDiv = d3.select("#nodeToolTip");
            var pathToolTipDiv = d3.select("#pathToolTip");
            
            // underlying data parsed to JSON object
            var datajson = JSON.parse(datastring);
            component.set("v.datajson", datajson);

            // underlying config parsed to JSON object
            // TODO - read from Design Parameter
            var configjson = 
                {"filtertypes":["coworker","social","client"]
                ,"measures":["Posts","Hot"]
                ,"levels":4
                ,"centreonclick":true};
            
            component.set("v.configjson", configjson);
            
            console.log('datajson');
            console.log(datajson);
            console.log('configjson');
            console.log(configjson);

            // set the first measure as default
            var currentmeasure = configjson.measures[0];
            component.set("v.currentmeasure", currentmeasure);

            // set the maximum number of levels
            var maxlevels = configjson.levels;
            console.log("maxlevels:" + maxlevels);
            if ((typeof maxlevels === 'number'))
            {
                console.log("setting maxlevels from configuration: " + maxlevels);
                component.set("v.maxlevels", maxlevels);          
            }  
            else
            {
                console.log("using default maxlevels ");
            }

            /* primary node */
            var primaryid = datajson.nodes[0].id;
            component.set("v.primaryid", primaryid);

            // Compute the distinct nodes from the links.
            datajson.links.forEach(function(link) {
                link.source = datajson.nodes[link.source];
                link.target = datajson.nodes[link.target];
            });

            var clickedfilters = component.get("v.clickedfilters");
            configjson.filtertypes.forEach(function(filtertype) {
                clickedfilters.push(filtertype);
            });
            component.set("v.clickedfilters", clickedfilters);

            sfd3force = d3.layout.force()
                .nodes(d3.values(datajson.nodes))
                .links(datajson.links)
                .size([width, height])
                .linkDistance(200)
                .charge(-800)
                .on("tick", function() {
                    sfd3paths.attr("d", function(d) {
                        var sx = _this.limitborderx(component, d.source.x);
                        var sy = _this.limitbordery(component, d.source.y);
                        var tx = _this.limitborderx(component, d.target.x);
                        var ty = _this.limitbordery(component, d.target.y);
                        var dx = tx - sx;
                        var dy = ty - sy;
                        var dr = Math.sqrt(dx * dx + dy * dy);
                        return "M" + sx + "," + sy + "A" + dr + "," + dr + " 0 0,1 " + tx + "," + ty;
                    });
                    sfd3nodes.attr("transform", function(d) {
                        return _this.transform(component, d);
                    });

                    var text = component.get("v.text");
                    text.attr("transform", function(d) {
                        return _this.transform(component, d);
                    });
                    component.set("v.text", text);
                })
                .start();

            var initialized = component.get("v.initialized");
            if (initialized != true) {
                component.set("v.initialized", true);
            }


            // Per-type markers, as they don't inherit styles.
            // KB not sure what benefit this is giving

            svg.append("defs").selectAll("marker")
                .data(configjson.filtertypes)
                .enter().append("marker")
                .attr("id", function(d) {
                    return d;
                })
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 15)
                .attr("refY", -1.5)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M0,-5L10,0L0,5");

            sfd3paths = svg.append("g").selectAll("path")
                .data(sfd3force.links())
                .enter().append("path")
                .attr("class", function(d) {
                    return "link " + d.type;
                })
                .attr("stroke", function(d) {
                    return d.stroke;
                })
                .attr("id", function(d) {
                    return d.id;
                })
                .attr("marker-end", function(d) {
                    return "url(#" + d.type + ")";
                })
                // This is the previous implementation of tooltip
                //            .on('mouseover', pathtip.show)
                //            .on('mouseout', pathtip.hide);
                .on('mouseout', function(d) { // hide the div
                    var showPathToolTip = component.get("v.showPathToolTip");
                    console.log("showPathToolTip: " + showPathToolTip);
                    if (showPathToolTip) {
                        pathToolTipDiv.transition()
                            .delay(6000)
                            .duration(2000)
                            .style("opacity", 0);
                    }
                })
                .on('mouseover', function(d) { 
                    var showPathToolTip = component.get("v.showPathToolTip");
                    console.log("showPathToolTip: " + showPathToolTip);
                    if (showPathToolTip) {
                        // "this" here is a path DOM element so use its id to match up with a d3 path
                        if (component.get("v.showPathToolTip"))
                        {
                            var mouseoverpathid = this.id;

                            sfd3paths.style("stroke", function(o, i) {
                                if (o.id === mouseoverpathid) {
                                    return "red";
                                }
                                else
                                {
                                    return "gray";
                                }
                            });
                    
                            var midx = (d.source.x + d.target.x) / 2
                            var midy = (d.source.y + d.target.y) / 2

                            var content = '<div style="text-align:center;font-size:"6px";>';
                            content += '<p>Type: ' + d.type + '</p>';
                            content += '<p>Linked By ' + d.createdby + '</p>';
                            content += '<p>Notes: ' + d.notes + '</p>';
                            content += '</div>';

                            pathToolTipDiv.transition()
                                .duration(100)
                                .style("opacity", .9);
                            pathToolTipDiv.html(content)
                                .style("left", midx + "px")
                                .style("top", midy + "px");
                        }
                    }
                })

            sfd3nodes = svg.append("g").selectAll("circle")
                .data(sfd3force.nodes())
                .enter().append("circle")
                // set data related attributes - visual styling is applied later
                .attr("id", function(d) {
                    return d.id;
                })
                // This is the previous implementation of tooltip - see pictor.js
                //            .on('mouseover', tip.show)
                //            .on('mouseout', tip.hide)
                .on('mouseout', function(d) { // hide the div
                //    nodeToolTipDiv.transition()
                //        .duration(2000)
                //        .style("opacity", 0);

                    // TODO - add an attribute if want to remove details.
                    // Need to be abstracted - so card vars are provided to this visualization

                    if (!component.get("v.retainNodeDetalsMouseOut"))
                    {
                        component.set("v.card1", d.name);
                        // styling svg text content: http://tutorials.jenkov.com/svg/tspan-element.html
                        var textcontent = '<tspan x="10" y="0" style="font-weight: bold;">' + component.get("v.card1") ;
                        textcontent += '</tspan>'; 

                        var t = d3.select("#t" + d.id);
                        t.html(textcontent);
                        var s = d3.select("#s" + d.id);
                        s.html(textcontent);
                    }
                })
                .on('mouseover', function(d) { // card populate
                    // Need to be abstracted - so card vars are provided to this visualization
                    component.set("v.card1", d.name);
                    component.set("v.card2", d.position);
                    component.set("v.card3", d.account);
                    component.set("v.card4", d.id);
                    component.set("v.cardSelected", true);

                    // styling svg text content: http://tutorials.jenkov.com/svg/tspan-element.html
                    var textcontent = '<tspan x="10" y="0" style="font-weight: bold;">' + component.get("v.card1") ;
                    textcontent += '</tspan>'; 
                    textcontent += '<tspan x="10" dy="15">' + component.get("v.card2");
                    textcontent += ' (' + component.get("v.card3") + ')</tspan>';

                    var t = d3.select("#t" + d.id);
                    t.html(textcontent);
                    var s = d3.select("#s" + d.id);
                    s.html(textcontent);

                    // Tooltips via a fixed div that moves has some issues with box edges etc. Could cause problems in future but this was attempt

                    // var content = '<div style="text-align:center;">';
                    // content += '<p><span>' + d.name + '</span></p>';
                    // //    content += '<hr class="tooltip-hr">';
                    // content += '<div><img src="https://upload.wikimedia.org/wikipedia/commons/4/4f/Anna_Netrebko_-_Romy_2013_a.jpg" height="60" width="60" alt="No image available" align="centre"></div>';
                    // content += '<p>' + d.position + ' (' + d.account + ')</p>';
                    // content += '</div>';

                    // nodeToolTipDiv.transition()
                    //     .duration(200)
                    //     .style("opacity", .9)
                    //     .style("left", d.x + "px")
                    //     .style("top", d.y + "px");
                    // nodeToolTipDiv.html(content)
                    //     .style("left", d.x + "px")
                    //     .style("top", d.y + "px");
                })
                .on('click', function(d) {

                    var isiOS = component.get("v.isiOS");

                    if (isiOS) {
                        var now = new Date().getTime();
                        var lastTouch = component.get("v.lastTouch");

                        var delta = now - lastTouch;

                        if (delta < 350 && delta > 0) {
                            // the second touchend event happened within half a second. Here is where we invoke the double tap code
                            var win = window.open("http://news.bbc.co.uk");
                            win.focus();
                        }
                        component.set("v.lastTouch", lastTouch);
                    } else {
                        console.log("not iOS");
                    }
                    // reset the clicked node to be the primary
                    component.set("v.primaryid", d.id);
                    _this.refreshVisibility(component);
                })
                .on('dblclick', function(d) {
                    var win = window.open("/" + d.id, '_blank');
                    win.focus();

                })
                .call(sfd3force.drag);

            var text = component.get("v.text");

            text = svg.append("svg:g")
                .selectAll("g")
                .data(sfd3force.nodes())
                .enter().append("svg:g")
                .attr("class", "nodeText");

            // A copy of the text with a thick white stroke for legibility.
            text.append("svg:text")
                .attr("x", 8)
                .attr("y", ".31em")
                .attr("class", "shadow")
                .attr("id", function(d) {
                    return "s" + d.id;
                })
                .text(function(d) {
                    return d.name;
                });

            text.append("svg:text")
                .attr("x", 8)
                .attr("y", ".31em")
                .attr("id", function(d) {
                    return "t" + d.id;
                })
                .text(function(d) {
                    return d.name;
                });


            component.set("v.text", text);

            component.set("v.sfd3nodes", sfd3nodes);
            component.set("v.sfd3paths", sfd3paths);
            component.set("v.sfd3force", sfd3force);

            console.log("apply node styling");
            _this.styleNodes(component, currentmeasure);

            console.log("apply node visibility");
            _this.refreshVisibility(component);
            
        }
        console.log("exit init");
    },

    /* CHART methods - Refresh */


    refreshVisibility_LevelsFewer: function(component) {
        console.log("enter refreshVisibility_LevelsMore");
        var _this = this;
        _this.refreshVisibility(component);
    },

    refreshVisibility_LevelsMore: function(component) {
        console.log("enter refreshVisibility_LevelsMore");
        var _this = this;
        _this.refreshVisibility(component);
    },
    
    refreshVisibility: function(component) {

        console.log("Enter refreshVisibility");

        var _this = this;

        // change the visibility of the connection path

        // "v.currentmeasure", "v.showlevels", "v.clickedfilters" - belong to control panel - should be fed in
        var sfd3nodes = component.get("v.sfd3nodes");
        var sfd3paths = component.get("v.sfd3paths");

        // "v.sfd3nodes" / "v.sfd3paths" - belong to the chart
        var levels = component.get("v.showlevels");
        var clickedfilters = component.get("v.clickedfilters");
        var currentmeasure = component.get("v.currentmeasure");

        var shownodeids = [];
        var relatedNodes = _this.getRelatedNodes(component, levels);

        sfd3paths.style("visibility", function(o) {

            var retval = "hidden";
            var sourcevis = o.source.measures[currentmeasure].visible;
            var targetvis = o.target.measures[currentmeasure].visible;

            var sourceindex = relatedNodes.indexOf(o.source.id);
            var targetindex = relatedNodes.indexOf(o.target.id);

            var primaryrelated = (sourceindex > -1 && targetindex > -1);

            if ((sourcevis === 1) && (targetvis === 1) && primaryrelated) {

                var index = clickedfilters.indexOf(o.type);

                if (index > -1) {
                    console.log('for: ' + o.source.name + '/' + o.target.name + " return TRUE");

                    var indexsource = shownodeids.indexOf(o.source.id);
                    if (indexsource == -1) {
                        shownodeids.push(o.source.id);
                    }

                    var indextarget = shownodeids.indexOf(o.target.id);
                    if (indextarget == -1) {
                        shownodeids.push(o.target.id);
                    }
                }
            }

            return (index > -1) ? "visible" : "hidden";
        });

        // change the visibility of the node
        // if all the links with that node are invisibile, the node should also be invisible
        // otherwise if any link related to that node is visibile, the node should be visible
        sfd3nodes.style("visibility", function(o, i) {
            var index = shownodeids.indexOf(o.id);
            if (index > -1) {
                d3.select("#t" + o.id).style("visibility", "visible");
                d3.select("#s" + o.id).style("visibility", "visible");
                return "visible";
            } else {
                d3.select("#t" + o.id).style("visibility", "hidden");
                d3.select("#s" + o.id).style("visibility", "hidden");
                return "hidden";
            }
        });

        // TODO - needed? Unlikely
        component.set("v.sfd3nodes", sfd3nodes);
        component.set("v.sfd3paths", sfd3paths);

        _this.styleNodes(component, currentmeasure);
    },


    getRelatedNodes: function(component, level) {

        var looplevel = 0;

        var primaryid = component.get("v.primaryid");

        var linkednodes = [primaryid];

        while (looplevel < level) {
            var newnodes = [];
            looplevel++;

            var sfd3paths = component.get("v.sfd3paths");

            sfd3paths.each(function(p) {
                    // if the source node is 
                var sourceindex = linkednodes.indexOf(p.source.id);
                var targetindex = linkednodes.indexOf(p.target.id);
                    if (sourceindex === -1 && targetindex > -1) {
                        newnodes.push(p.source.id);
                    }
                    if (targetindex === -1 && sourceindex > -1) {
                        newnodes.push(p.target.id);
                    }
            });

            var arrayLength = newnodes.length;

            for (var i = 0; i < newnodes.length; i++) {
            var index = linkednodes.indexOf(newnodes[i]);
                if (index === -1) {
                    linkednodes.push(newnodes[i]);
                }
            }

        }
        return linkednodes;
    },

    // Method to resize nodes
    styleNodes: function(component, aType) {
        // change the visibility of the connection path
        console.log("styleNodes : " + aType);

        var sfd3nodes = component.get("v.sfd3nodes");

        sfd3nodes.attr("r", function(o, i) {
            return o.measures[aType].radius;
        });

        sfd3nodes.style("fill", function(o, i) {
            return o.measures[aType].color;
        });

        sfd3nodes.style("stroke", function(o, i) {
            var primaryid = component.get("v.primaryid");
            if (o.id == primaryid) {
                return "gold";
            }
            return o.stroke;
        });

        sfd3nodes.style("stroke-width", function(o, i) {
            var primaryid = component.get("v.primaryid");
            if (o.id == primaryid) {
                return "10px";
            }
            var sfd3nodesstrokewidth = component.get("v.sfd3nodesstrokewidth");
            return sfd3nodesstrokewidth;
        });
    },

    /* BUTTON methods */
    
    setConnectionLevelFewerButtons: function(component) {
        console.log("enter setConnectionLevelFewer");
        var showlevels = component.get("v.showlevels");
        // "more" button should be enabled, "less" button should be disabled if we've reached lowest level
        var cmpTargetMore = component.find("more");
        cmpTargetMore.set("v.disabled", "false");
        if (showlevels == 1) {
            var cmpTargetLess = component.find("less");
            cmpTargetLess.set("v.disabled", "true");
        }
    },

    setConnectionLevelMoreButtons: function(component) {
        console.log("enter setConnectionLevelMoreButtons");
        var showlevels = component.get("v.showlevels");
        var maxlevels = component.get("v.maxlevels");
        
            // refresh buttons
        // "less" button should be enabled, "more" button should be disabled if we've reached max level
        var cmpTargetLess = component.find("less");
        cmpTargetLess.set("v.disabled", "false");
        if (showlevels >= maxlevels) {
            var cmpTargetMore = component.find("more");
            cmpTargetMore.set("v.disabled", "true");
        }
    },

    setMeasure: function(component, measureIndex) {
        var configjson = component.get("v.configjson");
        var thisMeasure = configjson.measures[measureIndex - 1];
        console.log("setMeasure: Measure=" + thisMeasure);
        component.set("v.currentmeasure", thisMeasure);
    },

    setThisLinkType: function(component, indexer) {
        var cmpTarget = component.find('b' + indexer);
        $A.util.toggleClass(cmpTarget, 'slds-button_neutral');
        $A.util.toggleClass(cmpTarget, 'slds-button_brand');
        var isClicked = $A.util.hasClass(cmpTarget, 'slds-button_brand');
        var configjson = component.get("v.configjson");
        var thisType = configjson.filtertypes[indexer - 1];
        this.setLinkType(component, thisType, isClicked);
    },

    setLinkType: function(component, thisType, isClicked) {
        var _this = this;
        var clickedfilters = component.get("v.clickedfilters");
        if (isClicked) {
            clickedfilters.push(thisType);
        } else {
            var index = clickedfilters.indexOf(thisType);
            if (index > -1) {
                clickedfilters.splice(index, 1);
            }
        }
        component.set("v.clickedfilters", clickedfilters);
        _this.refreshVisibility(component);
    },

    formatButtons: function(component, arrayNames, idprefix, maxbuttons) {
        var _this = this;
        var arrayNamesLength = arrayNames.length;
        var index = 0;

        arrayNames.forEach(function(filtertype) {
            if (index < arrayNamesLength) {
                index++;
                var cmpTarget = component.find(idprefix + index);
                cmpTarget.set("v.label", filtertype);
            }
        });
        // clean up unused buttons
        for (; index < maxbuttons;) {
            index++;
            var cmpTarget = component.find(idprefix + index);
            cmpTarget.set("v.show", "false");
        }
    },

    updateButtonStyles: function(cmp, prefix, selectedIndex, numberOfButtons) {
        var selectedButtonLabel = prefix + selectedIndex;

        console.log("updateButtonStyles: other than " + selectedButtonLabel);
        for (i = 1; i <= numberOfButtons; i++) { 
            var iteratedButtonLabel = prefix + i;
            var cmpTarget = cmp.find(iteratedButtonLabel);
            if (selectedButtonLabel != iteratedButtonLabel) {
                $A.util.addClass(cmpTarget, 'slds-button_neutral');
                $A.util.removeClass(cmpTarget, 'slds-button_brand');
            }
            else {
                $A.util.addClass(cmpTarget, 'slds-button_brand');
                $A.util.removeClass(cmpTarget, 'slds-button_neutral');
            }
        }
    },

    /* BUTTON / Publish Events */

    publishEvent : function(topic, parameters) {
        var appEvent = $A.get("e.c:evt_sfd3");
        appEvent.setParams({
            "topic" : topic,
            "parameters" : parameters
        });
        appEvent.fire();
    }


/*    
    linkArc: function(d) {
        console.log("enter linkArc");

        var _this = this;
        var sx = limitborderx(component, d.source.x);
        var sy = limitbordery(component, d.source.y);
        var tx = limitborderx(component, d.target.x);
        var ty = limitbordery(component, d.target.y);
        var dx = tx - sx;
        var dy = ty - sy;
        var dr = Math.sqrt(dx * dx + dy * dy);
        return "M" + sx + "," + sy + "A" + dr + "," + dr + " 0 0,1 " + tx + "," + ty;
    },
*/



})