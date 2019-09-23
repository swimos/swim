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

import swim.dataflow.connector.MapJunction;
import swim.dataflow.connector.MapReceptacle;
import swim.dataflow.graph.MapSink;
import swim.dataflow.graph.MapSwimStream;
import swim.dataflow.graph.SwimStreamContext;

/**
 * A binding from a map stream to a sink.
 *
 * @param <K> The type of the keys of the stream.
 * @param <V> The type of the values of the stream.
 */
class MapSinkBinding<K, V> implements InternalSinkHandle<K, V> {

  private final MapSwimStream<K, V> stream;
  private final MapSink<K, V> sink;

  /**
   * @param in  The stream to be bound.
   * @param out The target sink.
   */
  MapSinkBinding(final MapSwimStream<K, V> in, final MapSink<K, V> out) {
    stream = in;
    sink = out;
  }

  @Override
  public void bindConnector(final SwimStreamContext.InitContext context) {
    final MapJunction<K, V> source = context.createFor(stream);
    final MapReceptacle<K, V> receptacle = context.createFromMap(sink);
    source.subscribe(receptacle);
  }
}
