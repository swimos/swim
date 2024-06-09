// Copyright 2015-2024 Nstream, inc.
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

import type {Class} from "@swim/util";
import type {Creatable} from "@swim/util";
import type {ComponentObserver} from "./Component";
import {Component} from "./Component";

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
export interface ServiceObserver<S extends Service = Service> extends ComponentObserver<S> {
  serviceWillAttachParent?(parent: Service, service: S): void;

  serviceDidAttachParent?(parent: Service, service: S): void;

  serviceWillDetachParent?(parent: Service, service: S): void;

  serviceDidDetachParent?(parent: Service, service: S): void;

  serviceWillInsertChild?(child: Service, target: Service | null, service: S): void;

  serviceDidInsertChild?(child: Service, target: Service | null, service: S): void;

  serviceWillRemoveChild?(child: Service, service: S): void;

  serviceDidRemoveChild?(child: Service, service: S): void;

  serviceWillReinsertChild?(child: Service, target: Service | null, service: S): void;

  serviceDidReinsertChild?(child: Service, target: Service | null, service: S): void;

  serviceWillMount?(service: S): void;

  serviceDidMount?(service: S): void;

  serviceWillUnmount?(service: S): void;

  serviceDidUnmount?(service: S): void;
}

/** @public */
export class Service extends Component<Service> {
  override get componentType(): Class<Service> {
    return Service;
  }

  declare readonly observerType?: Class<ServiceObserver>;

  protected override willAttachParent(parent: Service): void {
    this.callObservers("serviceWillAttachParent", parent, this);
  }

  protected override onAttachParent(parent: Service): void {
    // hook
  }

  protected override didAttachParent(parent: Service): void {
    this.callObservers("serviceDidAttachParent", parent, this);
  }

  protected override willDetachParent(parent: Service): void {
    this.callObservers("serviceWillDetachParent", parent, this);
  }

  protected override onDetachParent(parent: Service): void {
    // hook
  }

  protected override didDetachParent(parent: Service): void {
    this.callObservers("serviceDidDetachParent", parent, this);
  }

  protected override willInsertChild(child: Service, target: Service | null): void {
    super.willInsertChild(child, target);
    this.callObservers("serviceWillInsertChild", child, target, this);
  }

  protected override didInsertChild(child: Service, target: Service | null): void {
    this.callObservers("serviceDidInsertChild", child, target, this);
    super.didInsertChild(child, target);
  }

  protected override willRemoveChild(child: Service): void {
    super.willRemoveChild(child);
    this.callObservers("serviceWillRemoveChild", child, this);
  }

  protected override didRemoveChild(child: Service): void {
    this.callObservers("serviceDidRemoveChild", child, this);
    super.didRemoveChild(child);
  }

  protected override willReinsertChild(child: Service, target: Service | null): void {
    super.willReinsertChild(child, target);
    this.callObservers("serviceWillReinsertChild", child, target, this);
  }

  protected override didReinsertChild(child: Service, target: Service | null): void {
    this.callObservers("serviceDidReinsertChild", child, target, this);
    super.didReinsertChild(child, target);
  }

  protected override willMount(): void {
    super.willMount();
    this.callObservers("serviceWillMount", this);
  }

  protected override didMount(): void {
    this.callObservers("serviceDidMount", this);
    super.didMount();
  }

  protected override willUnmount(): void {
    super.willUnmount();
    this.callObservers("serviceWillUnmount", this);
  }

  protected override didUnmount(): void {
    this.callObservers("serviceDidUnmount", this);
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
        const serviceClass = Object.getPrototypeOf(this) as typeof Service;
        const rootService = serviceClass.global();
        rootService.appendChild(service as Service);
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
    };
  })();
}
