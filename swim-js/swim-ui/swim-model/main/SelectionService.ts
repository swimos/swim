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
import type {ServiceObserver} from "@swim/component";
import {Service} from "@swim/component";
import type {Model} from "./Model";
import {SelectableTrait} from "./"; // forward import

/** @public */
export interface SelectionOptions {
  multi?: boolean;
}

/** @public */
export interface SelectionServiceObserver<S extends SelectionService = SelectionService> extends ServiceObserver<S> {
  serviceWillSelect?(model: Model, index: number, options: SelectionOptions | null, service: S): void;

  serviceDidSelect?(model: Model, index: number, options: SelectionOptions | null, service: S): void;

  serviceWillUnselect?(model: Model, service: S): void;

  serviceDidUnselect?(model: Model, service: S): void;

  serviceDidUnselectAll?(service: S): void;
}

/** @public */
export class SelectionService extends Service {
  constructor() {
    super();
    this.selections = [];
  }

  declare readonly observerType?: Class<SelectionServiceObserver>;

  readonly selections: readonly Model[];

  isSelected(model: Model): boolean {
    return this.selections.indexOf(model) >= 0;
  }

  select(model: Model, options?: SelectionOptions | null, index?: number): void {
    const selections = this.selections as Model[];
    if (selections.indexOf(model) >= 0) {
      return;
    } else if (options === void 0) {
      options = null;
    }
    if (options === null || !options.multi) {
      this.unselectAll(true);
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

  protected willSelect(model: Model, index: number, options: SelectionOptions | null): void {
    this.callObservers("serviceWillSelect", model, index, options, this);
  }

  protected onSelect(model: Model, index: number, options: SelectionOptions | null): void {
    // hook
  }

  protected didSelect(model: Model, index: number, options: SelectionOptions | null): void {
    this.callObservers("serviceDidSelect", model, index, options, this);
  }

  unselect(model: Model): void;
  /** @internal */
  unselect(model: Model, internal?: boolean): void;
  unselect(model: Model, internal?: boolean): void {
    const selections = this.selections as Model[];
    const index = selections.indexOf(model);
    if (index < 0) {
      return;
    }
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
    if (internal !== true && selections.length === 0) {
      this.didUnselectAll();
    }
  }

  protected willUnselect(model: Model): void {
    this.callObservers("serviceWillUnselect", model, this);
  }

  protected onUnselect(model: Model): void {
    // hook
  }

  protected didUnselect(model: Model): void {
    this.callObservers("serviceDidUnselect", model, this);
  }

  unselectAll(): void;
  /** @internal */
  unselectAll(internal?: boolean): void;
  unselectAll(internal?: boolean): void {
    const selections = this.selections;
    if (selections.length === 0) {
      return;
    }
    while (selections.length !== 0) {
      this.unselect(selections[0]!, true);
    }
    if (internal !== true) {
      this.didUnselectAll();
    }
  }

  protected didUnselectAll(): void {
    this.callObservers("serviceDidUnselectAll", this);
  }

  toggle(model: Model, options?: SelectionOptions | null, index?: number): void {
    const selections = this.selections as Model[];
    const selectedIndex = selections.indexOf(model);
    if (selectedIndex < 0) {
      if (options === void 0) {
        options = null;
      }
      if (options === null || !options.multi) {
        this.unselectAll(true);
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
      if (selections.length === 0) {
        this.didUnselectAll();
      }
    }
  }
}
