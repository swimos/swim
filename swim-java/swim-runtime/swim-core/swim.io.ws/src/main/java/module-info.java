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
 * WebSocket modem for concurrently transporting explicitly flow-controlled
 * WebSocket streams over a network without blocking or intermediate buffering,
 * and <strong>swim-io-http</strong> requesters and responders for upgrading
 * HTTP client and server modems to WebSocket modems.
 */
module swim.io.ws {
  requires swim.util;
  requires transitive swim.codec;
  requires transitive swim.structure;
  requires transitive swim.http;
  requires transitive swim.ws;
  requires transitive swim.io;
  requires transitive swim.io.http;

  exports swim.io.ws;
}
