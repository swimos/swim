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

import {Component} from "../Component";
import {ComponentManagerObserverType, ComponentManager} from "../manager/ComponentManager";
import {ComponentService} from "./ComponentService";

/** @hidden */
export abstract class ComponentManagerService<C extends Component, CM extends ComponentManager<C>> extends ComponentService<C, CM> {
  /** @hidden */
  readonly observe?: boolean;

  mount(): void {
    super.mount();
    const manager = this._manager;
    if (manager !== void 0 && !this.isInherited()) {
      manager.insertRootComponent(this._component);
      if (this.observe !== false) {
        manager.addComponentManagerObserver(this as ComponentManagerObserverType<CM>);
      }
    }
  }

  unmount(): void {
    const manager = this._manager;
    if (manager !== void 0 && !this.isInherited()) {
      if (this.observe !== false) {
        manager.removeComponentManagerObserver(this as ComponentManagerObserverType<CM>);
      }
      manager.removeRootComponent(this._component);
    }
    super.unmount();
  }
}
ComponentService.Manager = ComponentManagerService;
