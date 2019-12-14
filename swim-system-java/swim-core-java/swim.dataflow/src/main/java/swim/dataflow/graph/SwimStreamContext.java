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

package swim.dataflow.graph;

import java.util.function.Supplier;
import java.util.function.ToLongFunction;
import swim.concurrent.Schedule;
import swim.dataflow.connector.Junction;
import swim.dataflow.connector.MapJunction;
import swim.dataflow.connector.MapReceptacle;
import swim.dataflow.connector.Receptacle;
import swim.dataflow.graph.persistence.PersistenceProvider;
import swim.structure.Form;

/**
 * Interface for contexts used to create flow graphs.
 */
public interface SwimStreamContext {

  /**
   * Create a stream from an external {@link Junction} (which could be a value lane or downlink).
   *
   * @param junction   The external junction.
   * @param form       The form of the type of the junction.
   * @param timestamps Assigns timestamps to the values.
   * @param <T>        The type of the values.
   * @return The stream based on the junction.
   */
  <T> SwimStream<T> fromJunction(Supplier<Junction<T>> junction, Form<T> form, ToLongFunction<T> timestamps);

  /**
   * Create a stream from an external junction (which could be a value lane or downlink).
   *
   * @param junction The external junction.
   * @param form     The form of the type of the junction.
   * @param <T>      The type of the values.
   * @return The stream based on the junction.
   */
  default <T> SwimStream<T> fromJunction(final Supplier<Junction<T>> junction, final Form<T> form) {
    return fromJunction(junction, form, null);
  }

  /**
   * Create a stream from an external inlet (which could be a value lane or downlink).
   *
   * @param outlet The external outlet.
   * @param form   The form of the type of the outlet.
   * @param <T>    The type of the values.
   * @return The stream based on the outlet.
   */
  default <T> SwimStream<T> fromJunction(final Junction<T> outlet, final Form<T> form) {
    return fromJunction(() -> outlet, form);
  }

  /**
   * Create a stream from an external junction (which could be a value lane or downlink).
   *
   * @param junction   The external junction.
   * @param form       The form of the type of the junction.
   * @param timestamps Assigns timestamps to the values.
   * @param <T>        The type of the values.
   * @return The stream based on the junction.
   */
  default <T> SwimStream<T> fromJunction(final Junction<T> junction,
                                         final Form<T> form,
                                         final ToLongFunction<T> timestamps) {
    return fromJunction(() -> junction, form, timestamps);
  }

  /**
   * Create a stream from an external map junction (which could be a map lane or downlink).
   *
   * @param junction   The external junction.
   * @param keyForm    The form of the type of the keys.
   * @param valueForm  The form of the type of the values.
   * @param timestamps Assigns timestamps to the values.
   * @param <K>        The type of the keys.
   * @param <V>        The type of the values.
   * @return The stream based on the junction.
   */
  <K, V> MapSwimStream<K, V> fromMapJunction(Supplier<MapJunction<K, V>> junction,
                                             Form<K> keyForm, Form<V> valueForm,
                                             ToLongFunction<V> timestamps);

  /**
   * Create a stream from an external map junction (which could be a map lane or downlink).
   *
   * @param junction  The external junction.
   * @param keyForm   The form of the type of the keys.
   * @param valueForm The form of the type of the values.
   * @param <K>       The type of the keys.
   * @param <V>       The type of the values.
   * @return The stream based on the junction.
   */
  default <K, V> MapSwimStream<K, V> fromMapJunction(final Supplier<MapJunction<K, V>> junction,
                                                     final Form<K> keyForm, final Form<V> valueForm) {
    return fromMapJunction(junction, keyForm, valueForm, null);
  }

  /**
   * Create a stream from an external map junction (which could be a map lane or downlink).
   *
   * @param junction  The external junction.
   * @param keyForm   The form of the type of the keys.
   * @param valueForm The form of the type of the values.
   * @param <K>       The type of the keys.
   * @param <V>       The type of the values.
   * @return The stream based on the junction.
   */
  default <K, V> MapSwimStream<K, V> fromMapJunction(final MapJunction<K, V> junction,
                                                     final Form<K> keyForm, final Form<V> valueForm) {
    return fromMapJunction(() -> junction, keyForm, valueForm);
  }

  /**
   * Create a stream from an external map junction (which could be a map lane or downlink).
   *
   * @param junction   The external junction.
   * @param keyForm    The form of the type of the keys.
   * @param valueForm  The form of the type of the values.
   * @param timestamps Assigns timestamps to the values.
   * @param <K>        The type of the keys.
   * @param <V>        The type of the values.
   * @return The stream based on the junction.
   */
  default <K, V> MapSwimStream<K, V> fromMapJunction(final MapJunction<K, V> junction,
                                                     final Form<K> keyForm, final Form<V> valueForm,
                                                     final ToLongFunction<V> timestamps) {
    return fromMapJunction(() -> junction, keyForm, valueForm, timestamps);
  }

  /**
   * Construct a flow graph based on all of the sinks connected by this context.
   *
   * @return Instantiation context for the flow graph.
   */
  InitContext constructGraph();

  /**
   * Context used to instantiate the flow graph.
   */
  interface InitContext {

    /**
     * @return The graph persistence provider.
     */
    PersistenceProvider getPersistenceProvider();

    /**
     * Instantiate a stream and provide the terminal junction.
     *
     * @param stream The stream.
     * @param <S>    The type of the stream.
     * @return The terminal junction.
     */
    <S> Junction<S> createFor(SwimStream<S> stream);

    /**
     * Instantiate a stream and provide the terminal junction.
     *
     * @param stream The stream.
     * @param <K>    The type of the keys.
     * @param <V>    The type of the values.
     * @return The terminal junction.
     */
    <K, V> MapJunction<K, V> createFor(MapSwimStream<K, V> stream);

    /**
     * Instantiate a sink.
     *
     * @param sink The sink.
     * @param <S>  The type accepted by the sink.
     * @return The inlet for the sink.
     */
    <S> Receptacle<S> createFrom(Sink<S> sink);

    /**
     * Instantiate a map sink.
     *
     * @param sink The sink.
     * @param <K>  The type of the keys accepted by the sink.
     * @param <V>  The type of the values accepted by the sink.
     * @return The inlet for the sink.
     */
    <K, V> MapReceptacle<K, V> createFromMap(MapSink<K, V> sink);

    /**
     * Get a junction that already exists in the context for a stream.
     *
     * @param stream The stream.
     * @param <S>    The type of the stream values.
     * @return The junction.
     */
    <S> Junction<S> getExisting(SwimStream<S> stream);

    /**
     * Inject a junction into the context for a stream.
     *
     * @param stream   The stream.
     * @param junction The junction.
     * @param <S>      The type of the stream values.
     */
    <S> void inject(SwimStream<S> stream, Junction<S> junction);

    /**
     * Get a junction that already exists in the context for a stream.
     *
     * @param stream The stream.
     * @param <K>    The type of the keys.
     * @param <V>    The type of the values.
     * @return The junction.
     */
    <K, V> MapJunction<K, V> getExistingMap(MapSwimStream<K, V> stream);

    /**
     * Inject a junction into the context for a stream.
     *
     * @param stream   The stream.
     * @param junction The junction.
     * @param <K>      The type of the keys.
     * @param <V>      The type of the values.
     */
    <K, V> void inject(MapSwimStream<K, V> stream, MapJunction<K, V> junction);

    /**
     * Get a receptacle that already exists in the context for a sink.
     *
     * @param sink The stream.
     * @param <S>  The type of the stream values.
     * @return The receptacle.
     */
    <S> Receptacle<S> getExisting(Sink<S> sink);

    /**
     * Inject a receptacle into the context for a sink.
     *
     * @param sink       The sink.
     * @param receptacle The receptacle.
     * @param <S>        The type of the stream values.
     */
    <S> void inject(Sink<S> sink, Receptacle<S> receptacle);

    /**
     * Get a receptacle that already exists in the context for a sink.
     *
     * @param sink The sink.
     * @param <K>  The type of the keys accepted by the sink.
     * @param <V>  The type of the values accepted by the sink.
     * @return The receptacle.
     */
    <K, V> MapReceptacle<K, V> getExistingMap(MapSink<K, V> sink);

    /**
     * Inject a receptacle into the context for a sink.
     *
     * @param sink       The sink.
     * @param receptacle The receptacle.
     * @param <K>        The type of the keys accepted by the sink.
     * @param <V>        The type of the values accepted by the sink.
     */
    <K, V> void injectMap(MapSink<K, V> sink, MapReceptacle<K, V> receptacle);

    /**
     * @return Schedule for events.
     */
    Schedule getSchedule();

  }

}
