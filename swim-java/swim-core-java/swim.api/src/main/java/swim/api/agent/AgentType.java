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

package swim.api.agent;

import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriPattern;

/**
 * Metadata for an {@link Agent} of type {@code A}.
 */
public interface AgentType<A extends Agent> extends AgentFactory<A> {
  /**
   * The internal context used to provide concrete implementations to most
   * {@code AgentType} methods.
   */
  AgentTypeContext getAgentTypeContext();

  /**
   * Updates the internal context used to provide concrete implementations to
   * most {@code AgentType} methods.
   */
  void setAgentTypeContext(AgentTypeContext context);

  /**
   * TODO
   */
  String name();

  /**
   * The {@code UriPattern} that every {@code nodeUri} corresponding to an
   * instance of {@code A} must match.
   */
  UriPattern route();

  /**
   * The Java {@code class} of {@code A}.
   */
  Class<? extends A> type();

  /**
   * A {@link swim.structure.Record} that maps every dynamic property in {@code
   * nodeUri} to its value.  An empty result indicates that {@code nodeUri}
   * either contains no dynamic components or does not match {@link #route()}.
   */
  Value props(Uri nodeUri);
}
