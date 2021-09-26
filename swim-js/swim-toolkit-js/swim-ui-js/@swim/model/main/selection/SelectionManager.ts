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

import {Lazy} from "@swim/util";
import type {Model} from "../Model";
import {ModelManager} from "../manager/ModelManager";
import type {SelectionManagerObserver} from "./SelectionManagerObserver";
import {SelectableTrait} from "../"; // forward import

export interface SelectionOptions {
  multi?: boolean;
}

export class SelectionManager<M extends Model = Model> extends ModelManager<M> {
  constructor() {
    super();
    this.selections = [];
  }

  readonly selections: ReadonlyArray<Model>;

  isSelected(model: Model): boolean {
    return this.selections.indexOf(model) >= 0;
  }

  select(model: Model, options?: SelectionOptions | null, index?: number): void {
    const selections = this.selections as Model[];
    if (selections.indexOf(model) < 0) {
      if (options === void 0) {
        options = null;
      }
      if (options === null || !options.multi) {
        this.unselectAll();
      }
      if (index === void 0) {
        index = selections.length;
      } else {
        if (index < 0) {
          index = selections.length + 1 + index;
        }
        index = Math.min(Math.max(0, index, selections.length));
      }
      const selectableTrait = model.getTrait(SelectableTrait);
      this.willSelect(model, index, options);
      if (selectableTrait !== null) {
        selectableTrait.willSelect(options);
      }
      selections.splice(index, 0, model);
      this.onSelect(model, index, options);
      if (selectableTrait !== null) {
        selectableTrait.onSelect(options);
        selectableTrait.didSelect(options);
      }
      this.didSelect(model, index, options);
    }
  }

  protected willSelect(model: Model, index: number, options: SelectionOptions | null): void {
    this.willObserve(function (modelManagerObserver: SelectionManagerObserver): void {
      if (modelManagerObserver.selectionManagerWillSelect !== void 0) {
        modelManagerObserver.selectionManagerWillSelect(model, index, options, this);
      }
    });
  }

  protected onSelect(model: Model, index: number, options: SelectionOptions | null): void {
    // hook
  }

  protected didSelect(model: Model, index: number, options: SelectionOptions | null): void {
    this.didObserve(function (modelManagerObserver: SelectionManagerObserver): void {
      if (modelManagerObserver.selectionManagerDidSelect !== void 0) {
        modelManagerObserver.selectionManagerDidSelect(model, index, options, this);
      }
    });
  }

  unselect(model: Model): void {
    const selections = this.selections as Model[];
    const index = selections.indexOf(model);
    if (index >= 0) {
      const selectableTrait = model.getTrait(SelectableTrait);
      this.willUnselect(model);
      if (selectableTrait !== null) {
        selectableTrait.willUnselect();
      }
      selections.splice(index, 1);
      this.onUnselect(model);
      if (selectableTrait !== null) {
        selectableTrait.onUnselect();
        selectableTrait.didUnselect();
      }
      this.didUnselect(model);
    }
  }

  protected willUnselect(model: Model): void {
    this.willObserve(function (modelManagerObserver: SelectionManagerObserver): void {
      if (modelManagerObserver.selectionManagerWillUnselect !== void 0) {
        modelManagerObserver.selectionManagerWillUnselect(model, this);
      }
    });
  }

  protected onUnselect(model: Model): void {
    // hook
  }

  protected didUnselect(model: Model): void {
    this.didObserve(function (modelManagerObserver: SelectionManagerObserver): void {
      if (modelManagerObserver.selectionManagerDidUnselect !== void 0) {
        modelManagerObserver.selectionManagerDidUnselect(model, this);
      }
    });
  }

  unselectAll(): void {
    const selections = this.selections;
    while (selections.length !== 0) {
      this.unselect(selections[0]!);
    }
  }

  toggle(model: Model, options?: SelectionOptions | null, index?: number): void {
    const selections = this.selections as Model[];
    const selectedIndex = selections.indexOf(model);
    if (selectedIndex < 0) {
      if (options === void 0) {
        options = null;
      }
      if (options === null || !options.multi) {
        this.unselectAll();
      }
      if (index === void 0) {
        index = selections.length;
      } else {
        if (index < 0) {
          index = selections.length + 1 + index;
        }
        index = Math.min(Math.max(0, index, selections.length));
      }
      const selectableTrait = model.getTrait(SelectableTrait);
      this.willSelect(model, index, options);
      if (selectableTrait !== null) {
        selectableTrait.willSelect(options);
      }
      selections.splice(index, 0, model);
      this.onSelect(model, index, options);
      if (selectableTrait !== null) {
        selectableTrait.onSelect(options);
        selectableTrait.didSelect(options);
      }
      this.didSelect(model, index, options);
    } else {
      const selectableTrait = model.getTrait(SelectableTrait);
      this.willUnselect(model);
      if (selectableTrait !== null) {
        selectableTrait.willUnselect();
      }
      selections.splice(selectedIndex, 1);
      this.onUnselect(model);
      if (selectableTrait !== null) {
        selectableTrait.onUnselect();
        selectableTrait.didUnselect();
      }
      this.didUnselect(model);
    }
  }

  override readonly modelManagerObservers!: ReadonlyArray<SelectionManagerObserver>;

  @Lazy
  static global<M extends Model>(): SelectionManager<M> {
    return new SelectionManager();
  }
}
