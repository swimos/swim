// Copyright 2015-2021 Swim.inc
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

import type {Mutable, Class} from "@swim/util";
import {Provider} from "@swim/component";
import {SelectionOptions, SelectionService} from "../selection/SelectionService";
import {SelectionProvider} from "../selection/SelectionProvider";
import {Trait} from "../trait/Trait";
import type {SelectableTraitObserver} from "./SelectableTraitObserver";

/** @public */
export class SelectableTrait extends Trait {
  constructor() {
    super();
    this.selected = false;
  }

  override readonly observerType?: Class<SelectableTraitObserver>;

  readonly selected: boolean;

  select(options?: SelectionOptions | null): void {
    if (!this.selected) {
      (this as Mutable<this>).selected = true;
      if (this.mounted) {
        const selectionService = this.selectionProvider.service;
        if (selectionService !== void 0 && selectionService !== null) {
          selectionService.select(this.model!, options);
        }
      }
    }
  }

  /** @protected */
  willSelect(options: SelectionOptions | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitWillSelect !== void 0) {
        observer.traitWillSelect(options, this);
      }
    }
  }

  /** @protected */
  onSelect(options: SelectionOptions | null): void {
    (this as Mutable<this>).selected = true;
  }

  /** @protected */
  didSelect(options: SelectionOptions | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitDidSelect !== void 0) {
        observer.traitDidSelect(options, this);
      }
    }
  }

  unselect(): void {
    if (this.selected) {
      (this as Mutable<this>).selected = false;
      if (this.mounted) {
        const selectionService = this.selectionProvider.service;
        if (selectionService !== void 0 && selectionService !== null) {
          selectionService.unselect(this.model!);
        }
      }
    }
  }

  /** @protected */
  willUnselect(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitWillUnselect !== void 0) {
        observer.traitWillUnselect(this);
      }
    }
  }

  /** @protected */
  onUnselect(): void {
    (this as Mutable<this>).selected = false;
  }

  /** @protected */
  didUnselect(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitDidUnselect !== void 0) {
        observer.traitDidUnselect(this);
      }
    }
  }

  unselectAll(): void {
    const selectionService = this.selectionProvider.service;
    if (selectionService !== void 0 && selectionService !== null) {
      selectionService.unselectAll();
    }
  }

  toggle(options?: SelectionOptions): void {
    if (!this.selected) {
      this.select(options);
    } else {
      this.unselect();
    }
  }

  @Provider({
    extends: SelectionProvider,
    type: SelectionService,
    observes: false,
    service: SelectionService.global(),
  })
  readonly selectionProvider!: SelectionProvider<this>;

  protected override didMount(): void {
    if (this.selected) {
      const selectionService = this.selectionProvider.service;
      if (selectionService !== void 0 && selectionService !== null) {
        selectionService.select(this.model!);
      }
    }
    super.didMount();
  }

  protected override willUnmount(): void {
    super.willUnmount();
    const selectionService = this.selectionProvider.service;
    if (selectionService !== void 0 && selectionService !== null) {
      selectionService.unselect(this.model!);
    }
  }
}
