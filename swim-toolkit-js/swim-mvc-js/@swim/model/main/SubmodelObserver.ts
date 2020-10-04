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

import {Model} from "./Model";
import {ModelObserverType} from "./ModelObserver";
import {Submodel} from "./Submodel";

/** @hidden */
export abstract class SubmodelObserver<M extends Model, S extends Model> extends Submodel<M, S> {
  onSetOwnSubmodel(newSubmodel: S | null, oldSubmodel: S | null): void {
    super.onSetOwnSubmodel(newSubmodel, oldSubmodel);
    if (this._model.isMounted()) {
      if (oldSubmodel !== null) {
        oldSubmodel.removeModelObserver(this as ModelObserverType<S>);
      }
      if (newSubmodel !== null) {
        newSubmodel.addModelObserver(this as ModelObserverType<S>);
      }
    }
  }

  mount(): void {
    super.mount();
    const submodel = this._submodel;
    if (submodel !== null) {
      submodel.addModelObserver(this as ModelObserverType<S>);
    }
  }

  unmount(): void {
    const submodel = this._submodel;
    if (submodel !== null) {
      submodel.removeModelObserver(this as ModelObserverType<S>);
    }
    super.unmount();
  }
}
Submodel.Observer = SubmodelObserver;
