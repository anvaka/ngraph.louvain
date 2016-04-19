module.exports = createCommunityGraph;

function createCommunityGraph(ngraph) {
  var nodeCount = ngraph.getNodesCount();
  var weight = 0;
  var nodes = [];
  var indexLookup = new Map();

  ngraph.forEachNode(function(node) {
    initNode(node.id);
  });

  ngraph.forEachLink(function(link) {
    var fromIdx = getNodeIdFromNgraph(link.fromId);
    var toIdx = getNodeIdFromNgraph(link.toId);

    var weight = getWeight(link.data);
    var fromNode = nodes[fromIdx];
    var toNode = nodes[toIdx];

    if (fromIdx === toIdx) {
      fromNode.selfLoopsCount += weight;
      fromNode.weightedDegree += weight;
    } else {
      // We do not list self-loops here.
      addNeighbour(fromNode, toIdx, weight);
      addNeighbour(toNode, fromIdx, weight);
      fromNode.weightedDegree += weight;
      toNode.weightedDegree += weight;
    }
  });

  weight = computeTotalWeight();

  return {
    nodeCount: nodeCount,
    weight: weight,

    forEachNeigbour: forEachNeigbour,

    getWeightedDegree: getWeightedDegree,
    getSelfLoopsCount: getSelfLoopsCount,

    getNodeIdFromNgraph: getNodeIdFromNgraph
  };

  function getNodeIdFromNgraph(id) {
    var idx = indexLookup.get(id);
    if (idx === undefined) throw new Error('Unknown node id: ' + id);

    return idx;
  }

  function addNeighbour(node, id, weight) {
      var info = {
        id: id,
        weight: weight
      };
      if (!node.neighbours) node.neighbours = [info];
      else node.neighbours.push(info);
      // PS: We do not init neighbours array unless it's trulyu needed
  }

  function forEachNeigbour(nodeId, cb) {
    var node = getNode(nodeId);
    if (!node.neighbours) return;

    for (var i = 0; i < node.neighbours.length; ++i) {
      var info = node.neighbours[i];
      cb(info.id, info.weight);
    }
  }

  function computeTotalWeight() {
    var weight = 0;
    for (var i = 0; i < nodeCount; ++i) {
      weight += getWeightedDegree(i);
    }
    return weight;
  }

  function getSelfLoopsCount(nodeId) {
    return getNode(nodeId).selfLoopsCount;
  }

  function getWeightedDegree(nodeId) {
    return getNode(nodeId).weightedDegree;
  }

  function getNode(nodeId) {
    var node = nodes[nodeId];
    if (!node) throw new Error('cannot find node with id: ' + nodeId);

    return node;
  }

  function initNode(id) {
    var node = {
      selfLoopsCount: 0,
      weightedDegree: 0,
      neighbours: null
    };

    var idx = nodes.length;
    indexLookup.set(id, idx);
    nodes.push(node);

    return idx;
  }
}

function getWeight(data) {
  if (!data) return 1;

  if (typeof data === 'number') return data;
  if (typeof data.weight === 'number') return data.weight;

  return 1;
}
