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

import java.util.Map;
import java.util.function.Supplier;
import java.util.function.ToLongFunction;
import swim.api.declarative.AgentPersistence;
import swim.api.downlink.EventDownlink;
import swim.api.downlink.MapDownlink;
import swim.api.downlink.ValueDownlink;
import swim.api.lane.JoinMapLane;
import swim.api.lane.JoinValueLane;
import swim.api.lane.MapLane;
import swim.api.lane.ValueLane;
import swim.api.warp.function.OnEvent;
import swim.dataflow.Graphs;
import swim.observable.function.DidRemoveKey;
import swim.observable.function.DidSet;
import swim.observable.function.DidUpdateKey;
import swim.streaming.Junction;
import swim.streaming.MapJunction;
import swim.streaming.MapReceptacle;
import swim.streaming.MapSink;
import swim.streaming.MapSwimStream;
import swim.streaming.MapView;
import swim.streaming.Sink;
import swim.streaming.SwimStream;
import swim.streaming.SwimStreamContext;
import swim.streamlet.AbstractJunction;
import swim.streamlet.AbstractMapJunction;
import swim.structure.Form;
import swim.util.Deferred;

/**
 * Extension to {@link AbstractAgent} that provides a declarative method for describing the relationship
 * between lanes in the agent.
 */
public abstract class DataflowAgent extends AbstractAgent {

  public DataflowAgent(final AgentContext context) {
    super(context);
  }

  public DataflowAgent() {
    super();
  }

  /**
   * Create a {@link Sink} that will write to a {@link ValueLane}.
   *
   * @param lane The target lane.
   * @param <T>  The type of the lane.
   * @return The sink.
   */
  public static <T> Sink<T> sink(final ValueLane<T> lane) {
    return context -> val -> lane.set(val.get());
  }

  /**
   * Create a {@link MapSink} that will write to a {@link MapLane}.
   *
   * @param lane The target lane.
   * @param <K>  The type of the keys.
   * @param <V>  The type of the values.
   * @return The sink.
   */
  public static <K, V> MapSink<K, V> sink(final MapLane<K, V> lane) {
    return context -> new MapReceptacle<K, V>() {
      @Override
      public void notifyChange(final K key, final Deferred<V> value, final Deferred<MapView<K, V>> map) {
        lane.put(key, value.get());
      }

      @Override
      public void notifyRemoval(final K key, final Deferred<MapView<K, V>> map) {
        lane.remove(key);
      }
    };
  }

  @Override
  public final void didStart() {
    willInitializeGraph();
    final SwimStreamContext graphContext = Graphs.createContext(schedule(), new AgentPersistence(agentContext()));
    final BuilderContextImpl builderCon = new BuilderContextImpl(graphContext);
    onInitializeGraph(builderCon);
    final SwimStreamContext.InitContext initCon = graphContext.constructGraph();
    didInitializeGraph(initCon);
  }

  /**
   * Called before the flow graphs are instantiated.
   */
  public void willInitializeGraph() {

  }

  /**
   * Specify the flow graphs to create between lanes.
   *
   * @param context Context for tracking the flow graphs that have been created.
   */
  public abstract void onInitializeGraph(StreamBuilderContext context);

  /**
   * Called after the flow graphs are instantiated.
   *
   * @param initContext Context containing the created flow graphs.
   */
  public void didInitializeGraph(final SwimStreamContext.InitContext initContext) {

  }

  public interface StreamBuilderContext {

    /**
     * Create a stream from a value lane.
     *
     * @param lane       The lane.
     * @param form       The form of the type.
     * @param timestamps Assigns timestamps to the values.
     * @param <T>        The type of the values.
     * @return The stream based on the lane.
     */
    <T> SwimStream<T> fromValueLane(Supplier<ValueLane<T>> lane,
                                    Form<T> form,
                                    ToLongFunction<T> timestamps);

    /**
     * Create a stream from an external inlet (which could be a value lane or downlink).
     *
     * @param lane       The external lane.
     * @param timestamps Assigns timestamps to the values.
     * @param <T>        The type of the values.
     * @return The stream based on the lane.
     */
    default <T> SwimStream<T> fromValueLane(final ValueLane<T> lane,
                                            final ToLongFunction<T> timestamps) {
      return fromValueLane(() -> lane, lane.valueForm(), timestamps);
    }

    /**
     * Create a stream from a value lane.
     *
     * @param lane The lane.
     * @param form The form of the type.
     * @param <T>  The type of the values.
     * @return The stream based on the lane.
     */
    default <T> SwimStream<T> fromValueLane(final Supplier<ValueLane<T>> lane, final Form<T> form) {
      return fromValueLane(lane, form, null);
    }

    /**
     * Create a stream from a value lane.
     *
     * @param lane The lane.
     * @param <T>  The type of the values.
     * @return The stream based on the outlet.
     */
    default <T> SwimStream<T> fromValueLane(final ValueLane<T> lane) {
      return fromValueLane(() -> lane, lane.valueForm(), null);
    }

    /**
     * Create a stream from an value downlink.
     *
     * @param downlink   The downlink.
     * @param form       The form of the type.
     * @param timestamps Assigns timestamps to the values.
     * @param <T>        The type of the values.
     * @return The stream based on the downlink.
     */
    <T> SwimStream<T> fromValueDownlink(Supplier<ValueDownlink<T>> downlink,
                                        Form<T> form,
                                        ToLongFunction<T> timestamps);

    /**
     * Create a stream from a value downlink.
     *
     * @param downlink   The downlink.
     * @param form       The form of the type.
     * @param timestamps Assigns timestamps to the values.
     * @param <T>        The type of the values.
     * @return The stream based on the downlink.
     */
    default <T> SwimStream<T> fromValueDownlink(final ValueDownlink<T> downlink,
                                                final Form<T> form,
                                                final ToLongFunction<T> timestamps) {
      return fromValueDownlink(() -> downlink, downlink.valueForm(), timestamps);
    }

    /**
     * Create a stream from a value downlink.
     *
     * @param downlink The value downlink.
     * @param form     The form of the type.
     * @param <T>      The type of the values.
     * @return The stream based on the downlink.
     */
    default <T> SwimStream<T> fromValueDownlink(final Supplier<ValueDownlink<T>> downlink, final Form<T> form) {
      return fromValueDownlink(downlink, form, null);
    }

    /**
     * Create a stream from a value downlink.
     *
     * @param downlink The downlink.
     * @param <T>      The type of the values.
     * @return The stream based on the downlink.
     */
    default <T> SwimStream<T> fromValueDownlink(final ValueDownlink<T> downlink) {
      return fromValueDownlink(() -> downlink, downlink.valueForm(), null);
    }

    /**
     * Create a stream from an event downlink.
     *
     * @param downlink   The downlink.
     * @param form       The form of the type.
     * @param timestamps Assigns timestamps to the values.
     * @param <T>        The type of the values.
     * @return The stream based on the downlink.
     */
    <T> SwimStream<T> fromEventDownlink(Supplier<EventDownlink<T>> downlink,
                                        Form<T> form,
                                        ToLongFunction<T> timestamps);

    /**
     * Create a stream from an event downlink.
     *
     * @param downlink   The downlink.
     * @param form       The form of the type.
     * @param timestamps Assigns timestamps to the values.
     * @param <T>        The type of the values.
     * @return The stream based on the downlink.
     */
    default <T> SwimStream<T> fromValueDownlink(final EventDownlink<T> downlink,
                                                final Form<T> form,
                                                final ToLongFunction<T> timestamps) {
      return fromEventDownlink(() -> downlink, downlink.valueForm(), timestamps);
    }

    /**
     * Create a stream from an event downlink.
     *
     * @param downlink The event downlink.
     * @param form     The form of the type.
     * @param <T>      The type of the values.
     * @return The stream based on the downlink.
     */
    default <T> SwimStream<T> fromEventDownlink(final Supplier<EventDownlink<T>> downlink, final Form<T> form) {
      return fromEventDownlink(downlink, form, null);
    }

    /**
     * Create a stream from a value downlink.
     *
     * @param downlink The downlink.
     * @param <T>      The type of the values.
     * @return The stream based on the downlink.
     */
    default <T> SwimStream<T> fromEventDownlink(final EventDownlink<T> downlink) {
      return fromEventDownlink(() -> downlink, downlink.valueForm(), null);
    }
    /**
     * Create a stream from a map lane.
     *
     * @param lane       The lane.
     * @param keyForm    The form of the keys.
     * @param valueForm  The form of the values.
     * @param timestamps Assigns timestamps to the values.
     * @param <K>        The type of the keys.
     * @param <V>        The type of the values.
     * @return The stream based on the lane.
     */
    <K, V> MapSwimStream<K, V> fromMapLane(Supplier<MapLane<K, V>> lane,
                                           Form<K> keyForm, Form<V> valueForm,
                                           ToLongFunction<V> timestamps);

    /**
     * Create a stream from a map lane.
     *
     * @param lane       The lane.
     * @param timestamps Assigns timestamps to the values.
     * @param <K>        The type of the keys.
     * @param <V>        The type of the values.
     * @return The stream based on the lane.
     */
    default <K, V> MapSwimStream<K, V> fromMapLane(final MapLane<K, V> lane,
                                                   final ToLongFunction<V> timestamps) {
      return fromMapLane(() -> lane, lane.keyForm(), lane.valueForm(), timestamps);
    }

    /**
     * Create a stream from a map lane.
     *
     * @param lane      The lane.
     * @param keyForm   The form of the keys.
     * @param valueForm The form of the values.
     * @param <K>       The type of the keys.
     * @param <V>       The type of the values.
     * @return The stream based on the lane.
     */
    default <K, V> MapSwimStream<K, V> fromMapLane(final Supplier<MapLane<K, V>> lane,
                                                   final Form<K> keyForm, final Form<V> valueForm) {
      return fromMapLane(lane, keyForm, valueForm, null);
    }

    /**
     * Create a stream from an map lane.
     *
     * @param lane The lane.
     * @param <K>  The type of the keys.
     * @param <V>  The type of the values.
     * @return The stream based on the lane.
     */
    default <K, V> MapSwimStream<K, V> fromMapLane(final MapLane<K, V> lane,
                                                   final Form<K> keyForm, final Form<V> valueForm) {
      return fromMapLane(() -> lane, lane.keyForm(), lane.valueForm(), null);
    }

    /**
     * Create a stream from a map downlink.
     *
     * @param downlink   The downlink.
     * @param keyForm    The form of the keys.
     * @param valueForm  The form of the values.
     * @param timestamps Assigns timestamps to the values.
     * @param <K>        The type of the keys.
     * @param <V>        The type of the values.
     * @return The stream based on the downlink.
     */
    <K, V> MapSwimStream<K, V> fromMapDownlink(Supplier<MapDownlink<K, V>> downlink,
                                               Form<K> keyForm, Form<V> valueForm,
                                               ToLongFunction<V> timestamps);

    /**
     * Create a stream from a map downlink.
     *
     * @param downlink   The downlink.
     * @param timestamps Assigns timestamps to the values.
     * @param <K>        The type of the keys.
     * @param <V>        The type of the values.
     * @return The stream based on the downlink.
     */
    default <K, V> MapSwimStream<K, V> fromMapDownlink(final MapDownlink<K, V> downlink,
                                                       final ToLongFunction<V> timestamps) {
      return fromMapDownlink(() -> downlink, downlink.keyForm(), downlink.valueForm(), timestamps);
    }

    /**
     * Create a stream from a map downlink.
     *
     * @param downlink  The downlink.
     * @param keyForm   The form of the keys.
     * @param valueForm The form of the values.
     * @param <K>       The type of the keys.
     * @param <V>       The type of the values.
     * @return The stream based on the downlink.
     */
    default <K, V> MapSwimStream<K, V> fromMapDownlink(final Supplier<MapDownlink<K, V>> downlink,
                                                       final Form<K> keyForm, final Form<V> valueForm) {
      return fromMapDownlink(downlink, keyForm, valueForm, null);
    }

    /**
     * Create a stream from an map downlink.
     *
     * @param downlink The downlink.
     * @param <K>      The type of the keys.
     * @param <V>      The type of the values.
     * @return The stream based on the downlink.
     */
    default <K, V> MapSwimStream<K, V> fromMapDownlink(final MapDownlink<K, V> downlink,
                                                       final Form<K> keyForm, final Form<V> valueForm) {
      return fromMapDownlink(() -> downlink, downlink.keyForm(), downlink.valueForm(), null);
    }

    /**
     * Create a stream from a join value lane.
     *
     * @param lane       The lane.
     * @param keyForm    The form of the keys.
     * @param valueForm  The form of the values.
     * @param timestamps Assigns timestamps to the values.
     * @param <K>        The type of the keys.
     * @param <V>        The type of the values.
     * @return The stream based on the lane.
     */
    <K, V> MapSwimStream<K, V> fromJoinValueLane(Supplier<JoinValueLane<K, V>> lane,
                                                 Form<K> keyForm, Form<V> valueForm,
                                                 ToLongFunction<V> timestamps);

    /**
     * Create a stream from a join value lane.
     *
     * @param lane       The lane.
     * @param timestamps Assigns timestamps to the values.
     * @param <K>        The type of the keys.
     * @param <V>        The type of the values.
     * @return The stream based on the lane.
     */
    default <K, V> MapSwimStream<K, V> fromJoinValueLane(final JoinValueLane<K, V> lane,
                                                         final ToLongFunction<V> timestamps) {
      return fromJoinValueLane(() -> lane, lane.keyForm(), lane.valueForm(), timestamps);
    }

    /**
     * Create a stream from a join value lane.
     *
     * @param lane      The lane.
     * @param keyForm   The form of the keys.
     * @param valueForm The form of the values.
     * @param <K>       The type of the keys.
     * @param <V>       The type of the values.
     * @return The stream based on the lane.
     */
    default <K, V> MapSwimStream<K, V> fromJoinValueLane(final Supplier<JoinValueLane<K, V>> lane,
                                                         final Form<K> keyForm, final Form<V> valueForm) {
      return fromJoinValueLane(lane, keyForm, valueForm, null);
    }

    /**
     * Create a stream from a join value lane.
     *
     * @param lane The lane.
     * @param <K>  The type of the keys.
     * @param <V>  The type of the values.
     * @return The stream based on the lane.
     */
    default <K, V> MapSwimStream<K, V> fromJoinValueLane(final JoinValueLane<K, V> lane,
                                                         final Form<K> keyForm, final Form<V> valueForm) {
      return fromJoinValueLane(() -> lane, lane.keyForm(), lane.valueForm(), null);
    }

    /**
     * Create a stream from a join map lane.
     *
     * @param lane       The lane.
     * @param keyForm    The form of the keys.
     * @param valueForm  The form of the values.
     * @param timestamps Assigns timestamps to the values.
     * @param <K>        The type of the keys.
     * @param <V>        The type of the values.
     * @return The stream based on the lane.
     */
    <K, V> MapSwimStream<K, V> fromJoinMapLane(Supplier<JoinMapLane<?, K, V>> lane,
                                               Form<K> keyForm, Form<V> valueForm,
                                               ToLongFunction<V> timestamps);

    /**
     * Create a stream from a join map lane.
     *
     * @param lane       The lane.
     * @param timestamps Assigns timestamps to the values.
     * @param <K>        The type of the keys.
     * @param <V>        The type of the values.
     * @return The stream based on the lane.
     */
    default <K, V> MapSwimStream<K, V> fromJoinMapLane(final JoinMapLane<?, K, V> lane,
                                                       final ToLongFunction<V> timestamps) {
      return fromJoinMapLane(() -> lane, lane.keyForm(), lane.valueForm(), timestamps);
    }

    /**
     * Create a stream from a join map lane.
     *
     * @param lane      The lane.
     * @param keyForm   The form of the keys.
     * @param valueForm The form of the values.
     * @param <K>       The type of the keys.
     * @param <V>       The type of the values.
     * @return The stream based on the lane.
     */
    default <K, V> MapSwimStream<K, V> fromJoinMapLane(final Supplier<JoinMapLane<?, K, V>> lane,
                                                       final Form<K> keyForm, final Form<V> valueForm) {
      return fromJoinMapLane(lane, keyForm, valueForm, null);
    }

    /**
     * Create a stream from an join map lane.
     *
     * @param lane The lane.
     * @param <K>  The type of the keys.
     * @param <V>  The type of the values.
     * @return The stream based on the lane.
     */
    default <K, V> MapSwimStream<K, V> fromJoinMapLane(final JoinMapLane<?, K, V> lane,
                                                       final Form<K> keyForm, final Form<V> valueForm) {
      return fromJoinMapLane(() -> lane, lane.keyForm(), lane.valueForm(), null);
    }


  }

  private static final class EventJunction<T> extends AbstractJunction<T> implements OnEvent<T> {

    @Override
    public void onEvent(final T value) {
      emit(Deferred.value(value));
    }
  }

  private static final class ValueLaneOrDlJunction<T> extends AbstractJunction<T> implements DidSet<T> {

    @Override
    public void didSet(final T newValue, final T oldValue) {
      emit(Deferred.value(newValue));
    }
  }


  private static final class MapLaneOrDlJunction<K, V> extends AbstractMapJunction<K, V> implements DidUpdateKey<K, V>, DidRemoveKey<K, V> {

    private final Map<K, V> view;

    private MapLaneOrDlJunction(final Map<K, V> view) {
      this.view = view;
    }

    @Override
    public void didRemove(final K key, final V oldValue) {
      emitRemoval(key, MapView.wrap(view));
    }

    @Override
    public void didUpdate(final K key, final V newValue, final V oldValue) {
      emit(key, Deferred.value(newValue), Deferred.value(MapView.wrap(view)));
    }
  }

  private static final class BuilderContextImpl implements StreamBuilderContext {

    private final SwimStreamContext context;

    private BuilderContextImpl(final SwimStreamContext context) {
      this.context = context;
    }

    @Override
    public <T> SwimStream<T> fromValueLane(final Supplier<ValueLane<T>> lane,
                                           final Form<T> form,
                                           final ToLongFunction<T> timestamps) {
      final Supplier<Junction<T>> fac = () -> {
        final ValueLane<T> laneRef = lane.get();
        final ValueLaneOrDlJunction<T> junction = new ValueLaneOrDlJunction<>();
        laneRef.observe(junction);
        return junction;
      };
      return context.fromJunction(fac, form, timestamps);
    }

    @Override
    public <T> SwimStream<T> fromValueDownlink(final Supplier<ValueDownlink<T>> downlink,
                                               final Form<T> form,
                                               final ToLongFunction<T> timestamps) {
      final Supplier<Junction<T>> fac = () -> {
        final ValueDownlink<T> dl = downlink.get();
        final ValueLaneOrDlJunction<T> junction = new ValueLaneOrDlJunction<>();
        dl.observe(junction);
        return junction;
      };
      return context.fromJunction(fac, form, timestamps);
    }

    @Override
    public <T> SwimStream<T> fromEventDownlink(final Supplier<EventDownlink<T>> downlink,
                                               final Form<T> form,
                                               final ToLongFunction<T> timestamps) {
      final Supplier<Junction<T>> fac = () -> {
        final EventDownlink<T> dl = downlink.get();
        final EventJunction<T> junction = new EventJunction<>();
        dl.observe(junction);
        return junction;
      };
      return context.fromJunction(fac, form, timestamps);
    }


    @Override
    public <K, V> MapSwimStream<K, V> fromMapLane(final Supplier<MapLane<K, V>> lane,
                                                  final Form<K> keyForm,
                                                  final Form<V> valueForm,
                                                  final ToLongFunction<V> timestamps) {

      final Supplier<MapJunction<K, V>> fac = () -> {
        final MapLane<K, V> laneRef = lane.get();
        final MapLaneOrDlJunction<K, V> junction = new MapLaneOrDlJunction<>(laneRef);
        laneRef.observe(junction);
        return junction;
      };
      return context.fromMapJunction(fac, keyForm, valueForm, timestamps);
    }

    @Override
    public <K, V> MapSwimStream<K, V> fromMapDownlink(final Supplier<MapDownlink<K, V>> downlink,
                                                      final Form<K> keyForm,
                                                      final Form<V> valueForm,
                                                      final ToLongFunction<V> timestamps) {
      final Supplier<MapJunction<K, V>> fac = () -> {
        final MapDownlink<K, V> dl = downlink.get();
        final MapLaneOrDlJunction<K, V> junction = new MapLaneOrDlJunction<>(dl);
        dl.observe(junction);
        return junction;
      };
      return context.fromMapJunction(fac, keyForm, valueForm, timestamps);
    }

    @Override
    public <K, V> MapSwimStream<K, V> fromJoinValueLane(final Supplier<JoinValueLane<K, V>> lane,
                                                        final Form<K> keyForm,
                                                        final Form<V> valueForm,
                                                        final ToLongFunction<V> timestamps) {
      final Supplier<MapJunction<K, V>> fac = () -> {
        final JoinValueLane<K, V> laneRef = lane.get();
        final MapLaneOrDlJunction<K, V> junction = new MapLaneOrDlJunction<>(laneRef);
        laneRef.observe(junction);
        return junction;
      };
      return context.fromMapJunction(fac, keyForm, valueForm, timestamps);
    }

    @Override
    public <K, V> MapSwimStream<K, V> fromJoinMapLane(final Supplier<JoinMapLane<?, K, V>> lane,
                                                      final Form<K> keyForm,
                                                      final Form<V> valueForm,
                                                      final ToLongFunction<V> timestamps) {
      final Supplier<MapJunction<K, V>> fac = () -> {
        final JoinMapLane<?, K, V> laneRef = lane.get();
        final MapLaneOrDlJunction<K, V> junction = new MapLaneOrDlJunction<>(laneRef);
        laneRef.observe(junction);
        return junction;
      };
      return context.fromMapJunction(fac, keyForm, valueForm, timestamps);
    }
  }
}
