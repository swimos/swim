// Copyright 2015-2022 Swim.inc
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
 * HTTP transport implementation.
 */
@Public
@Since("5.0")
module swim.net.http {

  requires transitive swim.annotations;
  requires transitive swim.collections;
  requires transitive swim.util;
  requires transitive swim.codec;
  requires swim.repr;
  requires transitive swim.uri;
  requires transitive swim.http;
  requires transitive swim.log;
  requires transitive swim.exec;
  requires transitive swim.net;

  exports swim.net.http;

}
