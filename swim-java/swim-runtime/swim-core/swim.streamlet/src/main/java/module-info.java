// Copyright 2015-2023 Nstream, inc.
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
 * Stateful, streaming component model for application componets that
 * continuously consume input state from streaming inlets, and continuously
 * produce output state on streaming outlets.
 */
module swim.streamlet {
  requires transitive swim.util;
  requires transitive swim.collections;
  requires transitive swim.concurrent;

  exports swim.streamlet;
  exports swim.streamlet.combinator;
  exports swim.streamlet.function;
}
