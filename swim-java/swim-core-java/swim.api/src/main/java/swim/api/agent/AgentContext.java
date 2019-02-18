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

import swim.api.Link;
import swim.api.data.DataFactory;
import swim.api.lane.Lane;
import swim.api.lane.LaneFactory;
import swim.api.ref.SwimRef;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Log;

/**
 * Internal context that enables URI-based addressability, contextual {@code
 * Lane} and {@code Store} creation mechanisms, logging, and scheduling to some
 * {@link Agent}.
 */
public interface AgentContext extends SwimRef, LaneFactory, DataFactory, Log {

  /**
   * The {@code hostUri} of the {@code Agent} managed by this {@code
   * AgentContext}.
   */
  Uri hostUri();

  /**
   * The {@code nodeUri} of the {@code Agent} managed by this {@code
   * AgentContext}.
   */
  Uri nodeUri();

  /**
   * The {@link AgentType} corresponding to the Java {@code class} of the {@code
   * Agent} that this {@code AgentContext} manages.
   */
  AgentType<?> agentType();

  /**
   * A {@link swim.structure.Record} that maps every dynamic property in
   * {@link #nodeUri()}, as defined by {@link AgentType#route()
   * {@code agentType().route()}}, to its value.  An empty result indicates that
   * {@code nodeUri} contains no dynamic components.
   */
  Value props();

  /**
   * Returns the value of {@code key} in {@link #props()}.
   */
  Value getProp(Value key);

  /**
   * Returns the value of {@code name} in {@link #props()}.
   */
  Value getProp(String name);

  /**
   * The {@link Schedule} that this {@code AgentContext} is bound to.
   */
  Schedule schedule();

  /**
   * The {@link Stage} that this {@code AgentContext} is bound to.
   */
  Stage stage();

  /**
   * Returns the currently executing lane, or null if not currently executing
   * a lane or link callback.
   */
  Lane lane();

  /**
   * Returns the currently executing link, or null if not currently executing
   * a link callback.
   */
  Link link();

  FingerTrieSeq<Agent> traits();

  <A extends Agent> A getTrait(Value props);

  <A extends Agent> A getTrait(String name);

  <A extends Agent> A getTrait(Class<A> agentClass);

  <A extends Agent> A addTrait(Value props, AgentFactory<A> agentFactory);

  <A extends Agent> A addTrait(String name, AgentFactory<A> agentFactory);

  <A extends Agent> A addTrait(Value props, Class<A> agentClass);

  <A extends Agent> A addTrait(String name, Class<A> agentClass);

  void removeTrait(Value props);

  void removeTrait(String name);

  /**
   * Returns the {@code Lane} belonging to the {@code Agent} managed by this
   * {@code AgentContext} that is addressable by {@code laneUri}, or {@code
   * null} if no such {@code Lane} exists.
   */
  Lane getLane(Uri laneUri);

  /**
   * Registers {@code lane} with {@code laneUri} and returns {@code lane}.
   */
  Lane openLane(Uri laneUri, Lane lane);
}
