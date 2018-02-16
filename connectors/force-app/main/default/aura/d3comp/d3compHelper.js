({

    transform: function(component, d) {
        var _this = this;
        var dx = _this.limitborderx(component, d.x);
        var dy = _this.limitbordery(component, d.y);
        var retVal = "translate(" + dx + "," + dy + ")";
        return retVal;
    },

    limitborderx: function(component, x) {
        var width = component.get("v.width");
        return Math.min(x, width);
    },

    limitbordery: function(component, y) {
        var height = component.get("v.height");
        return Math.max(Math.min(y, height - 50), 50);
    },

    // delete this
    testmeth: function() {
        return 0;
    },


    init: function(component, inputjson) {
        var _this = this;
        console.log("in init helper function");


        var initialized = component.get("v.initialized");
        console.log("init:initialized: " + initialized);

        if (initialized != true) {

            console.log("init:initializing .... ");

            var svg = component.get("v.svg");
            var sfd3node = component.get("v.sfd3node");
            var sfd3path = component.get("v.sfd3path");
            var sfd3force = component.get("v.sfd3force");

            var chartArea = d3.select("#chartarea");
            var width = component.get("v.width");
            var height = component.get("v.height");

            // TODO: put the styles in a class
            
            var nodeToolTipDiv = chartArea
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0)
                .style("position", "relative")
                .style("text-align", "center")
                .style("width", "60px")
                .style("height", "28px")
                .style("padding", "2px")
                .style("font", "12px sans-serif")
                .style("background", "lightsteelblue")
                .style("border", "0px")
                .style("border-radius", "8px")
                .style("pointer-events", "none");

            // TODO: put the styles in a class
            var pathToolTipDiv = chartArea
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0)
                .style("position", "relative")
                .style("text-align", "center")
                .style("width", "60px")
                .style("height", "28px")
                .style("padding", "2px")
                .style("font", "12px sans-serif")
                .style("background", "lightsteelblue")
                .style("border", "0px")
                .style("border-radius", "8px")
                .style("pointer-events", "none");


            // underlying data parsed to JSON object
            var datajson = JSON.parse(inputjson);
            component.set("v.datajson", datajson);

            console.log(datajson);

            // set the first measure as default

            var measure = datajson.measures[0];
            component.set("v.currentmeasure", measure);

            /* primary node */
            var primaryid = datajson.nodes[0].id;
            component.set("v.primaryid", primaryid);

            // Compute the distinct nodes from the links.
            datajson.links.forEach(function(link) {
                link.source = datajson.nodes[link.source];
                link.target = datajson.nodes[link.target];
            });

            var clickedfilters = component.get("v.clickedfilters");
            datajson.filtertypes.forEach(function(filtertype) {
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
                    sfd3path.attr("d", function(d) {
                        var sx = _this.limitborderx(component, d.source.x);
                        var sy = _this.limitbordery(component, d.source.y);
                        var tx = _this.limitborderx(component, d.target.x);
                        var ty = _this.limitbordery(component, d.target.y);
                        var dx = tx - sx;
                        var dy = ty - sy;
                        var dr = Math.sqrt(dx * dx + dy * dy);
                        return "M" + sx + "," + sy + "A" + dr + "," + dr + " 0 0,1 " + tx + "," + ty;
                    });
                    sfd3node.attr("transform", function(d) {
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
                .data(datajson.filtertypes)
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

            sfd3path = svg.append("g").selectAll("path")
                .data(sfd3force.links())
                .enter().append("path")
                .attr("class", function(d) {
                    return "link " + d.type;
                })
                .attr("stroke", function(d) {
                    return d.stroke;
                })
                .attr("marker-end", function(d) {
                    return "url(#" + d.type + ")";
                })
                // This is the previous implementation of tooltip
                //            .on('mouseover', pathtip.show)
                //            .on('mouseout', pathtip.hide);
                .on('mouseout', function(d) { // hide the div
                    pathToolTipDiv.transition()
                        .duration(200)
                        .style("opacity", 0);
                })
                .on('mouseover', function(d) { // card populate

                    console.log(d.stroke);

                    var midx = (d.source.x + d.target.x) / 2
                    var midy = (d.source.y + d.target.y) / 2

                    var content = '<div style="text-align:center;font-size:"6px";>';
                    content += '<p>Type: ' + d.type + '</p>';
                    content += '<p>Linked By ' + d.createdby + '</p>';
                    content += '<p>Notes: ' + d.notes + '</p>';
                    content += '</div>';

                    pathToolTipDiv.transition()
                        .duration(200)
                        .style("opacity", .9);
                    pathToolTipDiv.html(content)
                        .style("left", midx + "px")
                        .style("top", midy + "px");
                })

            sfd3node = svg.append("g").selectAll("circle")
                .data(sfd3force.nodes())
                .enter().append("circle")
                .attr("r", function(d) {
                    return d.measures[measure].radius;
                })
                .attr("fill", function(d) {
                    return d.measures[measure].color;
                })
                .attr("id", function(d) {
                    return d.id;
                })
                // This is the previous implementation of tooltip - see pictor.js
                //            .on('mouseover', tip.show)
                //            .on('mouseout', tip.hide)
                .on('mouseout', function(d) { // hide the div
                    nodeToolTipDiv.transition()
                        .duration(200)
                        .style("opacity", 0);
                })
                .on('mouseover', function(d) { // card populate
                    component.set("v.card1", d.name);
                    component.set("v.card2", d.position);
                    component.set("v.card3", d.account);
                    component.set("v.card4", d.id);
                    component.set("v.cardSelected", true);

                    var content = '<div style="text-align:center;">';
                    content += '<p><span>' + d.name + '</span></p>';
                    //    content += '<hr class="tooltip-hr">';
                    content += '<div><img src="https://upload.wikimedia.org/wikipedia/commons/4/4f/Anna_Netrebko_-_Romy_2013_a.jpg" height="60" width="60" alt="No image available" align="centre"></div>';
                    content += '<p>' + d.position + ' (' + d.account + ')</p>';
                    content += '</div>';


                    nodeToolTipDiv.transition()
                        .duration(200)
                        .style("opacity", .9);
                    nodeToolTipDiv.html(content)
                        .style("left", d.x + "px")
                        .style("top", d.y + "px");
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
                    //              primaryid = d.id;
                    component.set("v.primaryid", d.id);
                    _this.filterGraph(component);
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

            component.set("v.sfd3node", sfd3node);
            component.set("v.sfd3path", sfd3path);
            component.set("v.sfd3force", sfd3force);

        }
        console.log("exit init");
    },

    // Method to filter graph
    filterGraph: function(component) {

        console.log("Enter filterGraph");

        var _this = this;
        // change the visibility of the connection path

        var measure = component.get("v.currentmeasure");
        var sfd3node = component.get("v.sfd3node");
        var sfd3path = component.get("v.sfd3path");

        var shownodeids = [];

        var levels = component.get("v.levels");
        var relatedNodes = _this.getRelatedNodes(component, levels);

        sfd3path.style("visibility", function(o) {

            var retval = "hidden";
            var sourcevis = o.source.measures[measure].visible;
            var targetvis = o.target.measures[measure].visible;

            var sourceindex = relatedNodes.indexOf(o.source.id);
            var targetindex = relatedNodes.indexOf(o.target.id);

            var primaryrelated = (sourceindex > -1 && targetindex > -1);

            if ((sourcevis === 1) && (targetvis === 1) && primaryrelated) {

                var clickedfilters = component.get("v.clickedfilters");
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
        sfd3node.style("visibility", function(o, i) {

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

        component.set("v.sfd3node", sfd3node);
        component.set("v.sfd3path", sfd3path);

        _this.resizeNodes(component, measure);
    },

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



    getRelatedNodes: function(component, level) {

        var looplevel = 0;

        var primaryid = component.get("v.primaryid");

        var linkednodes = [primaryid];

        while (looplevel < level) {
            var newnodes = [];
            looplevel++;

            var sfd3path = component.get("v.sfd3path");

            sfd3path.each(function(p) {

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
    resizeNodes: function(component, aType) {
        // change the visibility of the connection path
        console.log("resizeNodes : " + aType);

        var sfd3node = component.get("v.sfd3node");

        // change the size of the node 

        sfd3node.attr("r", function(o, i) {
            return o.measures[aType].radius;
        });

        sfd3node.style("fill", function(o, i) {
            return o.measures[aType].color;
        });


        sfd3node.style("stroke", function(o, i) {
            var primaryid = component.get("v.primaryid");
            if (o.id == primaryid) {
                return "gold";
            }
            return o.stroke;
        });

        sfd3node.style("stroke-width", function(o, i) {
            var primaryid = component.get("v.primaryid");
            if (o.id == primaryid) {
                return "10px";
            }
            var sfd3nodestrokewidth = component.get("v.sfd3nodestrokewidth");
            return sfd3nodestrokewidth;
        });

        component.set("v.sfd3node", sfd3node);

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
        _this.filterGraph(component);

    },

    setConnectionLevel: function(component, d) {
        var _this = this;

        var levels = component.set("v.levels", d);
        _this.filterGraph(component);
        var elementid = 'l' + d;
        var cmpTarget = component.find(elementid);
        $A.util.toggleClass(cmpTarget, 'slds-button--neutral');
        $A.util.toggleClass(cmpTarget, 'slds-button--brand');
        this.clearOtherLevels(component, elementid);
    },

    setConnectionLevelLess: function(component) {
        var _this = this;

        var levels = component.get("v.levels");

        if (levels > 1) {
            var newlevels = levels - 1;
            var levels = component.set("v.levels", newlevels);
            _this.filterGraph(component);
        }
        var cmpTargetMore = component.find("more");
        cmpTargetMore.set("v.disabled", "false");
        if (levels == 1) {
            var cmpTargetLess = component.find("less");
            cmpTargetLess.set("v.disabled", "true");
        }

    },

    setConnectionLevelMore: function(component) {

        console.log("enter setConnectionLevelMore");

        var _this = this;

        //TODO need to set a maximum levels?? Might be hard .. - currently got a default of 4

        var levels = component.get("v.levels");
        console.log("levels");
        console.log(levels);

        if (levels < 4) {
            console.log("increasing levels to");
            var newlevels = levels + 1;
            console.log(newlevels);
            var levels = component.set("v.levels", newlevels);
            _this.filterGraph(component);
        }
        var cmpTargetLess = component.find("less");
        cmpTargetLess.set("v.disabled", "false");
        if (levels == 4) {
            var cmpTargetMore = component.find("more");
            cmpTargetMore.set("v.disabled", "true");
        }
    },

    setMeasureAndRefresh: function(component, d) {
        var _this = this;
        console.log("setMeasureAndRefresh: Measure=" + d);
        component.set("v.currentmeasure", d);
        _this.filterGraph(component);
    },

    setThislinkshipType: function(component, indexer) {
        var cmpTarget = component.find('b' + indexer);
        $A.util.toggleClass(cmpTarget, 'slds-button--neutral');
        $A.util.toggleClass(cmpTarget, 'slds-button--brand');
        var isClicked = $A.util.hasClass(cmpTarget, 'slds-button--brand');
        var datajson = component.get("v.datajson");
        var thisType = datajson.filtertypes[indexer - 1];
        this.setlinkshipType(component, thisType, isClicked);
    },

    setMeasure: function(component, indexer) {
        var idprefix = 'v' + indexer;
        var cmpTarget = component.find(idprefix);
        var datajson = component.get("v.datajson");
        var thisMeasure = datajson.measures[indexer - 1];

        this.setMeasureAndRefresh(component, thisMeasure);
        var cmpTarget = component.find(idprefix);
        $A.util.toggleClass(cmpTarget, 'slds-button--neutral');
        $A.util.toggleClass(cmpTarget, 'slds-button--brand');
        this.clearOtherSizes(component, idprefix);
    },

    setlinkshipType: function(component, thisType, isClicked) {
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
        _this.filterGraph(component);
    },

    clearOtherLevels: function(cmp, b) {
        if (b != 'l1') {
            var cmpTarget = cmp.find('l1');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
        }
        if (b != 'l2') {
            var cmpTarget = cmp.find('l2');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
        }
        if (b != 'l3') {
            var cmpTarget = cmp.find('l3');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
        }
        if (b != 'l4') {
            var cmpTarget = cmp.find('l4');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
        }
    },

    clearOtherSizes: function(cmp, b) {
        if (b != 'v1') {
            var cmpTarget = cmp.find('v1');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
        }
        if (b != 'v2') {
            var cmpTarget = cmp.find('v2');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
        }
        if (b != 'v3') {
            var cmpTarget = cmp.find('v3');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
        }
        if (b != 'v4') {
            var cmpTarget = cmp.find('v4');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
        }
        if (b != 'v5') {
            var cmpTarget = cmp.find('v5');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
        }
    }

})