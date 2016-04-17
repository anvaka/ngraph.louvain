var graph = require('miserables')


// by default miserables comes with weights. For the pupose of this demo we will
// remove all weights from the graph:
graph.forEachLink(function(link) {
  link.data = 1;
});

module.exports = graph;
