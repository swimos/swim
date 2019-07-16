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

package swim.streamlet;

import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;

public class AbstractStreamletSpec {
  @Test
  public void inspectGenericStreamlets() {
    class TestStreamlet extends AbstractStreamlet<Object, Object> {
      @In
      Inlet<Object> foo;
      @Inout
      Inoutlet<Object, Object> bar;
      @Out
      Outlet<Object> baz;
    }
    final TestStreamlet streamlet = new TestStreamlet();
    assertEquals(streamlet.inlet("foo"), streamlet.foo);
    assertEquals(streamlet.inlet("bar"), streamlet.bar);
    assertEquals(streamlet.inlet("baz"), null);
    assertEquals(streamlet.outlet("foo"), null);
    assertEquals(streamlet.outlet("bar"), streamlet.bar);
    assertEquals(streamlet.outlet("baz"), streamlet.baz);
  }

  @Test
  public void inspectInheritedStreamlets() {
    class ParentStreamlet extends AbstractStreamlet<Object, Object> {
      @In
      Inlet<Object> foo;
      @Out
      Outlet<Object> baz;
    }
    class ChildStreamlet extends ParentStreamlet {
      @Inout
      Inoutlet<Object, Object> bar;
    }
    final ChildStreamlet streamlet = new ChildStreamlet();
    assertEquals(streamlet.inlet("foo"), streamlet.foo);
    assertEquals(streamlet.inlet("bar"), streamlet.bar);
    assertEquals(streamlet.inlet("baz"), null);
    assertEquals(streamlet.outlet("foo"), null);
    assertEquals(streamlet.outlet("bar"), streamlet.bar);
    assertEquals(streamlet.outlet("baz"), streamlet.baz);
  }

  @Test
  public void evaluateGenericStreamlets() {
    class TestStreamlet extends AbstractStreamlet<Integer, Integer> {
      @In
      Inlet<Integer> foo = inlet();
      @In
      Inlet<Integer> bar = inlet();
      @Out
      Outlet<Integer> baz = outlet();
      @Override
      public Integer getOutput(Outlet<? super Integer> outlet) {
        if (outlet == baz) {
          return getInput(foo) + getInput(bar);
        }
        return null;
      }
    }
    final ValueInput<Integer> foo = new ValueInput<>(0);
    final ValueInput<Integer> bar = new ValueInput<>(0);
    final ValueOutput<Integer> output = new ValueOutput<>();
    final TestStreamlet streamlet = new TestStreamlet();
    streamlet.bindInput("foo", foo);
    streamlet.bindInput("bar", bar);
    output.bindInput(streamlet.baz);

    foo.set(2);
    bar.set(3);
    foo.reconcileInput(0); // reconcile forward
    assertEquals((int) output.get(), 5);

    foo.set(5);
    bar.set(7);
    output.reconcileOutput(1); // reconcile backward
    assertEquals((int) output.get(), 12);
  }
}
