#include <iostream>
#include "community-graph.h"


int main() {
  CommunityGraph graph(3);

  graph.addLink(1, 2, 1);
  auto improved = graph.optimizeModularity();

  std::cout << graph.getModularity() << std::endl;
}