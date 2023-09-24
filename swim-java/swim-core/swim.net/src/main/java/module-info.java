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

import swim.annotations.Public;
import swim.annotations.Since;

/**
 * Explicitly flow-controlled, non-blocking, parallel I/O engine, with
 * <strong>swim-codec</strong>-modulated socket modems, and TCP and TLS
 * transports.
 */
@Public
@Since("5.0")
module swim.net {

  requires transitive swim.annotations;
  requires transitive swim.util;
  requires transitive swim.collections;
  requires transitive swim.codec;
  requires swim.repr;
  requires transitive swim.log;
  requires transitive swim.exec;

  exports swim.net;

}
