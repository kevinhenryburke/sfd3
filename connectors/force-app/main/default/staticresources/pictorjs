console.log("loading: pictor.js v23");

// data
var datajson;

// ui
var clickedfilters = [];
var width = Math.min(screen.width, screen.height);
var height = Math.min(screen.width, screen.height);
var midx = width / 2;
var midy = height / 2;
var circlestrokewidth = "0.5px";
var levels = 1;

var isiOS = false;
var agent = navigator.userAgent.toLowerCase();
if(agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0){
       isiOS = true;
}

// set the first measure as default
var measure;

/* primary node */

var primaryid;

var initialized = false;

var force;

var text;
var circle;
var path;



var lastTouch = new Date().getTime();

// from http://labratrevenge.com/d3-tip/javascripts/d3.tip.v0.6.3.js
// d3-tip code - will need to externalise in own library

// d3.tip
// Copyright (c) 2013 Justin Palmer
//
// Tooltips for d3.js SVG visualizations

// Public - contructs a new tooltip
//
// Returns a tip
d3.tip = function() {
  var direction = d3_tip_direction,
    offset = d3_tip_offset,
    html = d3_tip_html,
    node = initNode(),
    svg = null,
    point = null,
    target = null

  function tip(vis) {
    svg = getSVGNode(vis)
    point = svg.createSVGPoint()
    document.body.appendChild(node)
  }

  // Public - show the tooltip on the screen
  //
  // Returns a tip
  tip.show = function() {
    var args = Array.prototype.slice.call(arguments)
    if (args[args.length - 1] instanceof SVGElement) target = args.pop()

    var content = html.apply(this, args),
      poffset = offset.apply(this, args),
      dir = direction.apply(this, args),
      nodel = d3.select(node),
      i = 0,
      coords

    nodel.html(content)
      .style({
        opacity: 1,
        'pointer-events': 'all'
      })

    while (i--) nodel.classed(directions[i], false)
    coords = direction_callbacks.get(dir).apply(this)
    nodel.classed(dir, true).style({
      top: (coords.top + poffset[0]) + 'px',
      left: (coords.left + poffset[1]) + 'px'
    })

    return tip
  }

  // Public - hide the tooltip
  //
  // Returns a tip
  tip.hide = function() {
    nodel = d3.select(node)
    nodel.style({
      opacity: 0,
      'pointer-events': 'none'
    })
    return tip
  }

  // Public: Proxy attr calls to the d3 tip container.  Sets or gets attribute value.
  //
  // n - name of the attribute
  // v - value of the attribute
  //
  // Returns tip or attribute value
  tip.attr = function(n, v) {
    if (arguments.length < 2 && typeof n === 'string') {
      return d3.select(node).attr(n)
    } else {
      var args = Array.prototype.slice.call(arguments)
      d3.selection.prototype.attr.apply(d3.select(node), args)
    }

    return tip
  }

  // Public: Proxy style calls to the d3 tip container.  Sets or gets a style value.
  //
  // n - name of the property
  // v - value of the property
  //
  // Returns tip or style property value
  tip.style = function(n, v) {
    if (arguments.length < 2 && typeof n === 'string') {
      return d3.select(node).style(n)
    } else {
      var args = Array.prototype.slice.call(arguments)
      d3.selection.prototype.style.apply(d3.select(node), args)
    }

    return tip
  }

  // Public: Set or get the direction of the tooltip
  //
  // v - One of n(north), s(south), e(east), or w(west), nw(northwest),
  //     sw(southwest), ne(northeast) or se(southeast)
  //
  // Returns tip or direction
  tip.direction = function(v) {
    if (!arguments.length) return direction
    direction = v == null ? v : d3.functor(v)

    return tip
  }

  // Public: Sets or gets the offset of the tip
  //
  // v - Array of [x, y] offset
  //
  // Returns offset or
  tip.offset = function(v) {
    if (!arguments.length) return offset
    offset = v == null ? v : d3.functor(v)

    return tip
  }

  // Public: sets or gets the html value of the tooltip
  //
  // v - String value of the tip
  //
  // Returns html value or tip
  tip.html = function(v) {
    if (!arguments.length) return html
    html = v == null ? v : d3.functor(v)

    return tip
  }

  function d3_tip_direction() {
    return 'n'
  }

  function d3_tip_offset() {
    return [0, 0]
  }

  function d3_tip_html() {
    return ' '
  }

  var direction_callbacks = d3.map({
      n: direction_n,
      s: direction_s,
      e: direction_e,
      w: direction_w,
      nw: direction_nw,
      ne: direction_ne,
      sw: direction_sw,
      se: direction_se
    }),

    directions = direction_callbacks.keys()

  function direction_n() {
    var bbox = getScreenBBox()
    return {
      top: bbox.n.y - node.offsetHeight,
      left: bbox.n.x - node.offsetWidth / 2
    }
  }

  function direction_s() {
    var bbox = getScreenBBox()
    return {
      top: bbox.s.y,
      left: bbox.s.x - node.offsetWidth / 2
    }
  }

  function direction_e() {
    var bbox = getScreenBBox()
    return {
      top: bbox.e.y - node.offsetHeight / 2,
      left: bbox.e.x
    }
  }

  function direction_w() {
    var bbox = getScreenBBox()
    return {
      top: bbox.w.y - node.offsetHeight / 2,
      left: bbox.w.x - node.offsetWidth
    }
  }

  function direction_nw() {
    var bbox = getScreenBBox()
    return {
      top: bbox.nw.y - node.offsetHeight,
      left: bbox.nw.x - node.offsetWidth
    }
  }

  function direction_ne() {
    var bbox = getScreenBBox()
    return {
      top: bbox.ne.y - node.offsetHeight,
      left: bbox.ne.x
    }
  }

  function direction_sw() {
    var bbox = getScreenBBox()
    return {
      top: bbox.sw.y,
      left: bbox.sw.x - node.offsetWidth
    }
  }

  function direction_se() {
    var bbox = getScreenBBox()
    return {
      top: bbox.se.y,
      left: bbox.e.x
    }
  }

  function initNode() {
    var node = d3.select(document.createElement('div'))
    node.style({
      position: 'absolute',
      opacity: 0,
      pointerEvents: 'none',
      boxSizing: 'border-box'
    })

    return node.node()
  }

  function getSVGNode(el) {
    el = el.node()
    if (el.tagName.toLowerCase() == 'svg')
      return el

    return el.ownerSVGElement
  }


  // Private - gets the screen coordinates of a shape
  //
  // Given a shape on the screen, will return an SVGPoint for the directions
  // n(north), s(south), e(east), w(west), ne(northeast), se(southeast), nw(northwest),
  // sw(southwest).
  //
  //    +-+-+
  //    |   |
  //    +   +
  //    |   |
  //    +-+-+
  //
  // Returns an Object {n, s, e, w, nw, sw, ne, se}
  function getScreenBBox() {
    var targetel = target || d3.event.target,
      bbox = {},
      matrix = targetel.getScreenCTM(),
      tbbox = targetel.getBBox(),
      width = tbbox.width,
      height = tbbox.height,
      x = tbbox.x,
      y = tbbox.y,
      scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
      scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft

    console.log("scrollTop: " + scrollTop);
    console.log("scrollLeft: " + scrollLeft);

    point.x = x + scrollLeft
    point.y = y + scrollTop
    bbox.nw = point.matrixTransform(matrix)
    point.x += width
    bbox.ne = point.matrixTransform(matrix)
    point.y += height
    bbox.se = point.matrixTransform(matrix)
    point.x -= width
    bbox.sw = point.matrixTransform(matrix)
    point.y -= height / 2
    bbox.w = point.matrixTransform(matrix)
    point.x += width
    bbox.e = point.matrixTransform(matrix)
    point.x -= width / 2
    point.y -= height / 2
    bbox.n = point.matrixTransform(matrix)
    point.y += height
    bbox.s = point.matrixTransform(matrix)

    return bbox
  }

  return tip
};

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return showDetails(d);
  })

var pathtip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(p) {
    return showPathDetails(p);
  })


var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

svg.call(tip);
svg.call(pathtip);

function init(inputjson) {
  console.log("in init");


  if (initialized != true) {
    // underlying data parsed to JSON object
    datajson = JSON.parse(inputjson);

    console.log(datajson);

    // set the first measure as default
    measure = datajson.measures[0];

    /* primary node */
    primaryid = datajson.people[0].id;

    // Compute the distinct nodes from the links.
    datajson.relations.forEach(function(link) {
      link.source = datajson.people[link.source];
      link.target = datajson.people[link.target];
    });


    datajson.filtertypes.forEach(function(filtertype) {
      clickedfilters.push(filtertype);
    });


    force = d3.layout.force()
      .nodes(d3.values(datajson.people))
      .links(datajson.relations)
      .size([width, height])
      .linkDistance(200)
      .charge(-800)
      .on("tick", tick)
      .start();

    initialized = true;


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


    path = svg.append("g").selectAll("path")
      .data(force.links())
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
      .on('mouseover', pathtip.show)
      .on('mouseout', pathtip.hide);

    circle = svg.append("g").selectAll("circle")
      .data(force.nodes())
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
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      .on('click', function(d) {
        if(isiOS){
          var now = new Date().getTime();
          var delta = now - lastTouch;

          if(delta<350 && delta>0){
               // the second touchend event happened within half a second. Here is where we invoke the double tap code
            var win = window.open("http://news.bbc.co.uk");
            win.focus();        
          }
          lastTouch = new Date().getTime();

        } else{
         console.log("not iOS");
        }
        primaryid = d.id;
        filterGraph();
      })
      .on('dblclick', function(d) {
        var win = window.open("/" + d.id, '_blank');
        win.focus();        

      })
      .call(force.drag);

    /* old
    var text = svg.append("g").selectAll("text")
        .data(force.nodes())
      .enter().append("text")
        .attr("x", 8)
        .attr("y", ".31em")
        .text(function(d) { return d.name; });
    */

    text = svg.append("svg:g")
      .selectAll("g")
      .data(force.nodes())
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

  }
  console.log("exit init");
};




// Use elliptical arc path segments to doubly-encode directionality.
function tick() {
  path.attr("d", linkArc);
  circle.attr("transform", transform);
  text.attr("transform", transform);
}

function linkArc(d) {
  var
    sx = limitborderx(d.source.x),
    sy = limitbordery(d.source.y),
    tx = limitborderx(d.target.x),
    ty = limitbordery(d.target.y),
    dx = tx - sx,
    dy = ty - sy,
    dr = Math.sqrt(dx * dx + dy * dy);
  return "M" + sx + "," + sy + "A" + dr + "," + dr + " 0 0,1 " + tx + "," + ty;
}

function transform(d) {
  /* KB: attempt to make the primary node fixed */
//  if (d.id == primaryid && datajson.centreonclick === true) {
//    d.x = midx;
//    d.y = midy;
//    return "translate(" + midx + "," + midy + ")";
//  }

  var dx = limitborderx(d.x);
  var dy = limitbordery(d.y);

  return "translate(" + dx + "," + dy + ")";
}

function limitborderx(x) {
  return Math.min(x, width);
//  return x;
}

function limitbordery(y) {
  return Math.max(Math.min(y, height - 50), 50);
//  return y;
}




function getRelatedNodes(level) {

  var looplevel = 0;

  var linkednodes = [primaryid];

  while (looplevel < level) {
    var newnodes = [];
    looplevel++;
    path.each(function(p) {

      // if the source node is 
      var sourceindex = $.inArray(p.source.id, linkednodes);
      var targetindex = $.inArray(p.target.id, linkednodes);
      if (sourceindex === -1 && targetindex > -1) {
        newnodes.push(p.source.id);
      }
      if (targetindex === -1 && sourceindex > -1) {
        newnodes.push(p.target.id);
      }
    });


    var arrayLength = newnodes.length;

    for (var i = 0; i < newnodes.length; i++) {
      var index = $.inArray(newnodes[i], linkednodes);
      if (index === -1) {
        linkednodes.push(newnodes[i]);
      }
    }

  }
  return linkednodes;
}




// Method to resize nodes
function resizeNodes(aType) {
  // change the visibility of the connection path
  console.log("resizeNodes : " + aType);


  // change the size of the node 

  circle.attr("r", function(o, i) {
    return o.measures[aType].radius;
  });

  circle.style("fill", function(o, i) {
    return o.measures[aType].color;
  });


  circle.style("stroke", function(o, i) {
    if (o.id == primaryid) {
      return "gold";
    }
    return o.stroke;
  });

  circle.style("stroke-width", function(o, i) {
    if (o.id == primaryid) {
      return "10px";
    }
    return circlestrokewidth;
  });

}


// Method to filter graph
function filterGraph() {
  // change the visibility of the connection path

  console.log("Static Resource.filterGraph");

  var showcirclesids = [];
  var relatedNodes = getRelatedNodes(levels);

  path.style("visibility", function(o) {

    var retval = "hidden";
    var sourcevis = o.source.measures[measure].visible;
    var targetvis = o.target.measures[measure].visible;

    var sourceindex = $.inArray(o.source.id, relatedNodes);
    var targetindex = $.inArray(o.target.id, relatedNodes);

    var primaryrelated = (sourceindex > -1 && targetindex > -1);


    if ((sourcevis === 1) && (targetvis === 1) && primaryrelated) {

      var index = $.inArray(o.type, clickedfilters);

      if (index > -1) {
        console.log('for: ' + o.source.name + '/' + o.target.name + " return TRUE");

        var indexsource = $.inArray(o.source.id, showcirclesids);
        if (indexsource == -1) {
          showcirclesids.push(o.source.id);
        }
        var indextarget = $.inArray(o.target.id, showcirclesids);
        if (indextarget == -1) {
          showcirclesids.push(o.target.id);
        }
      }

    }

    return (index > -1) ? "visible" : "hidden";
  });


  console.log("circles shown: " + showcirclesids.length);

  // change the visibility of the node
  // if all the links with that node are invisibile, the node should also be invisible
  // otherwise if any link related to that node is visibile, the node should be visible
  circle.style("visibility", function(o, i) {
    var index = $.inArray(o.id, showcirclesids);
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

  resizeNodes(measure);
}


function showDetails(d) {
  var content = '<div style="text-align:center;">';
  content += '<p><span>' + d.name + '</span></p>';
  //    content += '<hr class="tooltip-hr">';
  content += '<div><img src="https://upload.wikimedia.org/wikipedia/commons/4/4f/Anna_Netrebko_-_Romy_2013_a.jpg" height="60" width="60" alt="No image available" align="centre"></div>';
  content += '<p>' + d.position + ' (' + d.account + ')</p>';
  content += '</div>';
  return content;
}

function showPathDetails(p) {
  var content = '<div style="text-align:center;font-size:"6px";>';
  content += '<p>Type: ' + p.type + '</p>';
  content += '<p>Linked By ' + p.createdby + '</p>';
  content += '<p>Notes: ' + p.notes + '</p>';
  content += '</div>';
  return content;
}


console.log("loaded: pictor.js");