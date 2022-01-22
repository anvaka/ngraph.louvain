var detectClusters = require('../../');

var getColor = require('../lib/getColor.js');
var graph = require('../lib/getGraph.js');

var coarsen = require('ngraph.coarsen');

console.time('cluster');
var clusters = detectClusters(graph);
console.timeEnd('cluster');
let clusterGraph = coarsen(graph, clusters);

// We use svg renderer, but this could be any renderer
renderGraph(clusterGraph);

function renderGraph(graph) {
  var render = require('ngraph.svg');
  var svg = render.svg;

  var springLength = 55;
  var renderer = render(graph, {
    physics: {
      springLength : springLength,
      springCoefficient : 0.07,
      timeStep: 5,
      dragCoefficient : 0.09,
      gravity : -10
    }
  });
  let layout = renderer.layout;
  graph.forEachNode(node => {
    let body = layout.getBody(node.id);
    body.mass = Math.pow(node.data.size,  3);
  });
  graph.forEachLink(link => {
    let spring = layout.getSpring(link.fromId, link.toId);
    let fromR = getNodeRadius(graph.getNode(link.fromId));
    let toR = getNodeRadius(graph.getNode(link.toId));
    spring.length = springLength + fromR + toR;
    spring.weight = link.data;
  })

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

  function getNodeRadius(node) {
    let nodeArea = (14 * 14);
    let area = nodeArea * node.data.size;
    return Math.sqrt(area / Math.PI);
  }

  function createNode(node) {
    var ui = svg('g');
        // Create SVG text element with user id as content
    var label = svg('text').attr('y', '-8px');
    var circle = svg('circle', {
      r: getNodeRadius(node),
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
