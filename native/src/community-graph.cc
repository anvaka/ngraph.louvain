#include <iostream>
#include "community-graph.h"


int main() {
  CommunityGraph graph(5);

  graph.addLink(0, 1, 1);
  graph.addLink(1, 2, 1);

  std::cout << graph.getTotalWeight() << std::endl;
}