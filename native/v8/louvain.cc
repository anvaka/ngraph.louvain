#include "louvain.h"

Louvain::Louvain(int nodeCount) {
  _graph = std::unique_ptr<CommunityGraph>( new CommunityGraph(nodeCount) );
};

Louvain::~Louvain() {
}

Nan::Persistent<v8::Function> Louvain::constructor;

NAN_MODULE_INIT(Louvain::Init) {
  v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);

  tpl->SetClassName(Nan::New("Louvain").ToLocalChecked());
  // need to set internal fields in order to be able to wrap object.
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  Nan::SetPrototypeMethod(tpl, "addLink", AddLink);
  Nan::SetPrototypeMethod(tpl, "getModularity", GetModularity);
  Nan::SetPrototypeMethod(tpl, "optimizeModularity", OptimizeModularity);
  Nan::SetPrototypeMethod(tpl, "getClass", GetClass);
  Nan::SetPrototypeMethod(tpl, "renumber", Renumber);

  constructor.Reset(Nan::GetFunction(tpl).ToLocalChecked());
  Nan::Set(target, Nan::New("CommunityGraph").ToLocalChecked(), Nan::GetFunction(tpl).ToLocalChecked());
}

NAN_METHOD(Louvain::New) {
  if (info.IsConstructCall()) {
    if (info.Length() < 1) {
      Nan::ThrowError("Number of nodes is required.");
      return;
    }

    int numberOfNodes = Nan::To<int>(info[0]).FromJust();
    Louvain *obj = new Louvain(numberOfNodes);
    obj->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
  } else {
    const unsigned argc = 0;

    v8::Local<v8::Value> argv[argc] = {};
    v8::Local<v8::Function> cons = Nan::New<v8::Function>(Louvain::constructor);
    v8::Local<v8::Object> instance = cons->NewInstance(argc, argv);

    info.GetReturnValue().Set(instance);
  }
}

NAN_METHOD(Louvain::AddLink) {
  if (info.Length() < 2) {
    Nan::ThrowError("fromId and toId are required");
    return;
  }

  Louvain* self = ObjectWrap::Unwrap<Louvain>(info.This());

  int fromId = Nan::To<int>(info[0]).FromJust();
  int toId = Nan::To<int>(info[1]).FromJust();
  int weight = info.Length() == 3 ? Nan::To<int>(info[2]).FromJust() : 1;

  try {
    self->_graph->addLink(fromId, toId, weight);
  } catch (const std::out_of_range& e) {
    std::string err("Index is out of range: ");
    err.append(e.what());
    Nan::ThrowError(err.c_str());
  }
}

NAN_METHOD(Louvain::GetModularity) {
  Louvain* self = ObjectWrap::Unwrap<Louvain>(info.This());

  auto result = self->_graph->getModularity();
  info.GetReturnValue().Set(result);
}

NAN_METHOD(Louvain::OptimizeModularity) {
  Louvain* self = ObjectWrap::Unwrap<Louvain>(info.This());

  auto result = self->_graph->optimizeModularity();
  info.GetReturnValue().Set(result);
}

NAN_METHOD(Louvain::GetClass) {
  Louvain* self = ObjectWrap::Unwrap<Louvain>(info.This());

  if (info.Length() < 1) {
    Nan::ThrowError("nodeId is required");
    return;
  }

  int nodeId = Nan::To<int>(info[0]).FromJust();

  auto result = self->_graph->getClass(nodeId);
  info.GetReturnValue().Set(result);
}

NAN_METHOD(Louvain::Renumber) {
  Louvain* self = ObjectWrap::Unwrap<Louvain>(info.This());

  self->_graph->renumber();
}