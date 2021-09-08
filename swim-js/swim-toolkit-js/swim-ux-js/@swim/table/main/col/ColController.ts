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

import type {HtmlView} from "@swim/dom";
import {ControllerView, ControllerViewTrait, CompositeController} from "@swim/controller";
import type {ColLayout} from "../layout/ColLayout";
import {ColView} from "./ColView";
import {ColHeader, ColTrait} from "./ColTrait";
import type {ColControllerObserver} from "./ColControllerObserver";

export class ColController extends CompositeController {
  override readonly controllerObservers!: ReadonlyArray<ColControllerObserver>;

  protected initColTrait(colTrait: ColTrait): void {
    // hook
  }

  protected attachColTrait(colTrait: ColTrait): void {
    const colView = this.col.view;
    if (colView !== null) {
      this.setHeaderView(colTrait.header.state, colTrait);
    }
  }

  protected detachColTrait(colTrait: ColTrait): void {
    const colView = this.col.view;
    if (colView !== null) {
      this.setHeaderView(null, colTrait);
    }
  }

  protected willSetColTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetColTrait !== void 0) {
        controllerObserver.controllerWillSetColTrait(newColTrait, oldColTrait, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetColTrait !== void 0) {
        controllerObserver.controllerDidSetColTrait(newColTrait, oldColTrait, this);
      }
    }
  }

  protected willSetLayout(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetColLayout !== void 0) {
        controllerObserver.controllerWillSetColLayout(newLayout, oldLayout, this);
      }
    }
  }

  protected onSetLayout(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
    // hook
  }

  protected didSetLayout(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetColLayout !== void 0) {
        controllerObserver.controllerDidSetColLayout(newLayout, oldLayout, this);
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
    this.header.setView(colView.header.view);

    const colTrait = this.col.trait;
    if (colTrait !== null) {
      this.setHeaderView(colTrait.header.state, colTrait);
    }
  }

  protected detachColView(colView: ColView): void {
    this.header.setView(null);
  }

  protected willSetColView(newColView: ColView | null, oldColView: ColView | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetColView !== void 0) {
        controllerObserver.controllerWillSetColView(newColView, oldColView, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetColView !== void 0) {
        controllerObserver.controllerDidSetColView(newColView, oldColView, this);
      }
    }
  }

  protected createHeaderView(header: ColHeader, colTrait: ColTrait): HtmlView | string | null {
    if (typeof header === "function") {
      return header(colTrait);
    } else {
      return header;
    }
  }

  protected setHeaderView(header: ColHeader | null, colTrait: ColTrait): void {
    const colView = this.col.view;
    if (colView !== null) {
      const headerView = header !== null ? this.createHeaderView(header, colTrait) : null;
      colView.header.setView(headerView);
    }
  }

  protected initHeaderView(headerView: HtmlView): void {
    // hook
  }

  protected attachHeaderView(headerView: HtmlView): void {
    // hook
  }

  protected detachHeaderView(headerView: HtmlView): void {
    // hook
  }

  protected willSetHeaderView(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetColHeaderView !== void 0) {
        controllerObserver.controllerWillSetColHeaderView(newHeaderView, oldHeaderView, this);
      }
    }
  }

  protected onSetHeaderView(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null): void {
    if (oldHeaderView !== null) {
      this.detachHeaderView(oldHeaderView);
    }
    if (newHeaderView !== null) {
      this.attachHeaderView(newHeaderView);
      this.initHeaderView(newHeaderView);
    }
  }

  protected didSetHeaderView(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetColHeaderView !== void 0) {
        controllerObserver.controllerDidSetColHeaderView(newHeaderView, oldHeaderView, this);
      }
    }
  }

  /** @hidden */
  static ColFastener = ControllerViewTrait.define<ColController, ColView, ColTrait>({
    viewType: ColView,
    observeView: true,
    willSetView(newColView: ColView | null, oldColView: ColView | null): void {
      this.owner.willSetColView(newColView, oldColView);
    },
    onSetView(newColView: ColView | null, oldColView: ColView | null): void {
      this.owner.onSetColView(newColView, oldColView);
    },
    didSetView(newColView: ColView | null, oldColView: ColView | null): void {
      this.owner.didSetColView(newColView, oldColView);
    },
    viewDidSetColHeader(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null): void {
      this.owner.header.setView(newHeaderView);
    },
    createView(): ColView | null {
      return this.owner.createColView();
    },
    traitType: ColTrait,
    observeTrait: true,
    willSetTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null): void {
      this.owner.willSetColTrait(newColTrait, oldColTrait);
    },
    onSetTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null): void {
      this.owner.onSetColTrait(newColTrait, oldColTrait);
    },
    didSetTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null): void {
      this.owner.didSetColTrait(newColTrait, oldColTrait);
    },
    traitWillSetColLayout(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
      this.owner.willSetLayout(newLayout, oldLayout);
    },
    traitDidSetColLayout(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
      this.owner.onSetLayout(newLayout, oldLayout);
      this.owner.didSetLayout(newLayout, oldLayout);
    },
    traitDidSetColHeader(newHeader: ColHeader | null, oldHeader: ColHeader | null, colTrait: ColTrait): void {
      this.owner.setHeaderView(newHeader, colTrait);
    },
  });

  @ControllerViewTrait<ColController, ColView, ColTrait>({
    extends: ColController.ColFastener,
  })
  readonly col!: ControllerViewTrait<this, ColView, ColTrait>;

  @ControllerView<ColController, HtmlView>({
    willSetView(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null): void {
      this.owner.willSetHeaderView(newHeaderView, oldHeaderView);
    },
    onSetView(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null): void {
      this.owner.onSetHeaderView(newHeaderView, oldHeaderView);
    },
    didSetView(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null): void {
      this.owner.didSetHeaderView(newHeaderView, oldHeaderView);
    },
  })
  readonly header!: ControllerView<this, HtmlView>;
}
