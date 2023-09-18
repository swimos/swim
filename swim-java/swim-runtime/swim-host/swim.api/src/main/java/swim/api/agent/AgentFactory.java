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

package swim.api.agent;

import swim.structure.Value;
import swim.uri.Uri;

/**
 * For some class {@code A extends Agent}, factory to create instances of
 * {@code A}.
 */
public interface AgentFactory<A extends Agent> {

  /**
   * Creates an instance of {@code A} with internal context {@code context}.
   */
  A createAgent(AgentContext context);

  Value id(Uri nodeUri);

  Value props(Uri nodeUri);

}
