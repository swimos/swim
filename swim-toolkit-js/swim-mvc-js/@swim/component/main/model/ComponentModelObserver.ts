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

import {Model, ModelObserverType} from "@swim/model";
import {Component} from "../Component";
import {ComponentModel} from "./ComponentModel";

/** @hidden */
export abstract class ComponentModelObserver<C extends Component, M extends Model> extends ComponentModel<C, M> {
  onSetOwnModel(newModel: M | null, oldModel: M | null): void {
    super.onSetOwnModel(newModel, oldModel);
    if (this._component.isMounted()) {
      if (oldModel !== null) {
        oldModel.removeModelObserver(this as ModelObserverType<M>);
      }
      if (newModel !== null) {
        newModel.addModelObserver(this as ModelObserverType<M>);
      }
    }
  }

  mount(): void {
    super.mount();
    const model = this._model;
    if (model !== null) {
      model.addModelObserver(this as ModelObserverType<M>);
    }
  }

  unmount(): void {
    const model = this._model;
    if (model !== null) {
      model.removeModelObserver(this as ModelObserverType<M>);
    }
    super.unmount();
  }
}
ComponentModel.Observer = ComponentModelObserver;
