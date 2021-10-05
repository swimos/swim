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

import type {Class} from "@swim/util";
import {ViewFastener} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import {TraitViewFastener, GenericController} from "@swim/controller";
import type {ColLayout} from "../layout/ColLayout";
import {ColView} from "./ColView";
import {ColLabel, ColTrait} from "./ColTrait";
import type {ColControllerObserver} from "./ColControllerObserver";

export class ColController extends GenericController {
  override readonly observerType?: Class<ColControllerObserver>;

  protected initColTrait(colTrait: ColTrait): void {
    // hook
  }

  protected attachColTrait(colTrait: ColTrait): void {
    const colView = this.col.view;
    if (colView !== null) {
      this.setLabelView(colTrait.label.state, colTrait);
    }
  }

  protected detachColTrait(colTrait: ColTrait): void {
    const colView = this.col.view;
    if (colView !== null) {
      this.setLabelView(null, colTrait);
    }
  }

  protected willSetColTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetColTrait !== void 0) {
        observer.controllerWillSetColTrait(newColTrait, oldColTrait, this);
      }
    }
  }

  protected onSetColTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null): void {
    if (oldColTrait !== null) {
      this.detachColTrait(oldColTrait);
    }
    if (newColTrait !== null) {
      this.attachColTrait(newColTrait);
      this.initColTrait(newColTrait);
    }
  }

  protected didSetColTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetColTrait !== void 0) {
        observer.controllerDidSetColTrait(newColTrait, oldColTrait, this);
      }
    }
  }

  protected willSetLayout(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetColLayout !== void 0) {
        observer.controllerWillSetColLayout(newLayout, oldLayout, this);
      }
    }
  }

  protected onSetLayout(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
    // hook
  }

  protected didSetLayout(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetColLayout !== void 0) {
        observer.controllerDidSetColLayout(newLayout, oldLayout, this);
      }
    }
  }

  protected createColView(): ColView {
    return ColView.create();
  }

  protected initColView(colView: ColView): void {
    // hook
  }

  protected attachColView(colView: ColView): void {
    this.label.setView(colView.label.view);

    const colTrait = this.col.trait;
    if (colTrait !== null) {
      this.setLabelView(colTrait.label.state, colTrait);
    }
  }

  protected detachColView(colView: ColView): void {
    this.label.setView(null);
  }

  protected willSetColView(newColView: ColView | null, oldColView: ColView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetColView !== void 0) {
        observer.controllerWillSetColView(newColView, oldColView, this);
      }
    }
  }

  protected onSetColView(newColView: ColView | null, oldColView: ColView | null): void {
    if (oldColView !== null) {
      this.detachColView(oldColView);
    }
    if (newColView !== null) {
      this.attachColView(newColView);
      this.initColView(newColView);
    }
  }

  protected didSetColView(newColView: ColView | null, oldColView: ColView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetColView !== void 0) {
        observer.controllerDidSetColView(newColView, oldColView, this);
      }
    }
  }

  /** @internal */
  static ColFastener = TraitViewFastener.define<ColController, ColTrait, ColView>({
    traitType: ColTrait,
    observesTrait: true,
    willSetTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null): void {
      this.owner.willSetColTrait(newColTrait, oldColTrait);
    },
    onSetTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null): void {
      this.owner.onSetColTrait(newColTrait, oldColTrait);
    },
    didSetTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null): void {
      this.owner.didSetColTrait(newColTrait, oldColTrait);
    },
    traitWillSetLayout(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
      this.owner.willSetLayout(newLayout, oldLayout);
    },
    traitDidSetLayout(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
      this.owner.onSetLayout(newLayout, oldLayout);
      this.owner.didSetLayout(newLayout, oldLayout);
    },
    traitDidSetLabel(newLabel: ColLabel | null, oldLabel: ColLabel | null, colTrait: ColTrait): void {
      this.owner.setLabelView(newLabel, colTrait);
    },
    viewType: ColView,
    observesView: true,
    willSetView(newColView: ColView | null, oldColView: ColView | null): void {
      this.owner.willSetColView(newColView, oldColView);
    },
    onSetView(newColView: ColView | null, oldColView: ColView | null): void {
      this.owner.onSetColView(newColView, oldColView);
    },
    didSetView(newColView: ColView | null, oldColView: ColView | null): void {
      this.owner.didSetColView(newColView, oldColView);
    },
    viewDidSetLabel(newLabelView: HtmlView | null, oldLabelView: HtmlView | null): void {
      this.owner.label.setView(newLabelView);
    },
    createView(): ColView | null {
      return this.owner.createColView();
    },
  });

  @TraitViewFastener<ColController, ColTrait, ColView>({
    extends: ColController.ColFastener,
  })
  readonly col!: TraitViewFastener<this, ColTrait, ColView>;

  protected createLabelView(label: ColLabel, colTrait: ColTrait): HtmlView | string | null {
    if (typeof label === "function") {
      return label(colTrait);
    } else {
      return label;
    }
  }

  protected setLabelView(label: ColLabel | null, colTrait: ColTrait): void {
    const colView = this.col.view;
    if (colView !== null) {
      const labelView = label !== null ? this.createLabelView(label, colTrait) : null;
      colView.label.setView(labelView);
    }
  }

  protected initLabelView(labelView: HtmlView): void {
    // hook
  }

  protected attachLabelView(labelView: HtmlView): void {
    // hook
  }

  protected detachLabelView(labelView: HtmlView): void {
    // hook
  }

  protected willSetLabelView(newLabelView: HtmlView | null, oldLabelView: HtmlView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetColLabelView !== void 0) {
        observer.controllerWillSetColLabelView(newLabelView, oldLabelView, this);
      }
    }
  }

  protected onSetLabelView(newLabelView: HtmlView | null, oldLabelView: HtmlView | null): void {
    if (oldLabelView !== null) {
      this.detachLabelView(oldLabelView);
    }
    if (newLabelView !== null) {
      this.attachLabelView(newLabelView);
      this.initLabelView(newLabelView);
    }
  }

  protected didSetLabelView(newLabelView: HtmlView | null, oldLabelView: HtmlView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetColLabelView !== void 0) {
        observer.controllerDidSetColLabelView(newLabelView, oldLabelView, this);
      }
    }
  }

  @ViewFastener<ColController, HtmlView>({
    willSetView(newLabelView: HtmlView | null, oldLabelView: HtmlView | null): void {
      this.owner.willSetLabelView(newLabelView, oldLabelView);
    },
    onSetView(newLabelView: HtmlView | null, oldLabelView: HtmlView | null): void {
      this.owner.onSetLabelView(newLabelView, oldLabelView);
    },
    didSetView(newLabelView: HtmlView | null, oldLabelView: HtmlView | null): void {
      this.owner.didSetLabelView(newLabelView, oldLabelView);
    },
  })
  readonly label!: ViewFastener<this, HtmlView>;
}
