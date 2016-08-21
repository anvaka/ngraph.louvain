var CommunityGraph = require('bindings')('louvain').CommunityGraph;

module.exports = {
  fromNgraph: fromNgraph
};

function fromNgraph(ngraph) {
  var nodeCount = ngraph.getNodesCount();
  var nodeToIndexMap = new Map();
  var lastAvailable = 0;

  var communityGraph = new CommunityGraph(nodeCount);

  ngraph.forEachNode(function(node) {
    nodeToIndexMap.set(node.id, lastAvailable);
    lastAvailable += 1;
  });

  ngraph.forEachLink(function(link) {
    var weight = typeof link.data === 'number' ? link.data : 1;

    communityGraph.addLink(
      nodeToIndexMap.get(link.fromId),
      nodeToIndexMap.get(link.toId),
      weight
    );
  });

  var modularityImproved = communityGraph.optimizeModularity();

  return {
    getClass: getClass,
    canCoarse: canCoarse
  }

  function canCoarse() {
    return modularityImproved;
  }

  function getClass(nodeId) {
    var cNodeId = nodeToIndexMap.get(nodeId)

    return communityGraph.getClass(cNodeId);
  }
}