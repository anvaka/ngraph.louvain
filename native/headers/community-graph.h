#include <vector>
#include <map>

typedef int NodeId; // We assume at least 32 bit for a node.

struct Neigbour {
  NodeId id;
  double weight;

  Neigbour(NodeId _toId, double _weight) : id(_toId), weight(_weight) {
  }
};

// std::vector will contain all neigbours (dynamically allocated)
// We don't want to create array of std::vectors, since it's more expensive
// than array of pointers. Especially if many nodes in the graph do not have
// neighbours.
typedef std::vector<Neigbour*> * NeigbourList;

class CommunityGraph {
  // nodes in community graph are indexed from 0 to numberOfNodes.
private:
  NodeId _numberOfNodes;

  // i'th element in this array gives number of self loops for the i-th node
  NodeId *_selfLoopsCount;

  // maps node index to its weight
  int *_weightedDegree;

  int *_communityLinksWeight;
  int *_communityInternalLinksWeight;

  // Used to randomly iterate over nodes;
  NodeId *_randomIndices;

  // maps node index to community index.
  NodeId *_nodeToCommunity;

  // array of pointers to std::vector
  NeigbourList *_neighbours;

  void shuffle() {
    for (NodeId i = _numberOfNodes - 1; i > 0; --i) {
      // TODO: this may not work if NodeId is not int.
      auto j = std::rand() % (i + 1); // i inclusive
      auto t = _randomIndices[j];
      _randomIndices[j] = _randomIndices[i];
      _randomIndices[i] = t;
    }
  }

  void removeFromCommunity(NodeId nodeId, NodeId communityId, int sharedLinksWeight) {
    _communityLinksWeight[communityId] -= _weightedDegree[nodeId];
    _communityInternalLinksWeight[communityId] -= 2 * sharedLinksWeight + _selfLoopsCount[nodeId];

    _nodeToCommunity[nodeId] = -1; //remove node from community
  }

  void insertIntoCommunity(NodeId nodeId, NodeId communityId, int sharedLinksWeight) {
    _communityLinksWeight[communityId] += _weightedDegree[nodeId];
    _communityInternalLinksWeight[communityId] += 2 * sharedLinksWeight + _selfLoopsCount[nodeId];
    _nodeToCommunity[nodeId] = communityId;
  }

  std::map<NodeId, int> getNeighbouringCommunities(NodeId node) {
    std::map<NodeId, int> communityIdToWeight;
    auto nodeCommunity = _nodeToCommunity[node];
    communityIdToWeight[nodeCommunity] = 0;

    if (_neighbours[node] == nullptr) return communityIdToWeight;

    for (auto it = _neighbours[node]->cbegin(); it != _neighbours[node]->cend(); ++it){
      auto neighbour = *it;
      auto otherCommunity = _nodeToCommunity[neighbour->id];

      double currentValue = 0;
      auto search = communityIdToWeight.find(otherCommunity);
      if (search != communityIdToWeight.end()) {
        currentValue = search->second;
      }

      communityIdToWeight[otherCommunity] = currentValue + neighbour->weight;
    }

    return communityIdToWeight;
  }

  int getTotalWeight() {
    auto weight = 0.0;

    for (auto i = 0; i < _numberOfNodes; ++i) {
      weight += _weightedDegree[i];
    }

    return weight;
  }

  void addNeighbour(NodeId fromId, NodeId toId, double weight) {
    auto neighbours = _neighbours[fromId];

    if (neighbours == nullptr) {
      // We do not init neighbours array unless it's truly needed
      neighbours = _neighbours[fromId] = new std::vector<Neigbour*>();
    }

    neighbours->push_back(new Neigbour(toId, weight));
  }


public:
  CommunityGraph(NodeId numberOfNodes):_numberOfNodes(numberOfNodes) {
    if (numberOfNodes < 1) {
      throw std::out_of_range("numberOfNodes");
    }

    std::srand(42);
    // (8 + 8 + 8 + 8 + 8 + 8 + 8) * V + (4 + 8) * E
    _selfLoopsCount = new int[numberOfNodes];
    _weightedDegree = new int[numberOfNodes];

    _communityInternalLinksWeight = new int[numberOfNodes];
    _communityLinksWeight = new int[numberOfNodes];

    _neighbours = new NeigbourList[numberOfNodes];
    _randomIndices = new NodeId[numberOfNodes];
    _nodeToCommunity = new NodeId[numberOfNodes];

    for (NodeId i = 0; i < numberOfNodes; ++i) {
      _selfLoopsCount[i] = 0;
      _weightedDegree[i] = 0;
      _neighbours[i] = nullptr;

      _randomIndices[i] = i;

      // each node belongs to it's own community at the start
      _nodeToCommunity[i] = i;
      _communityInternalLinksWeight[i] = 0;
      _communityLinksWeight[i] = 0;
    }
  }

  ~CommunityGraph() {
    delete [] _selfLoopsCount;
    delete [] _weightedDegree;
    delete [] _randomIndices;
    delete [] _nodeToCommunity;
    delete [] _communityInternalLinksWeight;
    delete [] _communityLinksWeight;

    for (int i = 0; i < _numberOfNodes; ++i) {
      if (_neighbours[i] != nullptr) {
        for (auto it = _neighbours[i]->cbegin(); it != _neighbours[i]->cend(); ++it){
          delete *it;
        }
        delete _neighbours[i];
      }
    }
  }

  NodeId getNodeCount() { return _numberOfNodes; }

  double getModularity() {
    double result = 0;
    double graphWeight = getTotalWeight(); // TODO: this can be cached.

    for (NodeId communityId = 0; communityId < _numberOfNodes; ++communityId) {
      if (_communityLinksWeight[communityId] > 0) {
        double dw = _communityLinksWeight[communityId] / graphWeight;
        result += _communityInternalLinksWeight[communityId] / graphWeight - dw * dw;
      }
    }

    return result;
  }

  bool optimizeModularity() {
    auto epsilon = 0.000001;

    shuffle();

    auto newModularity = getModularity();
    auto currentModularity = newModularity;
    auto modularityImproved = false;
    int movesCount;

    double graphWeight = getTotalWeight(); // TODO: this can be cached.

    do {
      movesCount = 0;
      for (NodeId i = 0; i < _numberOfNodes; ++i) {
        auto node = _randomIndices[i];
        auto nodeCommunity = _nodeToCommunity[node];

        // now we do greed search for new best community:
        // - we remove node from its current community
        // - and we find a community that maximizes modularity if this node
        // is inserted there.
        auto neigboughingCommunities = getNeighbouringCommunities(node);

        auto sharedLinksWeight = neigboughingCommunities.at(nodeCommunity);
        removeFromCommunity(node, nodeCommunity, sharedLinksWeight);

        // find best gain/community
        auto weightedDegree = _weightedDegree[node];
        NodeId bestCommunity = nodeCommunity;
        NodeId bestGain = 0;

        for(auto &kv: neigboughingCommunities) {
          auto communityId = kv.first;
          auto sharedWeight = kv.second;

          auto gain = sharedWeight - _communityLinksWeight[communityId] * weightedDegree/graphWeight;
          if (gain <= bestGain) continue;

          bestCommunity = communityId;
          bestGain = gain;
        }

        auto bestSharedWeight = neigboughingCommunities.at(bestCommunity);
        insertIntoCommunity(node, bestCommunity, bestSharedWeight);

        if (bestCommunity != nodeCommunity) movesCount += 1;
      }

      newModularity = getModularity();
      if (movesCount > 0) modularityImproved = true;
    } while (movesCount > 0 && newModularity - currentModularity > epsilon);

    return modularityImproved;
  }

  void addLink(NodeId fromId, NodeId toId, int linkWeight) {
    if (0 > fromId || fromId >= _numberOfNodes) throw std::out_of_range("fromId");
    if (0 > toId || toId >= _numberOfNodes) throw std::out_of_range("toId");

    if (fromId == toId) {
      // self loop
      _selfLoopsCount[fromId] += linkWeight;
      _weightedDegree[fromId] += linkWeight;

      // at the start each node belongs to the same community:
      _communityLinksWeight[fromId] = _weightedDegree[fromId];
      _communityInternalLinksWeight[fromId] = _selfLoopsCount[fromId];
    } else {
      addNeighbour(fromId, toId, linkWeight);
      addNeighbour(toId, fromId, linkWeight);

      _weightedDegree[fromId] += linkWeight;
      _weightedDegree[toId] += linkWeight;

      // at the start each node belongs to the same community:
      _communityLinksWeight[fromId] = _weightedDegree[fromId];
      _communityLinksWeight[toId] = _weightedDegree[toId];
    }
  }
};
