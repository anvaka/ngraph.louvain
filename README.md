# ngraph.louvain

Given a graph instance detects clusters using the [Louvain Method](https://en.wikipedia.org/wiki/Louvain_Modularity).
[Demo](https://anvaka.github.io/ngraph.louvain/demo/basic/)

# usage

``` js
// Let's say you have an ngraph instance:
var graph = createAGraph();

// To detect clusters:
var detectClusters = require('ngraph.louvain');
var clusters = detectClusters(graph);

// now you can iterate over each node and get it's community (aka class):
graph.forEachNode(function(node) {
  console.log(node.id, clusters.getClass(node.id));
});
```

Note: Louvain method is hierarchical. I.e. you should be able to get coarser
graphs based on detected communities. By default `ngraph.louvain`
does not implement hierarchies, yet you can easily achieve it by following:

``` js
var coarsen = require('ngraph.coarsen');

var detectClusters = require('ngraph.louvain');
var clusters = detectClusters(graph);

while(clusters.canCoarse()) {
  graph = coarsen(graph, clusters);
  clusters = detectClusters(graph);
  // this will give you next level in the hierarchy
}
```

# install

```
npm install ngraph.louvain
```

# license

MIT
