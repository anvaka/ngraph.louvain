#ifndef NAN_LOUVAIN_H
#define NAN_LOUVAIN_H

#include <nan.h>
#include "community-graph.h"

class Louvain : public Nan::ObjectWrap {
 public:
  static NAN_MODULE_INIT(Init);

 private:
  std::unique_ptr<CommunityGraph> _graph;
  static Nan::Persistent<v8::Function> constructor;

  static NAN_METHOD(New);

  explicit Louvain(int numberOfNodes);
  ~Louvain();

  /**
   * Adds link to the graph. Each node is enumered from 0 to N. If link is out 
   * of range - exception is thrown.
   */
  static NAN_METHOD(AddLink);

  static NAN_METHOD(GetModularity);
  static NAN_METHOD(OptimizeModularity);
};

#endif
