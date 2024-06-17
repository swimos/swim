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

import type {Mutable} from "@swim/util";
import type {Class} from "@swim/util";
import {Provider} from "@swim/component";
import type {TraitObserver} from "./Trait";
import {Trait} from "./Trait";
import type {SelectionOptions} from "./SelectionService";
import {SelectionService} from "./SelectionService";

/** @public */
export interface SelectableTraitObserver<T extends SelectableTrait = SelectableTrait> extends TraitObserver<T> {
  traitWillSelect?(options: SelectionOptions | null, trait: T): void;

  traitDidSelect?(options: SelectionOptions | null, trait: T): void;

  traitWillUnselect?(trait: T): void;

  traitDidUnselect?(trait: T): void;
}

/** @public */
export class SelectableTrait extends Trait {
  constructor() {
    super();
    this.selected = false;
  }

  declare readonly observerType?: Class<SelectableTraitObserver>;

  readonly selected: boolean;

  select(options?: SelectionOptions | null): void {
    if (this.selected) {
      return;
    }
    (this as Mutable<this>).selected = true;
    if (!this.mounted) {
      return;
    }
    this.selection.getService().select(this.model!, options);
  }

  /** @protected */
  willSelect(options: SelectionOptions | null): void {
    this.callObservers("traitWillSelect", options, this);
  }

  /** @protected */
  onSelect(options: SelectionOptions | null): void {
    (this as Mutable<this>).selected = true;
  }

  /** @protected */
  didSelect(options: SelectionOptions | null): void {
    this.callObservers("traitDidSelect", options, this);
  }

  unselect(): void {
    if (!this.selected) {
      return;
    }
    (this as Mutable<this>).selected = false;
    if (!this.mounted) {
      return;
    }
    this.selection.getService().unselect(this.model!);
  }

  /** @protected */
  willUnselect(): void {
    this.callObservers("traitWillUnselect", this);
  }

  /** @protected */
  onUnselect(): void {
    (this as Mutable<this>).selected = false;
  }

  /** @protected */
  didUnselect(): void {
    this.callObservers("traitDidUnselect", this);
  }

  unselectAll(): void {
    this.selection.getService().unselectAll();
  }

  toggle(options?: SelectionOptions): void {
    if (!this.selected) {
      this.select(options);
    } else {
      this.unselect();
    }
  }

  @Provider({serviceType: SelectionService})
  readonly selection!: Provider<this, SelectionService>;

  protected override didMount(): void {
    if (this.selected) {
      this.selection.getService().select(this.model!);
    }
    super.didMount();
  }

  protected override willUnmount(): void {
    super.willUnmount();
    this.selection.getService().unselect(this.model!);
  }
}
