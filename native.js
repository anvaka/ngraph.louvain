var CommunitGraph = require('bindings')('louvain').CommunityGraph;

var graph = new CommunitGraph(3);

graph.addLink(1, 2, 1);
graph.optimizeModularity();
console.log(graph.getModularity());

