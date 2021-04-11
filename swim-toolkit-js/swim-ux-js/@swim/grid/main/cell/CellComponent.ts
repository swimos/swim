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
import {CellView} from "./CellView";
import {CellContent, CellTrait} from "./CellTrait";
import type {CellComponentObserver} from "./CellComponentObserver";

export class CellComponent extends CompositeComponent {
  declare readonly componentObservers: ReadonlyArray<CellComponentObserver>;

  protected initCellTrait(cellTrait: CellTrait): void {
    // hook
  }

  protected attachCellTrait(cellTrait: CellTrait): void {
    const cellView = this.cell.view;
    if (cellView !== null) {
      this.setContentView(cellTrait.content.state, cellTrait);
    }
  }

  protected detachCellTrait(cellTrait: CellTrait): void {
    const cellView = this.cell.view;
    if (cellView !== null) {
      this.setContentView(null, cellTrait);
    }
  }

  protected willSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetCellTrait !== void 0) {
        componentObserver.componentWillSetCellTrait(newCellTrait, oldCellTrait, this);
      }
    }
  }

  protected onSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null): void {
    if (oldCellTrait !== null) {
      this.detachCellTrait(oldCellTrait);
    }
    if (newCellTrait !== null) {
      this.attachCellTrait(newCellTrait);
      this.initCellTrait(newCellTrait);
    }
  }

  protected didSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetCellTrait !== void 0) {
        componentObserver.componentDidSetCellTrait(newCellTrait, oldCellTrait, this);
      }
    }
  }

  protected createCellView(): CellView {
    return CellView.create();
  }

  protected initCellView(cellView: CellView): void {
    // hook
  }

  protected attachCellView(cellView: CellView): void {
    this.content.setView(cellView.content.view);

    const cellTrait = this.cell.trait;
    if (cellTrait !== null) {
      this.setContentView(cellTrait.content.state, cellTrait);
    }
  }

  protected detachCellView(cellView: CellView): void {
    this.content.setView(null);
  }

  protected willSetCellView(newCellView: CellView | null, oldCellView: CellView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetCellView !== void 0) {
        componentObserver.componentWillSetCellView(newCellView, oldCellView, this);
      }
    }
  }

  protected onSetCellView(newCellView: CellView | null, oldCellView: CellView | null): void {
    if (oldCellView !== null) {
      this.detachCellView(oldCellView);
    }
    if (newCellView !== null) {
      this.attachCellView(newCellView);
      this.initCellView(newCellView);
    }
  }

  protected didSetCellView(newCellView: CellView | null, oldCellView: CellView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetCellView !== void 0) {
        componentObserver.componentDidSetCellView(newCellView, oldCellView, this);
      }
    }
  }

  protected themeCellView(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, cellView: CellView): void {
    // hook
  }

  protected createContentView(content: CellContent, cellTrait: CellTrait): HtmlView | string | null {
    if (typeof content === "function") {
      return content(cellTrait);
    } else {
      return content;
    }
  }

  protected setContentView(content: CellContent | null, cellTrait: CellTrait): void {
    const cellView = this.cell.view;
    if (cellView !== null) {
      const contentView = content !== null ? this.createContentView(content, cellTrait) : null;
      cellView.content.setView(contentView);
    }

  }

  protected initContentView(contentView: HtmlView): void {
    // hook
  }

  protected attachContentView(contentView: HtmlView): void {
    // hook
  }

  protected detachContentView(contentView: HtmlView): void {
    // hook
  }

  protected willSetContentView(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetCellContentView !== void 0) {
        componentObserver.componentWillSetCellContentView(newContentView, oldContentView, this);
      }
    }
  }

  protected onSetContentView(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
    if (oldContentView !== null) {
      this.detachContentView(oldContentView);
    }
    if (newContentView !== null) {
      this.attachContentView(newContentView);
      this.initContentView(newContentView);
    }
  }

  protected didSetContentView(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetCellContentView !== void 0) {
        componentObserver.componentDidSetCellContentView(newContentView, oldContentView, this);
      }
    }
  }

  /** @hidden */
  static CellFastener = ComponentViewTrait.define<CellComponent, CellView, CellTrait>({
    viewType: CellView,
    observeView: true,
    willSetView(newCellView: CellView | null, oldCellView: CellView | null): void {
      this.owner.willSetCellView(newCellView, oldCellView);
    },
    onSetView(newCellView: CellView | null, oldCellView: CellView | null): void {
      this.owner.onSetCellView(newCellView, oldCellView);
    },
    didSetView(newCellView: CellView | null, oldCellView: CellView | null): void {
      this.owner.didSetCellView(newCellView, oldCellView);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, cellView: CellView): void {
      this.owner.themeCellView(theme, mood, timing, cellView);
    },
    viewDidSetCellContent(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
      this.owner.content.setView(newContentView);
    },
    createView(): CellView | null {
      return this.owner.createCellView();
    },
    traitType: CellTrait,
    observeTrait: true,
    willSetTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null): void {
      this.owner.willSetCellTrait(newCellTrait, oldCellTrait);
    },
    onSetTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null): void {
      this.owner.onSetCellTrait(newCellTrait, oldCellTrait);
    },
    didSetTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null): void {
      this.owner.didSetCellTrait(newCellTrait, oldCellTrait);
    },
    traitDidSetCellContent(newCellContent: CellContent | null, oldCellContent: CellContent | null, cellTrait: CellTrait): void {
      this.owner.setContentView(newCellContent, cellTrait);
    },
  });

  @ComponentViewTrait<CellComponent, CellView, CellTrait>({
    extends: CellComponent.CellFastener,
  })
  declare cell: ComponentViewTrait<this, CellView, CellTrait>;

  @ComponentView<CellComponent, HtmlView>({
    willSetView(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
      this.owner.willSetContentView(newContentView, oldContentView);
    },
    onSetView(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
      this.owner.onSetContentView(newContentView, oldContentView);
    },
    didSetView(newContentView: HtmlView | null, oldContentView: HtmlView | null): void {
      this.owner.didSetContentView(newContentView, oldContentView);
    },
  })
  declare content: ComponentView<this, HtmlView>;
}
