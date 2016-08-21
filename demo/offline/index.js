var detectClusters = require('../../native.js').fromNgraph;

var graph = require('miserables');
var clusters = detectClusters(graph);

graph.forEachNode(function(node) {
  console.log('Node ' + node.id + ' belongs to ' + clusters.getClass(node.id));
});
