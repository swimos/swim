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

package swim.dataflow.windows;

import java.util.NavigableSet;
import java.util.Optional;
import java.util.TreeSet;
import swim.streaming.timestamps.TimestampContext;
import swim.streaming.windows.TemporalWindowAssigner;
import swim.streaming.windows.WindowState;
import swim.streaming.windows.triggers.Trigger;
import swim.streaming.windows.triggers.TriggerAction;

/**
 * Default implementation of {@link PaneManager} that delegates to a window assigner, trigger, pane updater, pane
 * evictor and evaluator to provide the logic.
 * @param <T> The type of the elements.
 * @param <W> The type of the window.
 * @param <WS> The type of the state containing the currently open windows.
 * @param <S> The type of the state of a window pane.
 * @param <U> The type of the result of evaluating a window pane.
 */
public final class DefaultPaneManager<T, W, WS extends WindowState<W, WS>, S, U>
        implements PaneManager<T, W, U> {

  private final TemporalWindowAssigner<T, W, WS> assigner;
  private final Trigger<T, W> trigger;
  private final PaneUpdater<T, W, S> updater;
  private final PaneEvictor<T, W, S> evictor;
  private final PaneEvaluator<S, W, U> evaluator;

  private WS openWindows;

  private boolean initialized = false;

  //Window pane states for open windows.
  private WindowAccumulators<W, S> windowAccumulators;

  WindowAccumulators<W, S> getAccumulators() {
    return windowAccumulators;
  }

  void setInternalState(final boolean isInitialized, final WS windows, final WindowAccumulators<W, S> acc) {
    initialized = isInitialized;
    openWindows = windows;
    windowAccumulators = acc;
  }

  void setInternalState(final WS windows, final WindowAccumulators<W, S> acc) {
    setInternalState(true, windows, acc);
  }

  private Listener<W, U> listener;

  public DefaultPaneManager(final WindowAccumulators<W, S> accumulators,
                            final TemporalWindowAssigner<T, W, WS> assigner,
                            final Trigger<T, W> trigger,
                            final PaneUpdater<T, W, S> updater,
                            final PaneEvictor<T, W, S> evictor,
                            final PaneEvaluator<S, W, U> evaluator) {
    this.assigner = assigner;
    this.trigger = trigger;
    this.updater = updater;
    this.evictor = evictor;
    this.evaluator = evaluator;
    openWindows = assigner.stateInitializer().apply(accumulators.windows());
    windowAccumulators = accumulators;
    listener = null;
  }

  @Override
  public void setListener(final Listener<W, U> listener) {
    this.listener = listener;
  }

  /**
   * Used to present the current timestamp to the trigger.
   */
  private static final class TimeContext implements TimestampContext {

    /**
     * The current timestamp.
     */
    private final long current;

    /**
     * Contains the times of callbacks requested by the trigger.
     */
    private final TreeSet<Long> requested = new TreeSet<>();

    private TimeContext(final long current) {
      this.current = current;
    }


    @Override
    public long currentTimestamp() {
      return current;
    }

    public NavigableSet<Long> getRequests() {
      return requested;
    }

    @Override
    public void scheduleAt(final long ts) {
      if (ts > current) {
        requested.add(ts);
      }
    }
  }

  @Override
  public void update(final T data, final long timestamp, final PaneManager.TimeContext timeContext) {

    //If we have yet to initialize, call the restore handler for each window in the store.
    if (!initialized) {
      final TimeContext initContext = new TimeContext(timestamp);
      for (final W window : openWindows.openWindows()) {
        final Optional<S> windowState = windowAccumulators.getForWindow(window);
        if (windowState.isPresent()) {
          final S cleanedState = evictor.evict(windowState.get(), window, data, timestamp);
          final TriggerAction action = trigger.onRestore(window, initContext);
          handleAction(timeContext, initContext, window, cleanedState, action);
        }
      }
      initialized = true;
    }
    final TimeContext tContext = new TimeContext(timestamp);
    //Get the windows to which the value will contribute.
    final TemporalWindowAssigner.Assignment<W, WS> assignment = assigner.windowsFor(
            data, timestamp, openWindows);
    openWindows = assignment.updatedState();

    for (final W window : assignment.windows()) {
      //Either get the current pane state or create a new one.
      final S windowState = windowAccumulators.getForWindow(window)
          .orElseGet(() -> updater.createPane(window));

      //Add the contribution for the current value then evict expired data from the state.
      final S updatedState = updater.addContribution(windowState, window, data, timestamp);
      final S cleanedState = evictor.evict(updatedState, window, data, timestamp);

      windowAccumulators.updateWindow(window, cleanedState);

      //Determine what should happen with the window.

      final TriggerAction action = trigger.onNewValue(data, window, tContext);

      handleAction(timeContext, tContext, window, cleanedState, action);

    }
  }

  @Override
  public void close() {
    windowAccumulators.close();
  }

  private void handleAction(final PaneManager.TimeContext timeContext,
                            final TimeContext tContext,
                            final W window,
                            final S state, final TriggerAction action) {
    switch (action) {
      case TRIGGER:
        triggerWindow(window, state);
        addRequested(timeContext, window, tContext.getRequests());
        break;
      case TRIGGER_AND_PURGE:
        triggerWindow(window, state);
        purgeWindow(window);
        break;
      case PURGE:
        purgeWindow(window);
        break;
      default:
        addRequested(timeContext, window, tContext.getRequests());
    }
  }

  /**
   * Purging a window removes it from the state entirely.
   * @param window The window.
   */
  private void purgeWindow(final W window) {
    windowAccumulators.removeWindow(window);
    openWindows = openWindows.removeWindow(window);
  }

  /**
   * Adds requested callbacks for a window.
   * @param window The window.
   * @param requests The times of the requested callbacks.
   */
  private void addRequested(final PaneManager.TimeContext timeContext, final W window, final NavigableSet<Long> requests) {
    for (final Long t : requests) {
      timeContext.scheduleAt(t, (treq, tact) -> {
        final TimeContext tContext = new TimeContext(tact);

        //Execute the callback.
        final TriggerAction action = trigger.onTimer(window, tContext);
        switch (action) {
          case TRIGGER:
            windowAccumulators.getForWindow(window).ifPresent(s -> triggerWindow(window, s));
            addRequested(timeContext, window, tContext.getRequests());
            break;
          case TRIGGER_AND_PURGE:
            windowAccumulators.getForWindow(window).ifPresent(s -> triggerWindow(window, s));
            purgeWindow(window);
            break;
          case PURGE:
            purgeWindow(window);
            break;
          default:
            addRequested(timeContext, window, tContext.getRequests());
        }
      });
    }
  }

  /**
   * Evaluate the state of the pane of a window.
   * @param window The window.
   * @param state The state of the pane.
   */
  private void triggerWindow(final W window, final S state) {
    if (listener != null) {
      listener.accept(window, evaluator.evaluate(window, state));
    }
  }

}
