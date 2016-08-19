#include <vector>

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
  double *_selfLoopsCount;
  double *_weightedDegree;

  // array of pointers to std::vector
  NeigbourList *_neighbours;

public:
  CommunityGraph(NodeId numberOfNodes):_numberOfNodes(numberOfNodes) {
    if (numberOfNodes < 1) {
      throw std::out_of_range("numberOfNodes");
    }

    _selfLoopsCount = new double[numberOfNodes];
    _weightedDegree = new double[numberOfNodes];
    _neighbours = new NeigbourList[numberOfNodes];

    for (auto i = 0; i < numberOfNodes; ++i) {
      _selfLoopsCount[i] = 0;
      _weightedDegree[i] = 0;
      _neighbours[i] = nullptr;
    }
  }

  ~CommunityGraph() {
    delete _selfLoopsCount;
    delete _weightedDegree;

    for (int i; i < _numberOfNodes; ++i) {
      if (_neighbours[i] != nullptr) {
        for (auto it = _neighbours[i]->cbegin(); it != _neighbours[i]->cend(); ++it){
          delete *it;
        }
        delete _neighbours[i];
      }
    }
  }

  NodeId getNodeCount() { return _numberOfNodes; }

  double getTotalWeight() {
    auto weight = 0.0;

    for (auto i = 0; i < _numberOfNodes; ++i) {
      weight += _weightedDegree[i];
    }

    return weight;
  }

  void addLink(NodeId fromId, NodeId toId, double linkWeight) {
    if (0 > fromId || fromId >= _numberOfNodes) throw std::out_of_range("fromId");
    if (0 > toId || toId >= _numberOfNodes) throw std::out_of_range("toId");

    // TODO: verify range
    if (fromId == toId) {
      // self loop
      _selfLoopsCount[fromId] += linkWeight;
      _weightedDegree[fromId] += linkWeight;
    } else {
      addNeighbour(fromId, toId, linkWeight);
      addNeighbour(toId, fromId, linkWeight);
      _weightedDegree[fromId] += linkWeight;
      _weightedDegree[toId] += linkWeight;
    }
  }

  void addNeighbour(NodeId fromId, NodeId toId, double weight) {
    auto neighbours = _neighbours[fromId];

    if (neighbours == nullptr) {
      // We do not init neighbours array unless it's truly needed
      neighbours = _neighbours[fromId] = new std::vector<Neigbour*>();
    }

    neighbours->push_back(new Neigbour(toId, weight));
  }

};