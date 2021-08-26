// Copyright 2015-2021 Swim Inc.
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
   * <p>
   * //@see swim.system.TierBinding#open
   */
  void willOpen();

  /**
   * Lifecycle callback invoked immediately after this {@code Agent} opens, i.e.
   * before it loads.
   * <p>
   * //@see swim.system.TierBinding#open
   * //@see swim.system.TierBinding#load
   */
  void didOpen();

  /**
   * Lifecycle callback invoked immediately before this {@code Agent} loads.
   * <p>
   * //@see swim.system.TierBinding#load
   */
  void willLoad();

  /**
   * Lifecycle callback invoked immediately after this {@code Agent} loads, i.e.
   * before it starts.
   * <p>
   * //@see swim.system.TierBinding#load
   * //@see swim.system.TierBinding#start
   */
  void didLoad();

  /**
   * Lifecycle callback invoked immediately before this {@code Agent} starts.
   * <p>
   * //@see swim.system.TierBinding#start
   */
  void willStart();

  /**
   * Lifecycle callback invoked immediately after this {@code Agent} starts.
   * <p>
   * //@see swim.system.TierBinding#start
   */
  void didStart();

  /**
   * Lifecycle callback invoked immediately before this {@code Agent} stops.
   * <p>
   * //@see swim.system.TierBinding#stop
   */
  void willStop();

  /**
   * Lifecycle callback invoked immediately after this {@code Agent} stops, i.e.
   * before it unloads.
   * <p>
   * //@see swim.system.TierBinding#stop
   * //@see swim.system.TierBinding#unload
   */
  void didStop();

  /**
   * Lifecycle callback invoked immediately before this {@code Agent} unloads.
   * <p>
   * //@see swim.system.TierBinding#unload
   */
  void willUnload();

  /**
   * Lifecycle callback invoked immediately after this {@code Agent} unloads,
   * i.e. before it closes.
   * <p>
   * //@see swim.system.TierBinding.unload
   * //@see swim.system.TierBinding.close
   */
  void didUnload();

  /**
   * Lifecycle callback invoked immediately before this {@code Agent} closes.
   * <p>
   * //@see swim.system.TierBinding.close
   */
  void willClose();

  /**
   * Lifecycle callback invoked immediately after this {@code Agent} closes.
   * <p>
   * //@see swim.system.TierBinding.close
   */
  void didClose();

  /**
   * Lifecycle callback invoked immediately after this {@code Agent} throws
   * {@code error}.
   */
  void didFail(Throwable error);

}
