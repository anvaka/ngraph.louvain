var nrandom = require('ngraph.random');
var randomIterator = nrandom.randomIterator;

module.exports = createCommunity;

function createCommunity(graph, options) {
  var graphWeight = graph.weight;
  var nodeCount = graph.nodeCount;
  var seededRandom = nrandom.random(42);

  var totalLinksWeight = new Float32Array(nodeCount);
  var internalLinksWeight = new Float32Array(nodeCount);
  var nodeToCommunity = new Uint32Array(nodeCount);

  for (var i = 0; i < nodeCount; ++i) {
    // each node belongs to it's own community at the start
    nodeToCommunity[i] = i;
    totalLinksWeight[i] = graph.getWeightedDegree(i);
    internalLinksWeight[i] = graph.getSelfLoopsCount(i);
  }

  return {
    /**
     * compute modularity of the current community
     */
    modularity: modularity,

    /**
     * Attempts to optimize communities of the graph. Returns true if any nodes
     * were moved; False otherwise.
     */
    optimizeModularity: optimizeModularity,

    /**
     * Given a node id returns its "class" (a cluster id);
     */
    getClass: getClass
  }

  function getClass(id) {
    return nodeToCommunity[id];
  }

  function optimizeModularity() {
    var epsilon = 0.000001;
    if (options && (options.seed !== undefined)) {
      seededRandom = nrandom.random(options.seed);
    }

    var iterator = getRandomNodeIdIterator();
    var newModularity = modularity();
    var currentModularity, movesCount;
    var modularityImproved = false;

    do {
      movesCount = 0;
      currentModularity = newModularity;
      for (var i = 0; i < iterator.length; ++i) {
        var node = iterator[i];
        var nodeCommunity = nodeToCommunity[node];

        var neigboughingCommunities = getNeighbouringCommunities(node);

        var sharedLinksWeight = neigboughingCommunities.get(nodeCommunity);
        removeFromCommunity(node, nodeCommunity, sharedLinksWeight);

        var weightedDegree = graph.getWeightedDegree(node);
        var bestCommunity = nodeCommunity;
        var bestGain = 0;

        neigboughingCommunities.forEach(function(sharedWeight, communityId) {
          var gain = getModularityGain(sharedWeight, communityId, weightedDegree);
          if (gain <= bestGain) return;

          bestCommunity = communityId;
          bestGain = gain;
        });

        var bestSharedWeight = neigboughingCommunities.get(bestCommunity);
        insertIntoCommunity(node, bestCommunity, bestSharedWeight);

        if (bestCommunity !== nodeCommunity) movesCount += 1;
      }

      newModularity = modularity();
      if (movesCount > 0) modularityImproved = true;
    } while (movesCount > 0 && newModularity - currentModularity > epsilon);

    return modularityImproved;
  }

  function getNeighbouringCommunities(nodeId) {
    // map from community id to total links weight between this node and that community
    var map = new Map();
    map.set(nodeToCommunity[nodeId], 0);

    graph.forEachNeigbour(nodeId, function(otherNodeId, edgeWeight) {
      var otherCommunity = nodeToCommunity[otherNodeId];
      var currentValue = map.get(otherCommunity) || 0;
      map.set(otherCommunity, currentValue + edgeWeight);
    });

    return map;
  }

  function getModularityGain(sharedWeight, communityId, degree) {
    var totalLinksWeightInThisCommunity = totalLinksWeight[communityId];

    return sharedWeight - totalLinksWeightInThisCommunity * degree/graphWeight;
  }

  function removeFromCommunity(nodeId, communityId, sharedLinksWeight) {
    totalLinksWeight[communityId] -= graph.getWeightedDegree(nodeId);
    internalLinksWeight[communityId] -= 2 * sharedLinksWeight + graph.getSelfLoopsCount(nodeId);
    nodeToCommunity[nodeId] = -1;
  }

  function insertIntoCommunity(nodeId, communityId, sharedLinksWeight) {
    totalLinksWeight[communityId] += graph.getWeightedDegree(nodeId);
    internalLinksWeight[communityId] += 2 * sharedLinksWeight + graph.getSelfLoopsCount(nodeId);
    nodeToCommunity[nodeId] = communityId;
  }

  function modularity() {
    var result = 0;

    for (var communityId = 0; communityId < nodeCount; ++communityId) {
      if (totalLinksWeight[communityId] > 0) {
        var dw = totalLinksWeight[communityId] / graphWeight;
        result += internalLinksWeight[communityId] / graphWeight - dw * dw;
      }
    }

    return result;
  }

  function getRandomNodeIdIterator() {
      var iterator = [];

      for (var i = 0; i < nodeCount; ++i) {
        iterator[i] = i;
      }

      randomIterator(iterator, seededRandom).shuffle();

      return iterator;
  }
}
