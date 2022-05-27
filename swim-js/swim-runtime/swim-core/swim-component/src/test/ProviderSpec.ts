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
import {Provider, Component, Service} from "@swim/component";

export class ProviderSpec extends Spec {
  @Test
  testProviderDefine(exam: Exam): void {
    const service = new Service();
    const testProvider = Provider.define("foo", {
      createService(): Service {
        return service;
      },
    });
    const provider = testProvider.create(null);
    exam.equal(provider.name, "foo");
    exam.identical(provider.service, service);
    exam.equal(provider(), service, "accessor");
  }

  @Test
  testProviderDecorator(exam: Exam): void {
    const service = new Service();
    class TestComponent extends Component {
      @Provider({
        createService(): Service {
          return service;
        },
      })
      readonly foo!: Provider<this, Service>;
    }
    const component = new TestComponent();
    component.mount();

    exam.equal(component.foo.name, "foo");
    exam.identical(component.foo.service, service);
    exam.equal(component.foo(), service, "accessor");
  }

  @Test
  testProviderInheritance(exam: Exam): void {
    let id = 0;
    class TestService extends Service {
      constructor() {
        super();
        this.id = id;
        id += 1;
      }
      readonly id: number;
    }
    class TestComponent extends Component {
      @Provider<TestComponent["foo"]>({
        inherits: true,
        lazy: false,
        createService(): TestService {
          return new TestService();
        },
      })
      readonly foo!: Provider<this, TestService>;
    }
    const parent = new TestComponent();
    const child = new TestComponent();
    parent.appendChild(child);
    parent.mount();

    exam.equal(child.foo.inlet, parent.foo);
    exam.equal(parent.foo.getService().id, 0);
    exam.false(parent.foo.derived);
    exam.equal(child.foo.getService().id, 0);
    exam.true(child.foo.derived);
  }

  @Test
  testProviderOverride(exam: Exam): void {
    let id = 0;
    class TestService extends Service {
      constructor() {
        super();
        this.id = id;
        id += 1;
      }
      readonly id: number;
    }
    class TestComponent extends Component {
      @Provider<TestComponent["foo"]>({
        lazy: false,
        inherits: true,
        createService(): TestService {
          return new TestService();
        },
      })
      readonly foo!: Provider<this, TestService>;
    }
    const parent = new TestComponent();
    const child = new TestComponent();
    child.foo.setInherits(false);
    parent.appendChild(child);
    parent.mount();

    exam.equal(child.foo.inlet, null);
    exam.equal(parent.foo.getService().id, 0);
    exam.false(parent.foo.derived);
    exam.equal(child.foo.getService().id, 1);
    exam.false(child.foo.derived);

    child.foo.setInherits(true);
    exam.equal(parent.foo.getService().id, 0);
    exam.false(parent.foo.derived);
    exam.equal(child.foo.getService().id, 0);
    exam.true(child.foo.derived);
  }
}
