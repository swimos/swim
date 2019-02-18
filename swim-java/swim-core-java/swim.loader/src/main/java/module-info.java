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
 * Dynamic runtime loader.
 */
module swim.loader {
  requires transitive swim.api;
  requires transitive swim.linker;
  requires transitive swim.recon;

  exports swim.loader;

  uses swim.api.client.Client;
  uses swim.api.client.ClientContext;
  uses swim.api.router.Router;
  uses swim.api.server.Server;
  uses swim.api.server.ServerContext;
}
