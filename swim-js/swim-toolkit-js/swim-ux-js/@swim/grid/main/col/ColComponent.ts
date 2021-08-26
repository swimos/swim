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

import type {Timing} from "@swim/mapping";
import type {MoodVector, ThemeMatrix} from "@swim/theme";
import type {HtmlView} from "@swim/dom";
import {ComponentView, ComponentViewTrait, CompositeComponent} from "@swim/component";
import type {ColLayout} from "../layout/ColLayout";
import {ColView} from "./ColView";
import {ColHeader, ColTrait} from "./ColTrait";
import type {ColComponentObserver} from "./ColComponentObserver";

export class ColComponent extends CompositeComponent {
  override readonly componentObservers!: ReadonlyArray<ColComponentObserver>;

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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetColTrait !== void 0) {
        componentObserver.componentWillSetColTrait(newColTrait, oldColTrait, this);
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
      if (componentObserver.componentDidSetColTrait !== void 0) {
        componentObserver.componentDidSetColTrait(newColTrait, oldColTrait, this);
      }
    }
  }

  protected willSetLayout(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetColLayout !== void 0) {
        componentObserver.componentWillSetColLayout(newLayout, oldLayout, this);
      }
    }
  }

  protected onSetLayout(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
    // hook
  }

  protected didSetLayout(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetColLayout !== void 0) {
        componentObserver.componentDidSetColLayout(newLayout, oldLayout, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetColView !== void 0) {
        componentObserver.componentWillSetColView(newColView, oldColView, this);
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
      if (componentObserver.componentDidSetColView !== void 0) {
        componentObserver.componentDidSetColView(newColView, oldColView, this);
      }
    }
  }

  protected themeColView(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, colView: ColView): void {
    // hook
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetColHeaderView !== void 0) {
        componentObserver.componentWillSetColHeaderView(newHeaderView, oldHeaderView, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetColHeaderView !== void 0) {
        componentObserver.componentDidSetColHeaderView(newHeaderView, oldHeaderView, this);
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
      this.owner.themeColView(theme, mood, timing, colView);
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

  @ComponentViewTrait<ColComponent, ColView, ColTrait>({
    extends: ColComponent.ColFastener,
  })
  readonly col!: ComponentViewTrait<this, ColView, ColTrait>;

  @ComponentView<ColComponent, HtmlView>({
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
  readonly header!: ComponentView<this, HtmlView>;
}
