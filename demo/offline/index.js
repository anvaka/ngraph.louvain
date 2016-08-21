var detectClusters = require('../../native.js').fromNgraph;

var graph = require('miserables');
var clusters = detectClusters(graph);

graph.forEachNode(function(node) {
  console.log('Node ' + node.id + ' belongs to ' + clusters.getClass(node.id));
});

var coarsen = require('ngraph.coarsen');

while(clusters.canCoarse()) {
  graph = coarsen(graph, clusters);
  debugger;
  clusters = detectClusters(graph);

  graph.forEachNode(function(node) {
    console.log('Node ' + node.id + ' belongs to ' + clusters.getClass(node.id));
  });
}
