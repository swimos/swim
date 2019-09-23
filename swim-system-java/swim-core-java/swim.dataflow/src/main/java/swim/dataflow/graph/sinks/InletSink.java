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

package swim.dataflow.graph.sinks;

import java.util.function.Supplier;
import swim.dataflow.connector.Deferred;
import swim.dataflow.connector.Receptacle;
import swim.dataflow.graph.Sink;
import swim.dataflow.graph.SwimStreamContext;
import swim.streamlet.AbstractOutlet;
import swim.streamlet.Inlet;

/**
 * Sink based on an external inlet.
 *
 * @param <T> The type of the inlet.
 */
public class InletSink<T> implements Sink<T> {

  private final Supplier<Inlet<T>> inlet;

  public InletSink(final Supplier<Inlet<T>> inletSupp) {
    inlet = inletSupp;
  }

  public InletSink(final Inlet<T> in) {
    this(() -> in);
  }

  @Override
  public Receptacle<T> instantiate(final SwimStreamContext.InitContext context) {
    final Inlet<T> target = inlet.get();
    final BridgeOutlet<T> bridge = new BridgeOutlet<>();
    target.bindInput(bridge);
    return bridge.getReceptacle();
  }

}

final class BridgeOutlet<T> extends AbstractOutlet<T> {

  private Deferred<T> current;

  private final Receptacle<T> receptacle = new Receptacle<T>() {
    @Override
    public void notifyChange(final Deferred<T> value) {
      current = value;
      invalidateInput();
      System.out.println(String.format("Output produced: %s", current.get()));
      reconcileInput(1);
    }
  };

  Receptacle<T> getReceptacle() {
    return receptacle;
  }

  @Override
  public T get() {
    if (current != null) {
      return current.get();
    } else {
      return null;
    }
  }
}
