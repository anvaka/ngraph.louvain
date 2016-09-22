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
    canCoarse: canCoarse,

    /**
     * Allows clients to change cluster classes from random range of 0 to nodes count
     * to a fixed range of 0 to clusters count.
     *
     * I.e. on regular run you can get the following mapping:
     *
     * node | cluster id
     * -----|------------
     *   0  |     2
     *   1  |     2
     *   2  |     3
     *   3  |     3
     *
     *  After renumber:
     *
     * node | cluster id
     * -----|------------
     *   0  |     0
     *   1  |     0
     *   2  |     1
     *   3  |     1
     */
    renumber: renumber
  }

  function canCoarse() {
    return modularityImproved;
  }

  function renumber(groupIsolatedNodes) {
    communityGraph.renumber(groupIsolatedNodes);
  }

  function getClass(nodeId) {
    var cNodeId = nodeToIndexMap.get(nodeId)

    return communityGraph.getClass(cNodeId);
  }
}
