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

import java.util.Optional;
import org.testng.Assert;
import org.testng.annotations.Test;
import swim.collections.HashTrieMap;
import swim.dataflow.graph.impl.windows.WindowTestingMocks.ActionWithCallback;
import swim.dataflow.graph.impl.windows.WindowTestingMocks.OnInit;
import swim.dataflow.graph.impl.windows.WindowTestingMocks.OutputCollector;
import swim.dataflow.graph.impl.windows.WindowTestingMocks.SelfReplacingCallback;
import swim.dataflow.graph.impl.windows.WindowTestingMocks.SingleAction;
import swim.dataflow.graph.impl.windows.WindowTestingMocks.UnitAssigner;
import swim.dataflow.graph.windows.SingletonWindowStore;
import swim.dataflow.graph.windows.TemporalWindowAssigner;
import swim.dataflow.graph.windows.triggers.Trigger;
import swim.dataflow.graph.windows.triggers.TriggerAction;
import swim.util.Pair;
import swim.util.Unit;

public class DefaultPaneManagerSpec {

  @Test
  public void handleNoActionOnInit() {

    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final MapWindowAccumulators<Unit, Integer> acc = new MapWindowAccumulators<>(HashTrieMap.of(Unit.INSTANCE, 42));
    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createSimple(acc, outputs);

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 0);
    Assert.assertEquals(outputs.getCallbacks().size(), 0);
    final WindowAccumulators<Unit, Integer> internalState = manager.getAccumulators();
    Assert.assertFalse(internalState.windows().isEmpty());
    Assert.assertEquals(internalState.getForWindow(Unit.INSTANCE), Optional.of(43));
  }

  @Test
  public void handlePurgeOnInit() {

    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final MapWindowAccumulators<Unit, Integer> acc = new MapWindowAccumulators<>(HashTrieMap.of(Unit.INSTANCE, 42));
    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createWithTrigger(acc, new OnInit(TriggerAction.PURGE), outputs);

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 0);
    Assert.assertEquals(outputs.getCallbacks().size(), 0);
    final WindowAccumulators<Unit, Integer> internalState = manager.getAccumulators();
    Assert.assertFalse(internalState.windows().isEmpty());
    Assert.assertEquals(internalState.getForWindow(Unit.INSTANCE), Optional.of(1));
  }

  @Test
  public void handleTriggerOnInit() {

    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final MapWindowAccumulators<Unit, Integer> acc = new MapWindowAccumulators<>(HashTrieMap.of(Unit.INSTANCE, 42));
    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createWithTrigger(acc, new OnInit(TriggerAction.TRIGGER), outputs);

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 1);
    Assert.assertEquals(outputs.getOutputs().get(0).getSecond().intValue(), 42);

    Assert.assertEquals(outputs.getCallbacks().size(), 0);
    final WindowAccumulators<Unit, Integer> internalState = manager.getAccumulators();
    Assert.assertFalse(internalState.windows().isEmpty());
    Assert.assertEquals(internalState.getForWindow(Unit.INSTANCE), Optional.of(43));
  }

  @Test
  public void handleTriggerAndPurgeOnInit() {

    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final MapWindowAccumulators<Unit, Integer> acc = new MapWindowAccumulators<>(HashTrieMap.of(Unit.INSTANCE, 42));
    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createWithTrigger(acc, new OnInit(TriggerAction.TRIGGER_AND_PURGE), outputs);

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 1);
    Assert.assertEquals(outputs.getOutputs().get(0).getSecond().intValue(), 42);

    Assert.assertEquals(outputs.getCallbacks().size(), 0);
    final WindowAccumulators<Unit, Integer> internalState = manager.getAccumulators();
    Assert.assertFalse(internalState.windows().isEmpty());
    Assert.assertEquals(internalState.getForWindow(Unit.INSTANCE), Optional.of(1));
  }

  @Test
  public void handleDoubleTriggerOnInit() {

    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final MapWindowAccumulators<Unit, Integer> acc = new MapWindowAccumulators<>(HashTrieMap.of(Unit.INSTANCE, 42));
    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createWithTrigger(acc, new OnInit(TriggerAction.TRIGGER, TriggerAction.TRIGGER), outputs);

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 2);
    Assert.assertEquals(outputs.getOutputs().get(0).getSecond().intValue(), 42);
    Assert.assertEquals(outputs.getOutputs().get(1).getSecond().intValue(), 43);

    Assert.assertEquals(outputs.getCallbacks().size(), 0);
    final WindowAccumulators<Unit, Integer> internalState = manager.getAccumulators();
    Assert.assertFalse(internalState.windows().isEmpty());
    Assert.assertEquals(internalState.getForWindow(Unit.INSTANCE), Optional.of(43));
  }

  @Test
  public void handleTriggerPurgeTriggerOnInit() {

    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final MapWindowAccumulators<Unit, Integer> acc = new MapWindowAccumulators<>(HashTrieMap.of(Unit.INSTANCE, 42));
    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createWithTrigger(acc, new OnInit(TriggerAction.TRIGGER_AND_PURGE, TriggerAction.TRIGGER), outputs);

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 2);
    Assert.assertEquals(outputs.getOutputs().get(0).getSecond().intValue(), 42);
    Assert.assertEquals(outputs.getOutputs().get(1).getSecond().intValue(), 1);

    Assert.assertEquals(outputs.getCallbacks().size(), 0);
    final WindowAccumulators<Unit, Integer> internalState = manager.getAccumulators();
    Assert.assertFalse(internalState.windows().isEmpty());
    Assert.assertEquals(internalState.getForWindow(Unit.INSTANCE), Optional.of(1));
  }


  @Test
  public void requestCallbackOnInit() {
    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final MapWindowAccumulators<Unit, Integer> acc = new MapWindowAccumulators<>(HashTrieMap.of(Unit.INSTANCE, 42));
    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createWithTrigger(acc, new WindowTestingMocks.CallbackOnInit(1000L), outputs);

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 0);
    Assert.assertEquals(outputs.getCallbacks().size(), 1);
    Assert.assertEquals(outputs.getCallbacks().get(0).getFirst().longValue(), 1000L);

    final WindowAccumulators<Unit, Integer> internalState = manager.getAccumulators();
    Assert.assertFalse(internalState.windows().isEmpty());
    Assert.assertEquals(internalState.getForWindow(Unit.INSTANCE), Optional.of(43));
  }

  @Test
  public void ignoreCallbackOnPurgeInit() {
    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final MapWindowAccumulators<Unit, Integer> acc = new MapWindowAccumulators<>(HashTrieMap.of(Unit.INSTANCE, 42));
    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createWithTrigger(acc, new WindowTestingMocks.CallbackOnInit(TriggerAction.PURGE, 1000L), outputs);

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 0);
    Assert.assertEquals(outputs.getCallbacks().size(), 0);

    final WindowAccumulators<Unit, Integer> internalState = manager.getAccumulators();
    Assert.assertFalse(internalState.windows().isEmpty());
    Assert.assertEquals(internalState.getForWindow(Unit.INSTANCE), Optional.of(1));
  }

  @Test
  public void ignoreCallbackOnPurgeAndTriggerInit() {
    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final MapWindowAccumulators<Unit, Integer> acc = new MapWindowAccumulators<>(HashTrieMap.of(Unit.INSTANCE, 42));
    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createWithTrigger(acc, new WindowTestingMocks.CallbackOnInit(TriggerAction.TRIGGER_AND_PURGE, 1000L), outputs);

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 1);
    Assert.assertEquals(outputs.getOutputs().get(0).getSecond().intValue(), 42);
    Assert.assertEquals(outputs.getCallbacks().size(), 0);

    final WindowAccumulators<Unit, Integer> internalState = manager.getAccumulators();
    Assert.assertFalse(internalState.windows().isEmpty());
    Assert.assertEquals(internalState.getForWindow(Unit.INSTANCE), Optional.of(1));
  }

  @Test
  public void handleNoTrigger() {

    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createSimple(TriggerAction.NONE, outputs);

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 0);
    Assert.assertEquals(outputs.getCallbacks().size(), 0);
    final WindowAccumulators<Unit, Integer> internalState = manager.getAccumulators();
    Assert.assertFalse(internalState.windows().isEmpty());
    Assert.assertEquals(internalState.getForWindow(Unit.INSTANCE), Optional.of(1));

  }

  @Test
  public void handlePurge() {
    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createSimple(TriggerAction.PURGE, outputs);

    final HashTrieMap<Unit, Integer> state = HashTrieMap.<Unit, Integer>empty().updated(Unit.INSTANCE, 3);
    manager.setInternalState(new SingletonWindowStore<>(Unit.INSTANCE), new MapWindowAccumulators<>(state));

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 0);
    Assert.assertEquals(outputs.getCallbacks().size(), 0);
    final WindowAccumulators<Unit, Integer> internalState = manager.getAccumulators();
    Assert.assertTrue(internalState.windows().isEmpty());

  }

  @Test
  public void handleTrigger() {
    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createSimple(TriggerAction.TRIGGER, outputs);

    final HashTrieMap<Unit, Integer> state = HashTrieMap.<Unit, Integer>empty().updated(Unit.INSTANCE, 3);
    manager.setInternalState(new SingletonWindowStore<>(Unit.INSTANCE), new MapWindowAccumulators<>(state));

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 1);
    Assert.assertEquals(outputs.getOutputs().get(0).getSecond().intValue(), 4);
    Assert.assertEquals(outputs.getCallbacks().size(), 0);

    final WindowAccumulators<Unit, Integer> internalState = manager.getAccumulators();
    Assert.assertFalse(internalState.windows().isEmpty());
    Assert.assertEquals(internalState.getForWindow(Unit.INSTANCE), Optional.of(4));
  }

  @Test
  public void handleTriggerAndPurge() {
    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createSimple(TriggerAction.TRIGGER_AND_PURGE, outputs);

    final HashTrieMap<Unit, Integer> state = HashTrieMap.<Unit, Integer>empty().updated(Unit.INSTANCE, 3);
    manager.setInternalState(new SingletonWindowStore<>(Unit.INSTANCE), new MapWindowAccumulators<>(state));

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 1);
    Assert.assertEquals(outputs.getOutputs().get(0).getSecond().intValue(), 4);
    Assert.assertEquals(outputs.getCallbacks().size(), 0);

    final WindowAccumulators<Unit, Integer> internalState = manager.getAccumulators();
    Assert.assertTrue(internalState.windows().isEmpty());
  }

  @Test
  public void ignoreTimersOnPurge() {
    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createWithTrigger(new ActionWithCallback(TriggerAction.PURGE, TriggerAction.PURGE, TriggerAction.NONE, 1000L), outputs);

    final HashTrieMap<Unit, Integer> state = HashTrieMap.<Unit, Integer>empty().updated(Unit.INSTANCE, 3);
    manager.setInternalState(new SingletonWindowStore<>(Unit.INSTANCE), new MapWindowAccumulators<>(state));

    manager.update("name", 0L, outputs);

    Assert.assertTrue(outputs.getCallbacks().isEmpty());

  }

  @Test
  public void ignoreTimersOnTriggerAndPurge() {
    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createWithTrigger(new ActionWithCallback(TriggerAction.TRIGGER_AND_PURGE, TriggerAction.PURGE, TriggerAction.NONE, 1000L), outputs);

    final HashTrieMap<Unit, Integer> state = HashTrieMap.<Unit, Integer>empty().updated(Unit.INSTANCE, 3);
    manager.setInternalState(new SingletonWindowStore<>(Unit.INSTANCE), new MapWindowAccumulators<>(state));

    manager.update("name", 0L, outputs);

    Assert.assertTrue(outputs.getCallbacks().isEmpty());

  }

  @Test
  public void handleNoActionOnTimer() {
    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createWithTrigger(new ActionWithCallback(TriggerAction.NONE, TriggerAction.NONE, TriggerAction.NONE, 1000L), outputs);

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 0);
    Assert.assertEquals(outputs.getCallbacks().size(), 1);

    final WindowAccumulators<Unit, Integer> stateBeforeTimer = manager.getAccumulators();
    Assert.assertFalse(stateBeforeTimer.windows().isEmpty());
    Assert.assertEquals(stateBeforeTimer.getForWindow(Unit.INSTANCE), Optional.of(1));

    final Pair<Long, PaneManager.WindowCallback> cbPair = outputs.getCallbacks().get(0);

    outputs.clear();

    Assert.assertEquals(cbPair.getFirst().longValue(), 1000L);
    cbPair.getSecond().runEvent(1000L, 1000L);

    Assert.assertTrue(outputs.getOutputs().isEmpty());
    Assert.assertTrue(outputs.getCallbacks().isEmpty());

    final WindowAccumulators<Unit, Integer> stateAfterTimer = manager.getAccumulators();
    Assert.assertFalse(stateAfterTimer.windows().isEmpty());
    Assert.assertEquals(stateAfterTimer.getForWindow(Unit.INSTANCE), Optional.of(1));

  }

  @Test
  public void handlePurgeOnTimer() {
    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createWithTrigger(new ActionWithCallback(TriggerAction.NONE, TriggerAction.PURGE, TriggerAction.NONE, 1000L), outputs);

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 0);
    Assert.assertEquals(outputs.getCallbacks().size(), 1);

    final WindowAccumulators<Unit, Integer> stateBeforeTimer = manager.getAccumulators();
    Assert.assertFalse(stateBeforeTimer.windows().isEmpty());
    Assert.assertEquals(stateBeforeTimer.getForWindow(Unit.INSTANCE), Optional.of(1));

    final Pair<Long, PaneManager.WindowCallback> cbPair = outputs.getCallbacks().get(0);

    outputs.clear();

    Assert.assertEquals(cbPair.getFirst().longValue(), 1000L);
    cbPair.getSecond().runEvent(1000L, 1000L);

    Assert.assertTrue(outputs.getOutputs().isEmpty());
    Assert.assertTrue(outputs.getCallbacks().isEmpty());

    final WindowAccumulators<Unit, Integer> stateAfterTimer = manager.getAccumulators();
    Assert.assertTrue(stateAfterTimer.windows().isEmpty());

  }

  @Test
  public void handleTriggerOnTimer() {
    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createWithTrigger(new ActionWithCallback(TriggerAction.NONE, TriggerAction.TRIGGER, TriggerAction.NONE, 1000L), outputs);

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 0);
    Assert.assertEquals(outputs.getCallbacks().size(), 1);

    final WindowAccumulators<Unit, Integer> stateBeforeTimer = manager.getAccumulators();
    Assert.assertFalse(stateBeforeTimer.windows().isEmpty());
    Assert.assertEquals(stateBeforeTimer.getForWindow(Unit.INSTANCE), Optional.of(1));

    final Pair<Long, PaneManager.WindowCallback> cbPair = outputs.getCallbacks().get(0);

    outputs.clear();

    Assert.assertEquals(cbPair.getFirst().longValue(), 1000L);
    cbPair.getSecond().runEvent(1000L, 1000L);

    Assert.assertEquals(outputs.getOutputs().size(), 1);
    Assert.assertEquals(outputs.getOutputs().get(0).getSecond().intValue(), 1);
    Assert.assertTrue(outputs.getCallbacks().isEmpty());

    final WindowAccumulators<Unit, Integer> stateAfterTimer = manager.getAccumulators();
    Assert.assertFalse(stateAfterTimer.windows().isEmpty());
    Assert.assertEquals(stateAfterTimer.getForWindow(Unit.INSTANCE), Optional.of(1));

  }

  @Test
  public void handleTriggerAndPurgeOnTimer() {
    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createWithTrigger(new ActionWithCallback(TriggerAction.NONE, TriggerAction.TRIGGER_AND_PURGE,
            TriggerAction.NONE, 1000L), outputs);

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 0);
    Assert.assertEquals(outputs.getCallbacks().size(), 1);

    final WindowAccumulators<Unit, Integer> stateBeforeTimer = manager.getAccumulators();
    Assert.assertFalse(stateBeforeTimer.windows().isEmpty());
    Assert.assertEquals(stateBeforeTimer.getForWindow(Unit.INSTANCE), Optional.of(1));

    final Pair<Long, PaneManager.WindowCallback> cbPair = outputs.getCallbacks().get(0);

    outputs.clear();

    Assert.assertEquals(cbPair.getFirst().longValue(), 1000L);
    cbPair.getSecond().runEvent(1000L, 1000L);

    Assert.assertEquals(outputs.getOutputs().size(), 1);
    Assert.assertEquals(outputs.getOutputs().get(0).getSecond().intValue(), 1);
    Assert.assertTrue(outputs.getCallbacks().isEmpty());

    final WindowAccumulators<Unit, Integer> stateAfterTimer = manager.getAccumulators();
    Assert.assertTrue(stateAfterTimer.windows().isEmpty());

  }

  @Test
  public void ignoreNewTimersOnTimerOnPurge() {
    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createWithTrigger(new SelfReplacingCallback(
            TriggerAction.NONE, TriggerAction.PURGE, TriggerAction.NONE, 1000L, 100L), outputs);

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 0);
    Assert.assertEquals(outputs.getCallbacks().size(), 1);

    final WindowAccumulators<Unit, Integer> stateBeforeTimer = manager.getAccumulators();
    Assert.assertFalse(stateBeforeTimer.windows().isEmpty());
    Assert.assertEquals(stateBeforeTimer.getForWindow(Unit.INSTANCE), Optional.of(1));

    final Pair<Long, PaneManager.WindowCallback> cbPair = outputs.getCallbacks().get(0);

    outputs.clear();

    Assert.assertEquals(cbPair.getFirst().longValue(), 1000L);
    cbPair.getSecond().runEvent(1000L, 1000L);

    Assert.assertTrue(outputs.getOutputs().isEmpty());
    Assert.assertTrue(outputs.getCallbacks().isEmpty());

    final WindowAccumulators<Unit, Integer> stateAfterTimer = manager.getAccumulators();
    Assert.assertTrue(stateAfterTimer.windows().isEmpty());
  }

  @Test
  public void ignoreNewTimersOnTimerOnTriggerAndPurge() {
    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createWithTrigger(new SelfReplacingCallback(
            TriggerAction.NONE, TriggerAction.TRIGGER_AND_PURGE, TriggerAction.NONE, 1000L, 100L), outputs);

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 0);
    Assert.assertEquals(outputs.getCallbacks().size(), 1);

    final WindowAccumulators<Unit, Integer> stateBeforeTimer = manager.getAccumulators();
    Assert.assertFalse(stateBeforeTimer.windows().isEmpty());
    Assert.assertEquals(stateBeforeTimer.getForWindow(Unit.INSTANCE), Optional.of(1));

    final Pair<Long, PaneManager.WindowCallback> cbPair = outputs.getCallbacks().get(0);

    outputs.clear();

    Assert.assertEquals(cbPair.getFirst().longValue(), 1000L);
    cbPair.getSecond().runEvent(1000L, 1000L);

    Assert.assertEquals(outputs.getOutputs().size(), 1);
    Assert.assertEquals(outputs.getOutputs().get(0).getSecond().intValue(), 1);
    Assert.assertTrue(outputs.getCallbacks().isEmpty());

    final WindowAccumulators<Unit, Integer> stateAfterTimer = manager.getAccumulators();
    Assert.assertTrue(stateAfterTimer.windows().isEmpty());
  }

  @Test
  public void registerCallbackOnTimerOnNoAction() {
    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createWithTrigger(new SelfReplacingCallback(
            TriggerAction.NONE, TriggerAction.NONE, TriggerAction.NONE, 1000L, 100L), outputs);

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 0);
    Assert.assertEquals(outputs.getCallbacks().size(), 1);

    final WindowAccumulators<Unit, Integer> stateBeforeTimer = manager.getAccumulators();
    Assert.assertFalse(stateBeforeTimer.windows().isEmpty());
    Assert.assertEquals(stateBeforeTimer.getForWindow(Unit.INSTANCE), Optional.of(1));

    final Pair<Long, PaneManager.WindowCallback> cbPair = outputs.getCallbacks().get(0);

    outputs.clear();

    Assert.assertEquals(cbPair.getFirst().longValue(), 1000L);
    cbPair.getSecond().runEvent(1000L, 1000L);

    Assert.assertTrue(outputs.getOutputs().isEmpty());
    Assert.assertEquals(outputs.getCallbacks().size(), 1);

    final Pair<Long, PaneManager.WindowCallback> newCbPair = outputs.getCallbacks().get(0);

    Assert.assertEquals(newCbPair.getFirst().longValue(), 1100L);

    final WindowAccumulators<Unit, Integer> stateAfterTimer = manager.getAccumulators();
    Assert.assertFalse(stateAfterTimer.windows().isEmpty());
    Assert.assertEquals(stateAfterTimer.getForWindow(Unit.INSTANCE), Optional.of(1));
  }

  @Test
  public void registerCallbackOnTimerOnTrigger() {
    final OutputCollector<Unit> outputs = new OutputCollector<>();

    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        createWithTrigger(new SelfReplacingCallback(
            TriggerAction.NONE, TriggerAction.TRIGGER, TriggerAction.NONE, 1000L, 100L), outputs);

    manager.update("name", 0L, outputs);

    Assert.assertEquals(outputs.getOutputs().size(), 0);
    Assert.assertEquals(outputs.getCallbacks().size(), 1);

    final WindowAccumulators<Unit, Integer> stateBeforeTimer = manager.getAccumulators();
    Assert.assertFalse(stateBeforeTimer.windows().isEmpty());
    Assert.assertEquals(stateBeforeTimer.getForWindow(Unit.INSTANCE), Optional.of(1));

    final Pair<Long, PaneManager.WindowCallback> cbPair = outputs.getCallbacks().get(0);

    outputs.clear();

    Assert.assertEquals(cbPair.getFirst().longValue(), 1000L);
    cbPair.getSecond().runEvent(1000L, 1000L);

    Assert.assertEquals(outputs.getOutputs().size(), 1);
    Assert.assertEquals(outputs.getOutputs().get(0).getSecond().intValue(), 1);
    Assert.assertEquals(outputs.getCallbacks().size(), 1);

    final Pair<Long, PaneManager.WindowCallback> newCbPair = outputs.getCallbacks().get(0);

    Assert.assertEquals(newCbPair.getFirst().longValue(), 1100L);

    final WindowAccumulators<Unit, Integer> stateAfterTimer = manager.getAccumulators();
    Assert.assertFalse(stateAfterTimer.windows().isEmpty());
    Assert.assertEquals(stateAfterTimer.getForWindow(Unit.INSTANCE), Optional.of(1));
  }

  private static DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> createSimple(
      final WindowAccumulators<Unit, Integer> accumulators,
      final OutputCollector<Unit> outputs) {
    return createWithTrigger(accumulators, new SingleAction(TriggerAction.NONE), outputs);
  }

  private static DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> createSimple(
      final TriggerAction action, final OutputCollector<Unit> outputs) {
    return createWithTrigger(new MapWindowAccumulators<>(), new SingleAction(action), outputs);
  }

  private static DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> createWithTrigger(
      final Trigger<String, Unit> trigger, final OutputCollector<Unit> outputs) {
    return createWithTrigger(new MapWindowAccumulators<>(), trigger, outputs);
  }

  private static DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> createWithTrigger(
      final WindowAccumulators<Unit, Integer> accumulators,
      final Trigger<String, Unit> trigger, final OutputCollector<Unit> outputs) {
    final TemporalWindowAssigner<String, Unit, SingletonWindowStore<Unit>> assigner = new UnitAssigner();


    final PaneUpdater<String, Unit, Integer> updater = new PaneUpdater<String, Unit, Integer>() {
      @Override
      public Integer createPane(final Unit window) {
        return 0;
      }

      @Override
      public Integer addContribution(final Integer state, final Unit window, final String data, final long timestamp) {
        return state + 1;
      }
    };

    final PaneEvictor<String, Unit, Integer> evictor = NoOpEvictor.instance();
    final PaneEvaluator<Integer, Unit, Integer> evaluator = PaneEvaluator.identity();



    final DefaultPaneManager<String, Unit, SingletonWindowStore<Unit>, Integer, Integer> manager =
        new DefaultPaneManager<>(accumulators, assigner, trigger, updater, evictor, evaluator);

    manager.setListener(outputs);
    return manager;
  }


}
