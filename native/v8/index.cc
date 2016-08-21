/**
 * Our entry point to the module
 */
#include "louvain.h"

using v8::FunctionTemplate;

NAN_MODULE_INIT(InitAll) {
  Louvain::Init(target);
}

NODE_MODULE(louvain, InitAll)
