// Copyright 2015-2021 Swim.inc
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
import {Provider, Component} from "@swim/component";

export class ProviderSpec extends Spec {
  @Test
  testProviderDefine(exam: Exam): void {
    const testProvider = Provider.define("foo", {service: "bar"});
    const provider = testProvider.create(null);
    exam.equal(provider.name, "foo");
    exam.equal(provider.service, "bar");
    exam.equal(provider(), "bar", "accessor");
  }

  @Test
  testProviderDecorator(exam: Exam): void {
    class TestComponent extends Component {
      @Provider({service: "bar"})
      readonly foo!: Provider<this, string>;
    }
    const component = new TestComponent();
    component.mount();

    exam.equal(component.foo.name, "foo");
    exam.equal(component.foo.service, "bar");
    exam.equal(component.foo(), "bar", "accessor");
  }

  @Test
  testProviderInheritance(exam: Exam): void {
    let id = 0;
    class TestComponent extends Component {
      @Provider<TestComponent, {id: number} | undefined>({
        inherits: true,
        createService(): {id: number} | undefined {
          const service = {id};
          id += 1;
          return service;
        },
      })
      readonly foo!: Provider<this, {id: number} | undefined>;
    }
    const parent = new TestComponent();
    const child = new TestComponent();
    parent.appendChild(child);
    parent.mount();

    exam.equal(child.foo.superFastener, parent.foo);
    exam.equal(parent.foo.service, {id: 0});
    exam.false(parent.foo.inherited);
    exam.equal(child.foo.service, {id: 0});
    exam.true(child.foo.inherited);
  }

  @Test
  testProviderOverride(exam: Exam): void {
    let id = 0;
    class TestComponent extends Component {
      @Provider<TestComponent, {id: number} | undefined>({
        lazy: false,
        inherits: true,
        createService(): {id: number} | undefined {
          const service = {id};
          id += 1;
          return service;
        },
      })
      readonly foo!: Provider<this, {id: number} | undefined>;
    }
    const parent = new TestComponent();
    const child = new TestComponent();
    child.foo.setInherits(false);
    parent.appendChild(child);
    parent.mount();

    exam.equal(child.foo.superFastener, null);
    exam.equal(parent.foo.service, {id: 0});
    exam.false(parent.foo.inherited);
    exam.equal(child.foo.service, {id: 1});
    exam.false(child.foo.inherited);

    child.foo.setInherits(true);
    exam.equal(parent.foo.service, {id: 0});
    exam.false(parent.foo.inherited);
    exam.equal(child.foo.service, {id: 0});
    exam.true(child.foo.inherited);
  }
}
