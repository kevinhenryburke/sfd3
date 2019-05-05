(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bzhierarchytreemap = global.bzhierarchytreemap || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: bzhierarchytreemap IIFE");


    function getRootStructureTreeMap  (storeObject) {

        return function(datajson) { 

            let treemap = d3.treemap()
                .size([bzchart.getStore (storeObject, "width") - 20, bzchart.getStore (storeObject, "height") - 4])
                .round(true)
                .padding(1);

            let root = d3.hierarchy(datajson) // <-B
                .sum((d) =>  bzchart.getFromMeasureScheme(storeObject, d, "Value"))
                .sort((a, b) => b.value - a.value);

            bzchart.setStore (storeObject, "root", root) ;  

            return treemap(root);
        };
    }        

    function renderCells (storeObject, cells) {
        let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;

        let cellEnter = cells.enter().append("g")
            .merge(cells)
            .attr("class", "cell")
            .attr("transform", function (d) {
                return "translate(" + d.x0 + "," + d.y0 + ")"; //<-E
            })
            .attr("id", d => d.id)
            .on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
                console.log("chartHierarchyTreeMapHelper.mouseover enter");
                bzchart.setStore (storeObject, "mouseoverRecordId", d.id ) ;
                let preppedEvent = variantsMixin.nodeMouseover(storeObject, d);
                bzaura.publishPreppedEvent(storeObject,preppedEvent,$A.get("e.c:evt_sfd3"));
            }))
        ;

        bzhierarchytreemap.renderRect(cellEnter, cells);

        bzhierarchytreemap.renderText(cellEnter, cells);

        cells.exit().remove();
    }

    function renderRect(cellEnter, cells) {
        let _colors = d3.scaleOrdinal(d3.schemeCategory20c);
        cellEnter.append("rect");
        cellEnter.merge(cells)
            .transition()
            .select("rect")
            .attr("width", function (d) { //<-F
                return d.x1 - d.x0;
            })
            .attr("height", function (d) {
                return d.y1 - d.y0;
            })
            .style("fill", function (d) {
                return _colors(d.parent.data.name); //<-G
            });
    }

    function renderText (cellEnter, cells) {
        cellEnter.append("text");
        cellEnter.merge(cells)
            .select("text") //<-H
            .style("font-size", 9)
            .attr("x", function (d) {
                return (d.x1 - d.x0) / 2;
            })
            .attr("y", function (d) {
                return (d.y1 - d.y0) / 2;
            })
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d.data.name;
            })
            .style("opacity", function (d) {
                d.w = this.getComputedTextLength();
                return d.w < (d.x1 - d.x0) ? 1 : 0; //<-I
            });
    } 


exports.getRootStructureTreeMap = getRootStructureTreeMap;
exports.renderCells = renderCells;
exports.renderRect = renderRect;
exports.renderText = renderText;


Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: bzhierarchytreemap  IIFE");

})));

