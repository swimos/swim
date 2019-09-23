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

import org.testng.Assert;
import org.testng.annotations.Test;
import swim.dataflow.connector.AbstractJunction;
import swim.dataflow.connector.ConnectorTestUtil;
import swim.dataflow.connector.Deferred;
import swim.dataflow.connector.Receptacle;
import swim.dataflow.graph.Sink;
import swim.dataflow.graph.SwimStreamContext;
import swim.dataflow.graph.persistence.TrivialPersistenceProvider;
import swim.structure.Form;

public class GraphConstructionSpec {

  private static final class TestInput<T> extends AbstractJunction<T> {

    void push(final T val) {
      emit(Deferred.value(val));
    }

  }

  private static final class TestSink<T> implements Sink<T> {

    private T value = null;

    public T getValue() {
      return value;
    }

    @Override
    public Receptacle<T> instantiate(final SwimStreamContext.InitContext context) {
      return val -> value = val.get();
    }
  }

  @Test
  public void executeSimpleGraph() {
    final ConnectorTestUtil.FakeSchedule schedule = new ConnectorTestUtil.FakeSchedule();
    final ContextImpl context = new ContextImpl(schedule, new TrivialPersistenceProvider());
    final TestInput<Integer> input = new TestInput<>();
    final TestSink<Integer> output = new TestSink<>();

    context.fromJunction(input, Form.forInteger())
        .map(n -> n * 2)
        .reduce(Math::max)
        .bind(output);

    context.constructGraph();
    input.push(6);
    Assert.assertEquals(output.getValue().intValue(), 12);

    input.push(10);
    Assert.assertEquals(output.getValue().intValue(), 20);

    input.push(7);
    Assert.assertEquals(output.getValue().intValue(), 20);

  }

}
