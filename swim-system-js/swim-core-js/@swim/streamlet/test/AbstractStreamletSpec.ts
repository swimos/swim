// Copyright 2015-2020 Swim inc.
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

import {Spec, Test, Exam} from "@swim/unit";
import {Inlet, Outlet, Inoutlet, ValueInput, ValueOutput, AbstractStreamlet, In, Out, Inout} from "@swim/streamlet";

export class AbstractStreamletSpec extends Spec {
  @Test
  inspectGenericStreamlets(exam: Exam): void {
    class TestStreamlet extends AbstractStreamlet {
      @In
      foo: Inlet;
      @Inout
      bar: Inoutlet;
      @Out
      baz: Outlet;
    }
    const streamlet = new TestStreamlet();
    exam.equal(streamlet.inlet("foo"), streamlet.foo);
    exam.equal(streamlet.inlet("bar"), streamlet.bar);
    exam.equal(streamlet.inlet("baz"), null);
    exam.equal(streamlet.outlet("foo"), null);
    exam.equal(streamlet.outlet("bar"), streamlet.bar);
    exam.equal(streamlet.outlet("baz"), streamlet.baz);
  }

  @Test
  inspectInheritedStreamlets(exam: Exam): void {
    class ParentStreamlet extends AbstractStreamlet {
      @In
      foo: Inlet;
      @Out
      baz: Outlet;
    }
    class ChildStreamlet extends ParentStreamlet {
      @Inout
      bar: Inlet;
    }
    const streamlet = new ChildStreamlet();
    exam.equal(streamlet.inlet("foo"), streamlet.foo);
    exam.equal(streamlet.inlet("bar"), streamlet.bar);
    exam.equal(streamlet.inlet("baz"), null);
    exam.equal(streamlet.outlet("foo"), null);
    exam.equal(streamlet.outlet("bar"), streamlet.bar);
    exam.equal(streamlet.outlet("baz"), streamlet.baz);
  }

  @Test
  evaluateGenericStreamlets(exam: Exam): void {
    class TestStreamlet extends AbstractStreamlet<number, number> {
      @In
      foo: Inlet<number> = this.inlet();
      @In
      bar: Inlet<number> = this.inlet();
      @Out
      baz: Outlet<number> = this.outlet();
      getOutput(outlet: Outlet<number>): number | undefined {
        if (outlet === this.baz) {
          return this.getInput(this.foo)! + this.getInput(this.bar)!;
        }
        return void 0;
      }
    }
    const foo = new ValueInput<number>(0);
    const bar = new ValueInput<number>(0);
    const output = new ValueOutput<number>();
    const streamlet = new TestStreamlet();
    streamlet.bindInput("foo", foo);
    streamlet.bindInput("bar", bar);
    output.bindInput(streamlet.baz);

    foo.set(2);
    bar.set(3);
    foo.recohereInput(0); // recohere forward
    exam.equal(output.get(), 5);

    foo.set(5);
    bar.set(7);
    output.recohereOutput(1); // recohere backward
    exam.equal(output.get(), 12);
  }
}
