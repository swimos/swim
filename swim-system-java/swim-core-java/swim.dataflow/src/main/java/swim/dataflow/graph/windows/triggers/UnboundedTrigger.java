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

package swim.dataflow.graph.windows.triggers;

import swim.dataflow.graph.timestamps.TimestampContext;

/**
 * A trigger that fires every time an element is added and never purges the window.
 *
 * @param <T> The type of the values.
 * @param <W> The type of the windows.
 */
public class UnboundedTrigger<T, W> implements Trigger<T, W> {
  @Override
  public TriggerAction onNewValue(final T data, final W window, final TimestampContext time) {
    return TriggerAction.TRIGGER;
  }

  @Override
  public TriggerAction onTimer(final W window, final TimestampContext time) {
    return TriggerAction.NONE;
  }

  @Override
  public TriggerAction onRestore(final W window, final TimestampContext time) {
    return TriggerAction.NONE;
  }
}
