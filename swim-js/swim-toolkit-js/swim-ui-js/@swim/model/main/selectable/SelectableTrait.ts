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

import {GenericTrait} from "../generic/GenericTrait";
import {SelectionOptions, SelectionManager} from "../selection/SelectionManager";
import {SelectionService} from "../service/SelectionService";
import {TraitService} from "../service/TraitService";
import type {SelectableTraitObserver} from "./SelectableTraitObserver";

export class SelectableTrait extends GenericTrait {
  constructor() {
    super();
    Object.defineProperty(this, "selected", {
      value: false,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly traitObservers!: ReadonlyArray<SelectableTraitObserver>;

  /** @hidden */
  readonly selected!: boolean;

  isSelected(): boolean {
    return this.selected;
  }

  select(options?: SelectionOptions | null): void {
    if (!this.selected) {
      Object.defineProperty(this, "selected", {
        value: true,
        enumerable: true,
        configurable: true,
      });
      if (this.isMounted()) {
        const selectionManager = this.selectionService.manager;
        if (selectionManager !== void 0 && selectionManager !== null) {
          selectionManager.select(this.model!, options);
        }
      }
    }
  }

  /** @hidden */
  willSelect(options: SelectionOptions | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSelect !== void 0) {
        traitObserver.traitWillSelect(options, this);
      }
    }
  }

  /** @hidden */
  onSelect(options: SelectionOptions | null): void {
    Object.defineProperty(this, "selected", {
      value: true,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  didSelect(options: SelectionOptions | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSelect !== void 0) {
        traitObserver.traitDidSelect(options, this);
      }
    }
  }

  unselect(): void {
    if (this.selected) {
      Object.defineProperty(this, "selected", {
        value: false,
        enumerable: true,
        configurable: true,
      });
      if (this.isMounted()) {
        const selectionManager = this.selectionService.manager;
        if (selectionManager !== void 0 && selectionManager !== null) {
          selectionManager.unselect(this.model!);
        }
      }
    }
  }

  /** @hidden */
  willUnselect(): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillUnselect !== void 0) {
        traitObserver.traitWillUnselect(this);
      }
    }
  }

  /** @hidden */
  onUnselect(): void {
    Object.defineProperty(this, "selected", {
      value: false,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  didUnselect(): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidUnselect !== void 0) {
        traitObserver.traitDidUnselect(this);
      }
    }
  }

  unselectAll(): void {
    const selectionManager = this.selectionService.manager;
    if (selectionManager !== void 0 && selectionManager !== null) {
      selectionManager.unselectAll();
    }
  }

  toggle(options?: SelectionOptions): void {
    if (!this.selected) {
      this.select(options);
    } else {
      this.unselect();
    }
  }

  @TraitService<SelectableTrait, SelectionManager>({
    type: SelectionManager,
    observe: false,
    modelService: {
      extends: SelectionService,
      type: SelectionManager,
      observe: false,
    },
  })
  readonly selectionService!: TraitService<this, SelectionManager>;

  protected override didMount(): void {
    if (this.selected) {
      const selectionManager = this.selectionService.manager;
      if (selectionManager !== void 0 && selectionManager !== null) {
        selectionManager.select(this.model!);
      }
    }
    super.didMount();
  }

  protected override willUnmount(): void {
    super.willUnmount();
    const selectionManager = this.selectionService.manager;
    if (selectionManager !== void 0 && selectionManager !== null) {
      selectionManager.unselect(this.model!);
    }
  }
}
