// Copyright 2015-2019 SWIM.AI inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * JavaScript kernel runtime.
 */
open module swim.js {
  requires swim.json;
  requires transitive swim.kernel;
  requires swim.dynamic.java;
  requires swim.dynamic.structure;
  requires swim.dynamic.observable;
  requires swim.dynamic.api;
  requires transitive swim.vm.js;

  exports swim.js;

  provides swim.kernel.Kernel with swim.js.JsKernel;
}
