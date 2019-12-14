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

import swim.dataflow.connector.Junction;
import swim.dataflow.connector.Receptacle;
import swim.dataflow.graph.Sink;
import swim.dataflow.graph.SwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.dataflow.graph.Unit;

/**
 * Binding of a stream to a sink.
 *
 * @param <T> The type of the data.
 */
class SinkBinding<T> implements InternalSinkHandle<Unit, T> {

  private final SwimStream<T> stream;
  private final Sink<T> sink;

  /**
   * @param in  The stream to bind to the sink.
   * @param out The target sink.
   */
  SinkBinding(final SwimStream<T> in, final Sink<T> out) {
    stream = in;
    sink = out;
  }

  @Override
  public void bindConnector(final SwimStreamContext.InitContext context) {
    final Junction<T> source = context.createFor(stream);
    final Receptacle<T> receptacle = context.createFrom(sink);
    source.subscribe(receptacle);
  }
}
