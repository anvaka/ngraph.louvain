var modularity = require('../');
var createGraph = require('miserables').create;
var test = require('tap').test;

test('it can compute modularity for miserables graph', function(t) {
  var graph = createGraph();
  var community = modularity(graph);

  graph.forEachNode(function(node) {
    t.ok(community.getClass(node.id), 'Node ' + node.id + ' has a defined community');
  })

  t.ok(community.canCoarse(), 'Miserables can be further coarsened');
  t.ok(community.originalModularity < community.newModularity, 'Modularity improved')

  t.end();
});
