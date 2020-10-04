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

import {Component} from "./Component";
import {ComponentObserverType} from "./ComponentObserver";
import {Subcomponent} from "./Subcomponent";

/** @hidden */
export abstract class SubcomponentObserver<C extends Component, S extends Component> extends Subcomponent<C, S> {
  onSetOwnSubcomponent(newSubcomponent: S | null, oldSubcomponent: S | null): void {
    super.onSetOwnSubcomponent(newSubcomponent, oldSubcomponent);
    if (this._component.isMounted()) {
      if (oldSubcomponent !== null) {
        oldSubcomponent.removeComponentObserver(this as ComponentObserverType<S>);
      }
      if (newSubcomponent !== null) {
        newSubcomponent.addComponentObserver(this as ComponentObserverType<S>);
      }
    }
  }

  mount(): void {
    super.mount();
    const subcomponent = this._subcomponent;
    if (subcomponent !== null) {
      subcomponent.addComponentObserver(this as ComponentObserverType<S>);
    }
  }

  unmount(): void {
    const subcomponent = this._subcomponent;
    if (subcomponent !== null) {
      subcomponent.removeComponentObserver(this as ComponentObserverType<S>);
    }
    super.unmount();
  }
}
Subcomponent.Observer = SubcomponentObserver;
