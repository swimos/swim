// Copyright 2015-2021 Swim Inc.
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
import {Affinity, Fastener, GenericHierarchy} from "@swim/fastener";

export class FastenerSpec extends Spec {
  @Test
  testFastener(exam: Exam): void {
    const fastener = Fastener.create(null);
    exam.equal(fastener.name, "");
  }

  @Test
  testFastenerDefine(exam: Exam): void {
    const testFastener = Fastener.define("foo", {});
    const fastener = testFastener.create(null);
    exam.equal(fastener.name, "foo");
  }

  @Test
  testFastenerDecorator(exam: Exam): void {
    class TestHierarchy extends GenericHierarchy {
      @Fastener({})
      readonly foo!: Fastener<this>;
    }
    const hierarchy = new TestHierarchy();
    hierarchy.mount();

    exam.equal(hierarchy.foo.name, "foo");
  }

  @Test
  testFastenerInheritance(exam: Exam): void {
    class TestHierarchy extends GenericHierarchy {
      @Fastener({inherits: true, affinity: Affinity.Intrinsic})
      readonly foo!: Fastener<this>;
    }
    const parent = new TestHierarchy();
    const child = new TestHierarchy();
    parent.appendChild(child);
    parent.mount();

    exam.equal(child.foo.superFastener, parent.foo);
    exam.equal(parent.foo.affinity, Affinity.Intrinsic);
    exam.false(parent.foo.inherited);
    exam.equal(child.foo.affinity, Affinity.Intrinsic);
    exam.true(child.foo.inherited);

    child.foo.setAffinity(Affinity.Extrinsic);
    exam.equal(parent.foo.affinity, Affinity.Intrinsic);
    exam.false(parent.foo.inherited);
    exam.equal(child.foo.affinity, Affinity.Extrinsic);
    exam.false(child.foo.inherited);

    child.foo.setAffinity(Affinity.Inherited);
    exam.equal(parent.foo.affinity, Affinity.Intrinsic);
    exam.false(parent.foo.inherited);
    exam.equal(child.foo.affinity, Affinity.Inherited);
    exam.true(child.foo.inherited);
  }
}
