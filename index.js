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

    /**
     * Given original node id returns its class id (community)
     */
    getClass: getClass,

    /**
     * Returns a map from community id to array of neighbor ids.
     */
    getAllCommunities: getAllCommunities
  };

  function canCoarse() {
    // If there was movement last turn - we can coarse graph further.
    return modularityImproved;
  }

  function getClass(nodeId) {
    var node = graph.getNodeIdFromNgraph(nodeId);
    return community.getClass(node);
  }

  function getAllCommunities() {
    var communities = new Map();
    ngraph.forEachNode(function(node) {
      var classId = getClass(node.id);
      let neighbors = communities.get(classId);
      if (!neighbors) {
        neighbors = [];
        communities.set(classId, neighbors);
      }
      neighbors.push(node.id);
    });

    return communities;
  }
}


