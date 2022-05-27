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

import type {Class, Creatable} from "@swim/util";
import {Component} from "../component/Component";
import type {ServiceObserver} from "./ServiceObserver";

/** @public */
export interface ServiceFactory<S extends Service = Service> extends Creatable<S> {
  global(): S;
}

/** @public */
export interface ServiceClass<S extends Service = Service> extends Function, ServiceFactory<S> {
  readonly prototype: S;
}

/** @public */
export interface ServiceConstructor<S extends Service = Service> extends ServiceClass<S> {
  new(): S;
}

/** @public */
export class Service extends Component<Service> {
  override get componentType(): Class<Service> {
    return Service;
  }

  override readonly observerType?: Class<ServiceObserver>;

  protected override willAttachParent(parent: Service): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillAttachParent !== void 0) {
        observer.serviceWillAttachParent(parent, this);
      }
    }
  }

  protected override onAttachParent(parent: Service): void {
    // hook
  }

  protected override didAttachParent(parent: Service): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidAttachParent !== void 0) {
        observer.serviceDidAttachParent(parent, this);
      }
    }
  }

  protected override willDetachParent(parent: Service): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillDetachParent !== void 0) {
        observer.serviceWillDetachParent(parent, this);
      }
    }
  }

  protected override onDetachParent(parent: Service): void {
    // hook
  }

  protected override didDetachParent(parent: Service): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidDetachParent !== void 0) {
        observer.serviceDidDetachParent(parent, this);
      }
    }
  }

  protected override willInsertChild(child: Service, target: Service | null): void {
    super.willInsertChild(child, target);
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillInsertChild !== void 0) {
        observer.serviceWillInsertChild(child, target, this);
      }
    }
  }

  protected override didInsertChild(child: Service, target: Service | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidInsertChild !== void 0) {
        observer.serviceDidInsertChild(child, target, this);
      }
    }
    super.didInsertChild(child, target);
  }

  protected override willRemoveChild(child: Service): void {
    super.willRemoveChild(child);
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillRemoveChild !== void 0) {
        observer.serviceWillRemoveChild(child, this);
      }
    }
  }

  protected override didRemoveChild(child: Service): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidRemoveChild !== void 0) {
        observer.serviceDidRemoveChild(child, this);
      }
    }
    super.didRemoveChild(child);
  }

  protected override willReinsertChild(child: Service, target: Service | null): void {
    super.willReinsertChild(child, target);
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillReinsertChild !== void 0) {
        observer.serviceWillReinsertChild(child, target, this);
      }
    }
  }

  protected override didReinsertChild(child: Service, target: Service | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidReinsertChild !== void 0) {
        observer.serviceDidReinsertChild(child, target, this);
      }
    }
    super.didReinsertChild(child, target);
  }

  protected override willMount(): void {
    super.willMount();
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillMount !== void 0) {
        observer.serviceWillMount(this);
      }
    }
  }

  protected override didMount(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidMount !== void 0) {
        observer.serviceDidMount(this);
      }
    }
    super.didMount();
  }

  protected override willUnmount(): void {
    super.willUnmount();
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillUnmount !== void 0) {
        observer.serviceWillUnmount(this);
      }
    }
  }

  protected override didUnmount(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidUnmount !== void 0) {
        observer.serviceDidUnmount(this);
      }
    }
    super.didUnmount();
  }

  static override create<S extends new () => InstanceType<S>>(this: S): InstanceType<S> {
    return new this();
  }

  /** @internal */
  static Global?: Service;
  static global<S extends new () => InstanceType<S>>(this: S): InstanceType<S> {
    let service: InstanceType<S> | undefined;
    if (Object.hasOwnProperty.call(this, "Global")) {
      service = (this as unknown as typeof Service).Global as InstanceType<S> | undefined;
    }
    if (service === void 0) {
      service = (this as unknown as Creatable<InstanceType<S>>).create();
      Object.defineProperty(this, "Global", {
        value: service,
        configurable: true,
      });
      if (this.prototype instanceof Service) {
        const superClass = Object.getPrototypeOf(this) as typeof Service;
        const superService = superClass.global();
        superService.appendChild(service as Service);
      } else { // mount root service
        (service as Service).mount();
      }
    }
    return service;
  }

  /** @internal */
  static override uid: () => string = (function () {
    let nextId = 1;
    return function uid(): string {
      const id = ~~nextId;
      nextId += 1;
      return "service" + id;
    }
  })();
}
