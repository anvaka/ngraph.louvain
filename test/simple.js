var modularity = require('../');
var createGraph = require('ngraph.graph');
var test = require('tap').test;

test('it can compute modularity for graphs with isolated nodes', function(t) {
  var graph = createGraph();
  graph.addNode(1); // 1 is isolated
  graph.addLink(2, 3);
  var community = modularity(graph);

  graph.forEachNode(function(node) {
    t.ok(community.getClass(node.id) !== undefined, 'Node ' + node.id + ' has a defined community');
  })

  t.ok(community.originalModularity < community.newModularity, 'Modularity improved')

  t.end();
});
