var modularity = require('../');
var createMiserablesGraph = require('miserables').create;
var test = require('tap').test;
var createGraph = require('ngraph.graph');

var detectClusters = require('../native.js').fromNgraph;

test('native code gives exactly the same results as js code', function(t) {
  var graph = createMiserablesGraph();
  var jsCommunity = modularity(graph);
  var clusters = detectClusters(graph);

  graph.forEachNode(function(node) {
    t.equals(jsCommunity.getClass(node.id), clusters.getClass(node.id), 'Node ' + node.id + ' was resolved correctly');
  })

  t.end();
});

test('native code can renumber clusters', function(t) {
  var graph = createMiserablesGraph();
  var clusters = detectClusters(graph);
  // renumber makes sure that class lies between 0 and cluster.length
  clusters.renumber();

  var clustersArray = [];
  graph.forEachNode(function(node) {
    clustersArray[clusters.getClass(node.id)] = true
  })

  t.ok(clustersArray.length > 0, 'some clusters found');

  for (var i = 0; i < clustersArray.length; ++i) {
    t.ok(clustersArray[i] === true, 'Cluster defined: ' + i);
  }

  t.end();
});

test('native code can renumber and aggregate isolated nodes', function(t) {
  var graph = createGraph();
  graph.addLink(1, 2);
  graph.addNode(3);
  graph.addNode(4);

  var clusters = detectClusters(graph);
  // renumber makes sure that class lies between 0 and cluster.length
  var groupIsolatedNodes = true;
  t.notEqual(clusters.getClass(3), clusters.getClass(4), 'isolate nodes have different class first');

  clusters.renumber(groupIsolatedNodes);

  t.equals(clusters.getClass(3), clusters.getClass(4), 'isolate nodes class is the same now');
  t.equals(clusters.getClass(1), clusters.getClass(2), 'connected node are at the same class');
  t.notEqual(clusters.getClass(3), clusters.getClass(1), 'isolate node class is not the same as linked node ');

  t.end();
});
