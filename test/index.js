var modularity = require('../');
var createMiseablesGraph = require('miserables').create;
var createGraph = require('ngraph.graph');
var test = require('tap').test;

test('it can compute modularity for miserables graph', function(t) {
  var graph = createMiseablesGraph();
  var community = modularity(graph);

  graph.forEachNode(function(node) {
    t.ok(community.getClass(node.id) !== undefined, 'Node ' + node.id + ' has a defined community');
  })

  t.ok(community.canCoarse(), 'Miserables can be further coarsened');
  t.ok(community.originalModularity < community.newModularity, 'Modularity improved')

  t.end();
});

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

test('it can handle empty graph', function(t) {
  var graph = createGraph();
  var community = modularity(graph);
  t.equals(community.originalModularity, 0, 'Modularity of empty graph is 0')
  t.equals(community.originalModularity, community.newModularity, 'Modularity cannot be improved')

  t.end();
});
