var modularity = require('../../');

var getColor = require('../lib/getColor.js');
var graph = require('../lib/getGraph.js');

console.time('cluster');
var clusters = modularity(graph);
console.timeEnd('cluster');

// We use svg renderer, but this could be any renderer
renderGraph(graph);

function renderGraph(graph) {
  var render = require('ngraph.svg');
  var svg = render.svg;

  var renderer = render(graph, {
    physics: {
      timeStep: 2,
      springLength : 55,
      springCoefficient : 0.008,
      dragCoefficient : 0.9,
      gravity : -12
    }
  });

  renderer.node(createNode).placeNode(renderNode);

  renderer.run();

  function renderNode(ui, pos, node) {
    var currentClass = clusters.getClass(node.id);
    if (ui.label !== currentClass) {
      ui.label = currentClass;
      ui.labelEl.text(currentClass);
      ui.circleEl.attr('fill', getColor(currentClass));
    }
    ui.attr('transform', 'translate(' + (pos.x ) + ',' + (pos.y) + ')');
  }

  function createNode() {
    var ui = svg('g');
        // Create SVG text element with user id as content
    var label = svg('text').attr('y', '-8px');
    var circle = svg('circle', {
      r: 7,
      stroke: '#fff',
      fill: '#ff00ef',
      'stroke-width': '1.5px'
    });
    ui.append(label);
    ui.append(circle);

    // yeah, ugly. Storing label dom element, so that we can update labels later
    ui.labelEl = label;
    ui.circleEl = circle;
    return ui;
  }
}
