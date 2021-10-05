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
import {Affinity, Property, GenericHierarchy} from "@swim/fastener";

export class PropertySpec extends Spec {
  @Test
  testProperty(exam: Exam): void {
    const property = Property.create(null, "foo");
    exam.equal(property.name, "foo");
    exam.equal(property.state, void 0);

    property.setState("bar");
    exam.equal(property.state, "bar");

    exam.identical(property("baz"), null, "accessor set");
    exam.equal(property(), "baz", "accessor get");
  }

  @Test
  testPropertyDefine(exam: Exam): void {
    const testProperty = Property.define({state: "bar"});
    const property = testProperty.create(null, "foo");
    exam.equal(property.name, "foo");
    exam.equal(property.state, "bar");

    property.setState("baz");
    exam.equal(property.state, "baz");

    exam.identical(property("qux"), null, "accessor set");
    exam.equal(property(), "qux", "accessor get");
  }

  @Test
  testPropertyDecorator(exam: Exam): void {
    class TestHierarchy extends GenericHierarchy {
      @Property({state: "bar"})
      readonly foo!: Property<this, string>;
    }
    const hierarchy = new TestHierarchy();
    hierarchy.mount();

    exam.equal(hierarchy.foo.name, "foo");
    exam.equal(hierarchy.foo.state, "bar");

    hierarchy.foo.setState("baz");
    exam.equal(hierarchy.foo.state, "baz");

    exam.identical(hierarchy.foo("qux"), hierarchy, "accessor set");
    exam.equal(hierarchy.foo(), "qux", "accessor get");
  }

  @Test
  testPropertyInheritance(exam: Exam): void {
    class TestHierarchy extends GenericHierarchy {
      @Property({inherits: true})
      readonly foo!: Property<this, string | undefined>;
    }
    const parent = new TestHierarchy();
    const child = new TestHierarchy();
    parent.appendChild(child);
    parent.mount();

    exam.equal(child.foo.superFastener, parent.foo);
    exam.equal(parent.foo.state, void 0);
    exam.false(parent.foo.inherited);
    exam.true(parent.foo.coherent);
    exam.equal(child.foo.state, void 0);
    exam.true(child.foo.inherited);
    exam.true(child.foo.coherent);

    parent.foo.setState("bar");
    exam.equal(parent.foo.state, "bar");
    exam.false(parent.foo.inherited);
    exam.true(parent.foo.coherent);
    exam.equal(child.foo.state, void 0);
    exam.true(child.foo.inherited);
    exam.false(child.foo.coherent);

    child.recohereFasteners();
    exam.equal(child.foo.state, "bar");
    exam.true(child.foo.inherited);
    exam.true(child.foo.coherent);

    child.foo.setState("baz");
    exam.equal(parent.foo.state, "bar");
    exam.false(parent.foo.inherited);
    exam.true(parent.foo.coherent);
    exam.equal(child.foo.state, "baz");
    exam.false(child.foo.inherited);
    exam.true(child.foo.coherent);

    child.foo.setAffinity(Affinity.Inherited);
    exam.equal(parent.foo.state, "bar");
    exam.false(parent.foo.inherited);
    exam.true(parent.foo.coherent);
    exam.equal(child.foo.state, "bar");
    exam.true(child.foo.inherited);
    exam.true(child.foo.coherent);
  }
}
