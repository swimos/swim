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

import java.util.function.Function;
import swim.streaming.windows.eviction.EvictionStrategy;
import swim.streaming.windows.triggers.Trigger;
import swim.structure.Form;

public final class KeyedWindowSpec<K, V, W, S extends WindowState<W, S>> {

  private final Function<K, TemporalWindowAssigner<V, W, S>> assigner;
  private final Function<K, Trigger<V, W>> trigger;
  private final Function<K, EvictionStrategy<V, W>> eviction;
  private final Form<W> windowForm;
  private final boolean isTransient;

  public KeyedWindowSpec(final Function<K, TemporalWindowAssigner<V, W, S>> assigner,
                         final Function<K, Trigger<V, W>> trigger,
                         final Function<K, EvictionStrategy<V, W>> strategy,
                         final Form<W> windowForm,
                         final boolean isTransient) {
    this.assigner = assigner;
    this.trigger = trigger;
    eviction = strategy;
    this.windowForm = windowForm;
    this.isTransient = isTransient;
  }

  public Function<K, TemporalWindowAssigner<V, W, S>> getAssigner() {
    return assigner;
  }

  public Function<K, Trigger<V, W>> getTrigger() {
    return trigger;
  }

  public Function<K, EvictionStrategy<V, W>> getEvictionStrategy() {
    return eviction;
  }

  public Form<W> getWindowForm() {
    return windowForm;
  }

  public boolean isTransient() {
    return isTransient;
  }
}
