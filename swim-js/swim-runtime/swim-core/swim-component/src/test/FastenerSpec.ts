// Copyright 2015-2023 Swim.inc
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
import {Affinity, Fastener, Component} from "@swim/component";

export class FastenerSpec extends Spec {
  @Test
  testFastener(exam: Exam): void {
    const fastener = Fastener.create(null);
    exam.equal(fastener.name, "Fastener");
  }

  @Test
  testFastenerDefine(exam: Exam): void {
    const testFastener = Fastener.define("foo", {});
    const fastener = testFastener.create(null);
    exam.equal(fastener.name, "foo");
  }

  @Test
  testFastenerDecorator(exam: Exam): void {
    class TestComponent extends Component {
      @Fastener({})
      readonly foo!: Fastener<this>;
    }
    const component = new TestComponent();
    component.mount();

    exam.equal(component.foo.name, "foo");
  }

  @Test
  testFastenerInheritance(exam: Exam): void {
    class TestComponent extends Component {
      @Fastener({inherits: true, affinity: Affinity.Intrinsic})
      readonly foo!: Fastener<this>;
    }
    const parent = new TestComponent();
    const child = new TestComponent();
    parent.appendChild(child);
    parent.mount();

    exam.equal(child.foo.inlet, parent.foo);
    exam.equal(parent.foo.affinity, Affinity.Intrinsic);
    exam.false(parent.foo.derived);
    exam.equal(child.foo.affinity, Affinity.Intrinsic);
    exam.true(child.foo.derived);

    child.foo.setAffinity(Affinity.Extrinsic);
    exam.equal(parent.foo.affinity, Affinity.Intrinsic);
    exam.false(parent.foo.derived);
    exam.equal(child.foo.affinity, Affinity.Extrinsic);
    exam.false(child.foo.derived);

    child.foo.setAffinity(Affinity.Inherited);
    exam.equal(parent.foo.affinity, Affinity.Intrinsic);
    exam.false(parent.foo.derived);
    exam.equal(child.foo.affinity, Affinity.Inherited);
    exam.true(child.foo.derived);
  }
}
