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

import type {Timing} from "@swim/mapping";
import type {MoodVector, ThemeMatrix} from "@swim/theme";
import type {HtmlView} from "@swim/dom";
import {ComponentView, ComponentViewTrait, CompositeComponent} from "@swim/component";
import type {ColLayout} from "../layout/ColLayout";
import {ColView} from "./ColView";
import {ColHeader, ColTrait} from "./ColTrait";
import type {ColComponentObserver} from "./ColComponentObserver";

export class ColComponent extends CompositeComponent {
  declare readonly componentObservers: ReadonlyArray<ColComponentObserver>;

  setHeader(header: ColHeader | null): void {
    const colTrait = this.col.trait;
    if (colTrait !== null) {
      colTrait.setHeader(header);
    }
  }

  protected initColTrait(colTrait: ColTrait): void {
    // hook
  }

  protected attachColTrait(colTrait: ColTrait): void {
    const colView = this.col.view;
    if (colView !== null) {
      this.setColHeaderView(colTrait.header, colTrait);
    }
  }

  protected detachColTrait(colTrait: ColTrait): void {
    const colView = this.col.view;
    if (colView !== null) {
      this.setColHeaderView(null, colTrait);
    }
  }

  protected willSetColTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.colWillSetTrait !== void 0) {
        componentObserver.colWillSetTrait(newColTrait, oldColTrait, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.colDidSetTrait !== void 0) {
        componentObserver.colDidSetTrait(newColTrait, oldColTrait, this);
      }
    }
  }

  protected willSetColLayout(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.colWillSetLayout !== void 0) {
        componentObserver.colWillSetLayout(newLayout, oldLayout, this);
      }
    }
  }

  protected onSetColLayout(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
    // hook
  }

  protected didSetColLayout(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.colDidSetLayout !== void 0) {
        componentObserver.colDidSetLayout(newLayout, oldLayout, this);
      }
    }
  }

  protected onSetColTraitHeader(newHeader: ColHeader | null, oldHeader: ColHeader | null, colTrait: ColTrait): void {
    this.setColHeaderView(newHeader, colTrait);
  }

  protected createColView(): ColView {
    return ColView.create();
  }

  protected initColView(colView: ColView): void {
    // hook
  }

  protected themeColView(colView: ColView, theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    // hook
  }

  protected attachColView(colView: ColView): void {
    this.header.setView(colView.header.view);

    const colTrait = this.col.trait;
    if (colTrait !== null) {
      this.setColHeaderView(colTrait.header, colTrait);
    }
  }

  protected detachColView(colView: ColView): void {
    this.header.setView(null);
  }

  protected willSetColView(newColView: ColView | null, oldColView: ColView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.colWillSetView !== void 0) {
        componentObserver.colWillSetView(newColView, oldColView, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.colDidSetView !== void 0) {
        componentObserver.colDidSetView(newColView, oldColView, this);
      }
    }
  }

  protected createColHeaderView(header: ColHeader, colTrait: ColTrait): HtmlView | string | null {
    if (typeof header === "function") {
      return header(colTrait);
    } else {
      return header;
    }
  }

  protected setColHeaderView(header: ColHeader | null, colTrait: ColTrait): void {
    const colView = this.col.view;
    if (colView !== null) {
      const headerView = header !== null ? this.createColHeaderView(header, colTrait) : null;
      colView.header.setView(headerView);
    }
  }

  protected initColHeaderView(headerView: HtmlView): void {
    // hook
  }

  protected attachColHeaderView(headerView: HtmlView): void {
    // hook
  }

  protected detachColHeaderView(headerView: HtmlView): void {
    // hook
  }

  protected willSetColHeaderView(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.colWillSetHeaderView !== void 0) {
        componentObserver.colWillSetHeaderView(newHeaderView, oldHeaderView, this);
      }
    }
  }

  protected onSetColHeaderView(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null): void {
    if (oldHeaderView !== null) {
      this.detachColHeaderView(oldHeaderView);
    }
    if (newHeaderView !== null) {
      this.attachColHeaderView(newHeaderView);
      this.initColHeaderView(newHeaderView);
    }
  }

  protected didSetColHeaderView(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.colDidSetHeaderView !== void 0) {
        componentObserver.colDidSetHeaderView(newHeaderView, oldHeaderView, this);
      }
    }
  }

  /** @hidden */
  static ColFastener = ComponentViewTrait.define<ColComponent, ColView, ColTrait>({
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
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, colView: ColView): void {
      this.owner.themeColView(colView, theme, mood, timing);
    },
    colViewDidSetHeader(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null): void {
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
    colTraitWillSetLayout(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
      this.owner.willSetColLayout(newLayout, oldLayout);
    },
    colTraitDidSetLayout(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
      this.owner.onSetColLayout(newLayout, oldLayout);
      this.owner.didSetColLayout(newLayout, oldLayout);
    },
    colTraitDidSetHeader(newHeader: ColHeader | null, oldHeader: ColHeader | null, colTrait: ColTrait): void {
      this.owner.onSetColTraitHeader(newHeader, oldHeader, colTrait);
    },
  });

  @ComponentViewTrait<ColComponent, ColView, ColTrait>({
    extends: ColComponent.ColFastener,
  })
  declare col: ComponentViewTrait<this, ColView, ColTrait>;

  @ComponentView<ColComponent, HtmlView>({
    willSetView(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null): void {
      this.owner.willSetColHeaderView(newHeaderView, oldHeaderView);
    },
    onSetView(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null): void {
      this.owner.onSetColHeaderView(newHeaderView, oldHeaderView);
    },
    didSetView(newHeaderView: HtmlView | null, oldHeaderView: HtmlView | null): void {
      this.owner.didSetColHeaderView(newHeaderView, oldHeaderView);
    },
  })
  declare header: ComponentView<this, HtmlView>;
}
