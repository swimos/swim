// Copyright 2015-2022 Swim.inc
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
import {Affinity, Property, Component} from "@swim/component";

export class PropertySpec extends Spec {
  @Test
  testProperty(exam: Exam): void {
    const property = Property.create(null);
    exam.equal(property.name, "Property");
    exam.equal(property.value, void 0);

    property.setValue("bar");
    exam.equal(property.value, "bar");

    exam.identical(property("baz"), null, "accessor set");
    exam.equal(property(), "baz", "accessor get");
  }

  @Test
  testPropertyDefine(exam: Exam): void {
    const testProperty = Property.define("foo", {value: "bar"});
    const property = testProperty.create(null);
    exam.equal(property.name, "foo");
    exam.equal(property.value, "bar");

    property.setValue("baz");
    exam.equal(property.value, "baz");

    exam.identical(property("qux"), null, "accessor set");
    exam.equal(property(), "qux", "accessor get");
  }

  @Test
  testPropertyDecorator(exam: Exam): void {
    class TestComponent extends Component {
      @Property({value: "bar"})
      readonly foo!: Property<this, string>;
    }
    const component = new TestComponent();
    component.mount();

    exam.equal(component.foo.name, "foo");
    exam.equal(component.foo.value, "bar");

    component.foo.setValue("baz");
    exam.equal(component.foo.value, "baz");

    exam.identical(component.foo("qux"), component, "accessor set");
    exam.equal(component.foo(), "qux", "accessor get");
  }

  @Test
  testPropertyInheritance(exam: Exam): void {
    class TestComponent extends Component {
      @Property({inherits: true})
      readonly foo!: Property<this, string | undefined>;
    }
    const parent = new TestComponent();
    const child = new TestComponent();
    parent.appendChild(child);
    parent.mount();

    exam.equal(child.foo.inlet, parent.foo);
    exam.equal(parent.foo.value, void 0);
    exam.false(parent.foo.derived);
    exam.true(parent.foo.coherent);
    exam.equal(child.foo.value, void 0);
    exam.true(child.foo.derived);
    exam.true(child.foo.coherent);

    parent.foo.setValue("bar");
    exam.equal(parent.foo.value, "bar");
    exam.false(parent.foo.derived);
    exam.true(parent.foo.coherent);
    exam.equal(child.foo.value, void 0);
    exam.true(child.foo.derived);
    exam.false(child.foo.coherent);

    child.recohereFasteners();
    exam.equal(child.foo.value, "bar");
    exam.true(child.foo.derived);
    exam.true(child.foo.coherent);

    child.foo.setValue("baz");
    exam.equal(parent.foo.value, "bar");
    exam.false(parent.foo.derived);
    exam.true(parent.foo.coherent);
    exam.equal(child.foo.value, "baz");
    exam.false(child.foo.derived);
    exam.true(child.foo.coherent);

    child.foo.setAffinity(Affinity.Inherited);
    exam.equal(parent.foo.value, "bar");
    exam.false(parent.foo.derived);
    exam.true(parent.foo.coherent);
    exam.equal(child.foo.value, "bar");
    exam.true(child.foo.derived);
    exam.true(child.foo.coherent);
  }
}
