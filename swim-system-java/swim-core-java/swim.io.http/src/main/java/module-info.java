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
 * HTTP client and server socket modems for pipelining and concurrently
 * transporting explicitly flow-controlled HTTP streams over a network
 * without blocking or intermediate buffering.
 */
module swim.io.http {
  requires swim.util;
  requires transitive swim.codec;
  requires swim.collections;
  requires transitive swim.http;
  requires transitive swim.io;

  exports swim.io.http;
}
