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

package swim.dataflow.graph.impl;

import java.util.IdentityHashMap;
import java.util.function.Supplier;
import java.util.function.ToLongFunction;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieSet;
import swim.concurrent.Schedule;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.MapSink;
import swim.dataflow.graph.MapSwimStream;
import swim.dataflow.graph.Sink;
import swim.dataflow.graph.SinkHandle;
import swim.dataflow.graph.SwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.streamlet.Junction;
import swim.streamlet.MapJunction;
import swim.streamlet.MapReceptacle;
import swim.streamlet.Receptacle;
import swim.streamlet.persistence.PersistenceProvider;
import swim.structure.Form;
import swim.util.Require;
import swim.util.Unit;

/**
 * Standard implementation of {@link SwimStreamContext}.
 */
class ContextImpl implements SwimStreamContext, BindingContext {

  private final Schedule schedule;

  /**
   * Collects all sinks that have been attached to the graph. These terminal nodes are used to instantiate
   * the graph from sink to source.
   */
  private FingerTrieSeq<InternalSinkHandle<?, ?>> sinkHandles = FingerTrieSeq.empty();

  private final PersistenceProvider persistence;

  ContextImpl(final Schedule schedule, final PersistenceProvider persistence) {
    this.schedule = schedule;
    this.persistence = persistence;
  }

  /**
   * Add a new sink handle.
   *
   * @param handle The handle.
   */
  void addSinkHandle(final InternalSinkHandle<?, ?> handle) {
    sinkHandles = sinkHandles.appended(handle);
  }

  @Override
  public <T> SwimStream<T> fromJunction(final Supplier<Junction<T>> junction,
                                        final Form<T> form,
                                        final ToLongFunction<T> timestamps) {
    return new ExternalOutletStream<>(form, this, junction, timestamps);
  }

  @Override
  public <K, V> MapSwimStream<K, V> fromMapJunction(final Supplier<MapJunction<K, V>> junction,
                                                    final Form<K> keyForm,
                                                    final Form<V> valueForm,
                                                    final ToLongFunction<V> timestamps) {
    return new ExternalMapOutletStream<>(keyForm, valueForm, this, junction);
  }

  @Override
  public InitContext constructGraph() {
    final FingerTrieSeq<InternalSinkHandle<?, ?>> handles = sinkHandles;
    final InitContextImpl initContext = new InitContextImpl(schedule, persistence);
    for (final InternalSinkHandle<?, ?> handle : handles) {
      handle.bindConnector(initContext);
    }
    return initContext;
  }

  @Override
  public <T> SinkHandle<Unit, T> bindSink(final SwimStream<T> in, final Sink<T> sink) {
    final SinkBinding<T> binding = new SinkBinding<>(in, sink);
    addSinkHandle(binding);
    return binding;
  }

  @Override
  public <K, V> SinkHandle<K, V> bindSink(final MapSwimStream<K, V> in, final MapSink<K, V> sink) {
    final MapSinkBinding<K, V> binding = new MapSinkBinding<>(in, sink);
    addSinkHandle(binding);
    return binding;
  }

  private int count = 0;

  private HashTrieSet<String> names = HashTrieSet.empty();

  @Override
  public final String createId() {
    String id;
    do {
      id = String.format("StreamElement%d", count);
      ++count;
    } while (names.contains(id));
    names = names.added(id);
    return id;
  }

  @Override
  public void claimId(final String id) {
    Require.that(id != null, "Stream element IDs must not be null.");
    Require.that(!names.contains(id), String.format("Duplicate stream element ID: %s", id));
    names = names.added(id);
  }

  /**
   * Standard implementation of {@link SwimStreamContext.InitContext}.
   */
  static final class InitContextImpl implements SwimStreamContext.InitContext {

    private final Schedule schedule;
    private final PersistenceProvider persistence;
    //These are to ensure that any given node of the graph is only instantiated once regardless of how
    //many times it is referred to.

    private final IdentityHashMap<Sink<?>, Receptacle<?>> receptacles = new IdentityHashMap<>();
    private final IdentityHashMap<MapSink<?, ?>, MapReceptacle<?, ?>> mapReceptacles =
        new IdentityHashMap<>();

    private final IdentityHashMap<SwimStream<?>, Junction<?>> junctions = new IdentityHashMap<>();
    private final IdentityHashMap<MapSwimStream<?, ?>, MapJunction<?, ?>> mapJunctions =
        new IdentityHashMap<>();

    InitContextImpl(final Schedule schedule, final PersistenceProvider persistence) {
      this.schedule = schedule;
      this.persistence = persistence;
    }

    @Override
    public PersistenceProvider getPersistenceProvider() {
      return persistence;
    }

    @Override
    @SuppressWarnings("unchecked")
    public <S> Junction<S> createFor(final SwimStream<S> stream) {
      if (junctions.containsKey(stream)) {
        return (Junction<S>) junctions.get(stream);
      } else {
        final Junction<S> out = stream.instantiate(this);
        junctions.put(stream, out);
        return out;
      }
    }

    @Override
    @SuppressWarnings("unchecked")
    public <K, V> MapJunction<K, V> createFor(final MapSwimStream<K, V> stream) {
      if (mapJunctions.containsKey(stream)) {
        return (MapJunction<K, V>) mapJunctions.get(stream);
      } else {
        final MapJunction<K, V> out = stream.instantiate(this);
        mapJunctions.put(stream, out);
        return out;
      }
    }

    @Override
    @SuppressWarnings("unchecked")
    public <S> Receptacle<S> createFrom(final Sink<S> sink) {
      if (receptacles.containsKey(sink)) {
        return (Receptacle<S>) receptacles.get(sink);
      } else {
        final Receptacle<S> in = sink.instantiate(this);
        receptacles.put(sink, in);
        return in;
      }
    }

    @Override
    @SuppressWarnings("unchecked")
    public <K, V> MapReceptacle<K, V> createFromMap(final MapSink<K, V> sink) {
      if (mapReceptacles.containsKey(sink)) {
        return (MapReceptacle<K, V>) mapReceptacles.get(sink);
      } else {
        final MapReceptacle<K, V> in = sink.instantiateReceptacle(this);
        mapReceptacles.put(sink, in);
        return in;
      }
    }

    @Override
    @SuppressWarnings("unchecked")
    public <S> Junction<S> getExisting(final SwimStream<S> stream) {
      return (Junction<S>) junctions.get(stream);
    }

    @Override
    public <S> void inject(final SwimStream<S> stream, final Junction<S> junction) {
      if (!junctions.containsKey(stream)) {
        junctions.put(stream, junction);
      } else {
        throw new IllegalArgumentException("Duplicate registration for stream.");
      }
    }

    @Override
    @SuppressWarnings("unchecked")
    public <K, V> MapJunction<K, V> getExistingMap(final MapSwimStream<K, V> stream) {
      return (MapJunction<K, V>) mapJunctions.get(stream);
    }

    @Override
    public <K, V> void inject(final MapSwimStream<K, V> stream, final MapJunction<K, V> junction) {
      if (!mapJunctions.containsKey(stream)) {
        mapJunctions.put(stream, junction);
      } else {
        throw new IllegalArgumentException("Duplicate registration for map stream.");
      }
    }

    @Override
    @SuppressWarnings("unchecked")
    public <S> Receptacle<S> getExisting(final Sink<S> sink) {
      return (Receptacle<S>) receptacles.get(sink);
    }

    @Override
    public <S> void inject(final Sink<S> sink, final Receptacle<S> receptacle) {
      receptacles.put(sink, receptacle);
    }

    @Override
    @SuppressWarnings("unchecked")
    public <K, V> MapReceptacle<K, V> getExistingMap(final MapSink<K, V> sink) {
      return (MapReceptacle<K, V>) mapReceptacles.get(sink);
    }

    @Override
    public <K, V> void injectMap(final MapSink<K, V> sink, final MapReceptacle<K, V> receptacle) {
      mapReceptacles.put(sink, receptacle);
    }


    @Override
    public Schedule getSchedule() {
      return schedule;
    }

  }
}
