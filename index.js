var createCommunityGraph = require('./lib/createCommunityGraph.js');
var createCommunity = require('./lib/createCommunity.js');

module.exports = modularity;

function modularity(ngraph, options) {
  var graph = createCommunityGraph(ngraph);
  var community = createCommunity(graph, options);
  var originalModularity = community.modularity();

  var modularityImproved = community.optimizeModularity();
  var newModularity = community.modularity();

  return {
    canCoarse: canCoarse,
    originalModularity: originalModularity,
    newModularity: newModularity,
    getClass: getClass
  };

  function canCoarse() {
    // If there was movement last turn - we can coarse graph further.
    return modularityImproved;
  }

  function getClass(nodeId) {
    var node = graph.getNodeIdFromNgraph(nodeId);
    return community.getClass(node);
  }
}


