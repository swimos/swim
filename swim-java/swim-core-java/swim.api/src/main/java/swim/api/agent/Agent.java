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

public interface Agent {
  /**
   * Returns the {@link AgentContext} used to manage this {@code Agent}.
   */
  AgentContext agentContext();

  /**
   * Lifecycle callback invoked immediately before this {@code Agent} opens.
   *
   * //@see swim.runtime.TierBinding#open
   */
  void willOpen();

  /**
   * Lifecycle callback invoked immediately after this {@code Agent} opens, i.e.
   * before it loads.
   *
   * //@see swim.runtime.TierBinding#open
   * //@see swim.runtime.TierBinding#load
   */
  void didOpen();

  /**
   * Lifecycle callback invoked immediately before this {@code Agent} loads.
   *
   * //@see swim.runtime.TierBinding#load
   */
  void willLoad();

  /**
   * Lifecycle callback invoked immediately after this {@code Agent} loads, i.e.
   * before it starts.
   *
   * //@see swim.runtime.TierBinding#load
   * //@see swim.runtime.TierBinding#start
   */
  void didLoad();

  /**
   * Lifecycle callback invoked immediately before this {@code Agent} starts.
   *
   * //@see swim.runtime.TierBinding#start
   */
  void willStart();

  /**
   * Lifecycle callback invoked immediately after this {@code Agent} starts.
   *
   * //@see swim.runtime.TierBinding#start
   */
  void didStart();

  /**
   * Lifecycle callback invoked immediately before this {@code Agent} stops.
   *
   * //@see swim.runtime.TierBinding#stop
   */
  void willStop();

  /**
   * Lifecycle callback invoked immediately after this {@code Agent} stops, i.e.
   * before it unloads.
   *
   * //@see swim.runtime.TierBinding#stop
   * //@see swim.runtime.TierBinding#unload
   */
  void didStop();

  /**
   * Lifecycle callback invoked immediately before this {@code Agent} unloads.
   *
   * //@see swim.runtime.TierBinding#unload
   */
  void willUnload();

  /**
   * Lifecycle callback invoked immediately after this {@code Agent} unloads,
   * i.e. before it closes.
   *
   * //@see swim.runtime.TierBinding.unload
   * //@see swim.runtime.TierBinding.close
   */
  void didUnload();

  /**
   * Lifecycle callback invoked immediately before this {@code Agent} closes.
   *
   * //@see swim.runtime.TierBinding.close
   */
  void willClose();

  /**
   * Lifecycle callback invoked immediately after this {@code Agent} closes.
   *
   * //@see swim.runtime.TierBinding.close
   */
  void didClose();

  /**
   * Lifecycle callback invoked immediately after this {@code Agent} throws
   * {@code error}.
   */
  void didFail(Throwable error);
}
