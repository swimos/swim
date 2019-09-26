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

package swim.streaming.windows;

import swim.streaming.windows.eviction.EvictionStrategy;
import swim.streaming.windows.triggers.Trigger;
import swim.structure.Form;

/**
 * Complete description of windowing for a stream.
 *
 * @param <T> The type of the values.
 * @param <W> The type of the windows.
 * @param <S> The type of the open windows state store.
 */
public final class WindowSpec<T, W, S extends WindowState<W, S>> {

  private final TemporalWindowAssigner<T, W, S> assigner;
  private final Trigger<T, W> trigger;
  private final EvictionStrategy<T, W> eviction;
  private final Form<W> windowForm;
  private final boolean isTransient;

  public WindowSpec(final TemporalWindowAssigner<T, W, S> assigner,
                    final Trigger<T, W> trigger,
                    final EvictionStrategy<T, W> strategy,
                    final Form<W> windowForm,
                    final boolean isTransient) {
    this.assigner = assigner;
    this.trigger = trigger;
    eviction = strategy;
    this.windowForm = windowForm;
    this.isTransient = isTransient;
  }

  public TemporalWindowAssigner<T, W, S> getAssigner() {
    return assigner;
  }

  public Trigger<T, W> getTrigger() {
    return trigger;
  }

  public EvictionStrategy<T, W> getEvictionStrategy() {
    return eviction;
  }

  public Form<W> getWindowForm() {
    return windowForm;
  }

  public boolean isTransient() {
    return isTransient;
  }
}
