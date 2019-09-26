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

package swim.dataflow.graph.impl.windows;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.function.Function;
import swim.dataflow.graph.timestamps.TimestampContext;
import swim.dataflow.graph.windows.SingletonWindowStore;
import swim.dataflow.graph.windows.TemporalWindowAssigner;
import swim.dataflow.graph.windows.triggers.Trigger;
import swim.dataflow.graph.windows.triggers.TriggerAction;
import swim.util.Pair;
import swim.util.Unit;

final class WindowTestingMocks {

  private WindowTestingMocks() {

  }

  static final class OutputCollector<W> implements PaneManager.Listener<W, Integer>, PaneManager.TimeContext {

    private final ArrayList<Pair<W, Integer>> outputs = new ArrayList<>();
    private final ArrayList<Pair<Long, PaneManager.WindowCallback>> callbacks = new ArrayList<>();

    public List<Pair<W, Integer>> getOutputs() {
      return outputs;
    }

    public List<Pair<Long, PaneManager.WindowCallback>> getCallbacks() {
      return callbacks;
    }

    public void clear() {
      outputs.clear();
      callbacks.clear();
    }

    @Override
    public void accept(final W window, final Integer value) {
      outputs.add(Pair.pair(window, value));
    }

    @Override
    public void scheduleAt(final long timestamp, final PaneManager.WindowCallback callback) {
      callbacks.add(Pair.pair(timestamp, callback));
    }
  }

  static final class CallbackOnInit implements Trigger<String, Unit> {

    private final TriggerAction action;
    private final long ts;

    CallbackOnInit(final TriggerAction action, final long ts) {
      this.action = action;
      this.ts = ts;
    }

    CallbackOnInit(final long ts) {
      this(TriggerAction.NONE, ts);
    }

    @Override
    public TriggerAction onNewValue(final String data, final Unit window, final TimestampContext time) {
      return TriggerAction.NONE;
    }

    @Override
    public TriggerAction onTimer(final Unit window, final TimestampContext time) {
      return TriggerAction.NONE;
    }

    @Override
    public TriggerAction onRestore(final Unit window, final TimestampContext time) {
      time.scheduleAt(ts);
      return action;
    }
  }

  static final class OnInit implements Trigger<String, Unit> {

    private final TriggerAction action;
    private final TriggerAction actionOnData;

    OnInit(final TriggerAction action, final TriggerAction onData) {
      this.action = action;
      actionOnData = onData;
    }

    OnInit(final TriggerAction action) {
      this(action, TriggerAction.NONE);
    }

    @Override
    public TriggerAction onNewValue(final String data, final Unit window, final TimestampContext time) {
      return actionOnData;
    }

    @Override
    public TriggerAction onTimer(final Unit window, final TimestampContext time) {
      return TriggerAction.NONE;
    }

    @Override
    public TriggerAction onRestore(final Unit window, final TimestampContext time) {
      return action;
    }
  }

  static final class SingleAction implements Trigger<String, Unit> {

    private final TriggerAction action;

    SingleAction(final TriggerAction action) {
      this.action = action;
    }

    @Override
    public TriggerAction onNewValue(final String data, final Unit window, final TimestampContext time) {
      return action;
    }

    @Override
    public TriggerAction onTimer(final Unit window, final TimestampContext time) {
      return action;
    }

    @Override
    public TriggerAction onRestore(final Unit window, final TimestampContext time) {
      return action;
    }
  }

  static final class ActionWithCallback implements Trigger<String, Unit> {

    private final TriggerAction action;
    private final TriggerAction onCallback;
    private final TriggerAction onRestore;
    private final long timestamp;

    ActionWithCallback(final TriggerAction action, final TriggerAction onCallback,
                       final TriggerAction onRestore, final long timestamp) {
      this.action = action;
      this.onRestore = onRestore;
      this.timestamp = timestamp;
      this.onCallback = onCallback;
    }

    @Override
    public TriggerAction onNewValue(final String data, final Unit window, final TimestampContext time) {
      time.scheduleAt(timestamp);
      return action;
    }

    @Override
    public TriggerAction onTimer(final Unit window, final TimestampContext time) {
      return onCallback;
    }

    @Override
    public TriggerAction onRestore(final Unit window, final TimestampContext time) {
      return onRestore;
    }
  }

  static final class SelfReplacingCallback implements Trigger<String, Unit> {

    private final TriggerAction action;
    private final TriggerAction onCallback;
    private final TriggerAction onRestore;
    private long timestamp;
    private final long increment;

    SelfReplacingCallback(final TriggerAction action,
                          final TriggerAction onCallback,
                          final TriggerAction onRestore, final long timestamp,
                          final long increment) {
      this.action = action;
      this.onRestore = onRestore;
      this.timestamp = timestamp;
      this.onCallback = onCallback;
      this.increment = increment;
    }


    @Override
    public TriggerAction onNewValue(final String data, final Unit window, final TimestampContext time) {
      time.scheduleAt(timestamp);
      timestamp += increment;
      return action;
    }

    @Override
    public TriggerAction onTimer(final Unit window, final TimestampContext time) {
      time.scheduleAt(timestamp);
      timestamp += increment;
      return onCallback;
    }

    @Override
    public TriggerAction onRestore(final Unit window, final TimestampContext time) {
      time.scheduleAt(timestamp);
      timestamp += increment;
      return onRestore;
    }
  }

  static final class UnitAssigner implements TemporalWindowAssigner<String, Unit, SingletonWindowStore<Unit>> {

    @Override
    public Function<Set<Unit>, SingletonWindowStore<Unit>> stateInitializer() {
      return windows -> new SingletonWindowStore<>(Unit.INSTANCE);
    }

    @Override
    public Assignment<Unit, SingletonWindowStore<Unit>> windowsFor(final String value, final long timestamp,
                                                                   final SingletonWindowStore<Unit> openWindows) {
      return new Assignment<Unit, SingletonWindowStore<Unit>>() {
        @Override
        public Set<Unit> windows() {
          return Collections.singleton(Unit.INSTANCE);
        }

        @Override
        public SingletonWindowStore<Unit> updatedState() {
          return openWindows;
        }
      };
    }
  }
}
