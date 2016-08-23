var modularity = require('../');
var createMiseablesGraph = require('miserables').create;
var test = require('tap').test;

var addonModularity = require('../native.js').fromNgraph;

test('native code gives exactly the same results as js code', function(t) {
  var graph = createMiseablesGraph();
  var jsCommunity = modularity(graph);
  var addonCommunity = addonModularity(graph);

  graph.forEachNode(function(node) {
    t.equals(jsCommunity.getClass(node.id), addonCommunity.getClass(node.id), 'Node ' + node.id + ' was resolved correctly');
  })

  t.end();
});
