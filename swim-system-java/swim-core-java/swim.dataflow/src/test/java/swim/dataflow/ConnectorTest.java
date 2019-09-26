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

package swim.dataflow;

import org.testng.Assert;
import swim.collections.HashTrieMap;
import swim.concurrent.AbstractTimer;
import swim.concurrent.Schedule;
import swim.concurrent.TimerContext;
import swim.concurrent.TimerFunction;
import swim.concurrent.TimerRef;
import swim.streaming.MapReceptacle;
import swim.streaming.MapView;
import swim.streamlet.ConnectorUtilities;
import swim.util.Deferred;

public abstract class ConnectorTest {

  protected ConnectorTest() {
  }

  private static class ExpectUpdate<K, V> implements MapReceptacle<K, V> {

    private final ConnectorUtilities.UpdateHandler<K, V> handler;

    ExpectUpdate(final ConnectorUtilities.UpdateHandler<K, V> handler) {
      this.handler = handler;
    }

    @Override
    public void notifyChange(final K key, final Deferred<V> value, final Deferred<MapView<K, V>> map) {
      handler.onUpdate(key, value.get(), map.get());
    }

    @Override
    public void notifyRemoval(final K key, final Deferred<MapView<K, V>> map) {
      Assert.fail("Update expected.");
    }
  }

  private static class ExpectRemove<K, V> implements MapReceptacle<K, V> {

    private final ConnectorUtilities.RemovalHandler<K, V> handler;

    ExpectRemove(final ConnectorUtilities.RemovalHandler<K, V> handler) {
      this.handler = handler;
    }

    @Override
    public void notifyChange(final K key, final Deferred<V> value, final Deferred<MapView<K, V>> map) {
      Assert.fail("Removal expected.");
    }

    @Override
    public void notifyRemoval(final K key, final Deferred<MapView<K, V>> map) {
      handler.onRemove(key, map.get());
    }
  }

  public <K, V> void expectUpdate(final ConnectorUtilities.MapAction<K, V> action, final ConnectorUtilities.UpdateHandler<K, V> handler) {
    action.push(new ExpectUpdate<>(handler));
  }

  public <K, V> void expectRemoval(final ConnectorUtilities.MapAction<K, V> action, final ConnectorUtilities.RemovalHandler<K, V> handler) {
    action.push(new ExpectRemove<>(handler));
  }

  public static final class FakeSchedule implements Schedule {

    private HashTrieMap<Long, TimerFunction> scheduled = HashTrieMap.empty();

    public HashTrieMap<Long, TimerFunction> getScheduled() {
      return scheduled;
    }

    public void runScheduled(final long time) {
      if (scheduled.containsKey(time)) {
        final TimerFunction f = scheduled.get(time);
        scheduled = scheduled.removed(time);
        f.runTimer();
      }
    }

    @Override
    public TimerRef timer(final TimerFunction timer) {
      final Context context = new Context(-1, timer);
      if (timer instanceof AbstractTimer) {
        ((AbstractTimer) timer).setTimerContext(context);
      }
      return context;
    }

    @Override
    public TimerRef setTimer(final long millis, final TimerFunction timer) {
      scheduled = scheduled.updated(millis, timer);
      final Context context = new Context(millis, timer);
      if (timer instanceof AbstractTimer) {
        ((AbstractTimer) timer).setTimerContext(context);
      }
      return context;
    }

    private final class Context implements TimerContext {

      private final long time;
      private final TimerFunction f;

      private Context(final long time, final TimerFunction f) {
        this.time = time;
        this.f = f;
      }

      @Override
      public Schedule schedule() {
        return FakeSchedule.this;
      }

      @Override
      public boolean isScheduled() {
        return scheduled.containsKey(time);
      }

      @Override
      public void reschedule(final long millis) {
        if (scheduled.containsKey(time)) {
          scheduled = scheduled.removed(time);
        }
        scheduled = scheduled.updated(millis, f);
      }

      @Override
      public boolean cancel() {
        scheduled = scheduled.removed(time);
        return true;
      }
    }
  }

}

