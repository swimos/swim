// Copyright 2015-2023 Nstream, inc.
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
import type {Observes} from "@swim/util";
import type {Length} from "@swim/math";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import type {Presence} from "@swim/style";
import type {ViewInsets} from "@swim/view";
import {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import type {HtmlViewObserver} from "@swim/dom";
import {HtmlView} from "@swim/dom";
import {BarView} from "@swim/toolbar";
import {DrawerView} from "@swim/window";
import {SheetView} from "./SheetView";
import {StackView} from "./StackView";

/** @public */
export type FolioStyle = "stacked" | "unstacked";

/** @public */
export interface FolioViewObserver<V extends FolioView = FolioView> extends HtmlViewObserver<V> {
  viewDidSetFolioStyle?(folioStyle: FolioStyle | undefined, view: V): void;

  viewDidSetFullBleed?(fullBleed: boolean, view: V): void;

  viewWillAttachAppBar?(appBarView: BarView, targetView: View | null, view: V): void;

  viewDidDetachAppBar?(appBarView: BarView, view: V): void;

  viewWillAttachDrawer?(drawerView: DrawerView, targetView: View | null, view: V): void;

  viewDidDetachDrawer?(drawerView: DrawerView, view: V): void;

  viewWillAttachStack?(stackView: StackView, targetView: View | null, view: V): void;

  viewDidDetachStack?(stackView: StackView, view: V): void;

  viewWillAttachCover?(coverView: SheetView, targetView: View | null, view: V): void;

  viewDidDetachCover?(coverView: SheetView, view: V): void;
}

/** @public */
export class FolioView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initFolio();
  }

  protected initFolio(): void {
    this.setIntrinsic<FolioView>({
      classList: ["folio"],
      style: {
        display: "flex",
        position: "relative",
        overflow: "hidden",
      },
    });
  }

  declare readonly observerType?: Class<FolioViewObserver>;

  @Property({
    valueType: String,
    updateFlags: View.NeedsResize,
    didSetValue(folioStyle: FolioStyle | undefined): void {
      this.owner.callObservers("viewDidSetFolioStyle", folioStyle, this.owner);
      this.owner.edgeInsets.decohereOutlets();
    },
  })
  readonly folioStyle!: Property<this, FolioStyle | undefined>;

  @Property({
    valueType: Boolean,
    value: false,
    didSetValue(fullBleed: boolean): void {
      this.owner.requireUpdate(View.NeedsResize, true);
      this.owner.callObservers("viewDidSetFullBleed", fullBleed, this.owner);
    },
  })
  readonly fullBleed!: Property<this, boolean>;

  @ViewRef({
    viewType: BarView,
    binds: true,
    initView(appBarView: BarView): void {
      const folioWidth = this.owner.style.width.cssState!;

      const drawerView = this.owner.drawer.view;
      const drawerWidth = drawerView !== null ? drawerView.effectiveWidth.value : null;
      const sheetWidth = drawerWidth !== null ? folioWidth.minus(drawerWidth) : folioWidth;

      appBarView.placement.setIntrinsic("top");
      appBarView.style.setIntrinsic({
        position: "absolute",
        left: drawerWidth,
        top: 0,
        width: sheetWidth,
        zIndex: 1,
      });
    },
    willAttachView(appBarView: BarView, target: View | null): void {
      this.owner.callObservers("viewWillAttachAppBar", appBarView, target, this.owner);
    },
    didAttachView(navBarView: BarView, target: View | null): void {
      this.owner.edgeInsets.decohereOutlets();
    },
    willDetachView(navBarView: BarView): void {
      this.owner.edgeInsets.decohereOutlets();
    },
    didDetachView(appBarView: BarView): void {
      this.owner.callObservers("viewDidDetachAppBar", appBarView, this.owner);
    },
  })
  readonly appBar!: ViewRef<this, BarView>;

  @ViewRef({
    viewType: DrawerView,
    binds: true,
    observes: true,
    initView(drawerView: DrawerView): void {
      drawerView.style.setIntrinsic({
        overflow: "hidden",
        zIndex: 2,
      });
      drawerView.present(false);
    },
    willAttachView(drawerView: DrawerView, target: View | null): void {
      this.owner.callObservers("viewWillAttachDrawer", drawerView, target, this.owner);
    },
    didDetachView(drawerView: DrawerView): void {
      this.owner.callObservers("viewDidDetachDrawer", drawerView, this.owner);
    },
    insertChild(parent: View, childView: DrawerView, targetView: View | null, key: string | undefined): void {
      parent.prependChild(childView, key);
    },
    viewDidSetPresence(presence: Presence, drawerView: DrawerView): void {
      this.owner.edgeInsets.decohereOutlets();
    },
    viewDidSetEffectiveWidth(effectiveWidth: Length | null, drawerView: DrawerView): void {
      if (this.owner.folioStyle.value === "unstacked") {
        this.owner.requireUpdate(View.NeedsResize);
      }
    },
  })
  readonly drawer!: ViewRef<this, DrawerView> & Observes<DrawerView>;

  @ViewRef({
    viewType: StackView,
    initView(stackView: StackView): void {
      stackView.style.flexGrow.setIntrinsic(1);
    },
    willAttachView(stackView: StackView, target: View | null): void {
      this.owner.callObservers("viewWillAttachStack", stackView, target, this.owner);
    },
    didDetachView(stackView: StackView): void {
      this.owner.callObservers("viewDidDetachStack", stackView, this.owner);
    },
  })
  readonly stack!: ViewRef<this, StackView>;

  @ViewRef({
    viewType: SheetView,
    binds: false,
    observes: true,
    initView(coverView: SheetView): void {
      if (this.owner.folioStyle.value === "unstacked") {
        const folioWidth = this.owner.style.width.cssState!;
        const folioHeight = this.owner.style.height.cssState!;

        const drawerView = this.owner.drawer.view;
        const drawerWidth = drawerView !== null ? drawerView.effectiveWidth.value : null;
        const sheetWidth = drawerWidth !== null ? folioWidth.minus(drawerWidth) : folioWidth;

        const appBarView = this.owner.appBar.view;
        const appBarHeight = appBarView !== null ? appBarView.style.height.cssState : null;

        coverView.style.setIntrinsic({
          position: "absolute",
          left: drawerWidth,
          top: 0,
          width: sheetWidth,
          height: folioHeight,
          paddingTop: appBarHeight,
          boxSizing: "border-box",
          zIndex: 0,
        });
      }
    },
    willAttachView(coverView: SheetView, target: View | null): void {
      this.owner.callObservers("viewWillAttachCover", coverView, target, this.owner);
    },
    didAttachView(coverView: SheetView, target: View | null): void {
      this.owner.fullBleed.setIntrinsic(coverView.fullBleed.value);
    },
    willDetachView(coverView: SheetView): void {
      coverView.remove();
    },
    didDetachView(coverView: SheetView): void {
      this.owner.callObservers("viewDidDetachCover", coverView, this.owner);
    },
    viewDidSetFullBleed(fullBleed: boolean, coverView: SheetView): void {
      this.owner.fullBleed.setIntrinsic(fullBleed);
    },
  })
  readonly cover!: ViewRef<this, SheetView> & Observes<SheetView>;

  @Property({
    extends: true,
    getOutletValue(outlet: Property<unknown, ViewInsets>): ViewInsets {
      let edgeInsets = this.value;
      if (this.owner.folioStyle.value === "unstacked") {
        let insetTop = edgeInsets.insetTop;
        const insetRight = edgeInsets.insetRight;
        const insetBottom = edgeInsets.insetBottom;
        let insetLeft = edgeInsets.insetLeft;
        if (outlet.owner === this.owner.appBar.view) {
          const drawerView = this.owner.drawer.view;
          if (drawerView !== null) {
            insetLeft *= 1 - drawerView.presence.value.phase;
          }
          edgeInsets = {insetTop, insetRight, insetBottom, insetLeft};
        } else if (outlet.owner === this.owner.cover.view) {
          if (this.owner.appBar.view !== null) {
            insetTop = 0;
          }
          const drawerView = this.owner.drawer.view;
          if (drawerView !== null) {
            insetLeft *= 1 - drawerView.presence.value.phase;
          }
          edgeInsets = {insetTop, insetRight, insetBottom, insetLeft};
        }
      }
      return edgeInsets;
    },
  })
  override get edgeInsets(): Property<this, ViewInsets> {
    return Property.getter();
  }

  protected override onResize(): void {
    super.onResize();
    this.resizeFolio();
  }

  protected resizeFolio(): void {
    let folioStyle = this.folioStyle.value;
    if (this.folioStyle.hasAffinity(Affinity.Intrinsic)) {
      folioStyle = this.viewIdiom === "mobile" ? "stacked" : "unstacked";
      this.folioStyle.setIntrinsic(folioStyle);
    }

    if (folioStyle === "stacked") {
      this.resizeStacked();
    } else if (folioStyle === "unstacked") {
      this.resizeUnstacked();
    }
  }

  protected resizeStacked(): void {
    this.drawer.removeView();
    this.appBar.removeView();
    this.stack.insertView(this);

    const coverView = this.cover.view;
    if (coverView !== null) {
      if (coverView.parent === this) {
        coverView.remove();
      }

      coverView.style.paddingLeft.setIntrinsic(null);
    }
  }

  protected resizeUnstacked(): void {
    const folioWidth = this.style.width.cssState!;
    const folioHeight = this.style.height.cssState!;

    const drawerView = this.drawer.insertView();
    const drawerWidth = drawerView.effectiveWidth.value;
    const sheetWidth = drawerWidth !== null ? folioWidth.minus(drawerWidth) : folioWidth;

    const appBarView = this.appBar.view;
    let appBarHeight: Length | null = null;
    if (appBarView !== null) {
      this.appBar.insertView().style.setIntrinsic({
        left: drawerWidth,
        width: sheetWidth,
      });
      appBarHeight = appBarView.style.height.cssState;
    }

    this.stack.insertView(drawerView);

    const coverView = this.cover.view;
    if (coverView !== null) {
      this.cover.insertView(this);
      if (this.fullBleed.value) {
        coverView.style.setIntrinsic({
          left: 0,
          top: 0,
          width: folioWidth,
          height: folioHeight,
          paddingTop: appBarHeight,
          paddingLeft: drawerWidth,
        });
      } else {
        coverView.style.setIntrinsic({
          left: drawerWidth,
          top: 0,
          width: sheetWidth,
          height: folioHeight,
          paddingTop: appBarHeight,
          paddingLeft: null,
        });
      }
      coverView.present(false);
    }
  }

  protected override didLayout(): void {
    this.layoutFolio();
    super.didLayout();
  }

  protected layoutFolio(): void {
    const folioStyle = this.folioStyle.value;
    if (folioStyle === "stacked") {
      this.layoutStacked();
    } else if (folioStyle === "unstacked") {
      this.layoutUnstacked();
    }
  }

  protected layoutStacked(): void {
    // hook
  }

  protected layoutUnstacked(): void {
    const folioWidth = this.style.width.cssState!;

    const drawerView = this.drawer.insertView();
    const drawerWidth = drawerView.effectiveWidth.value;
    const sheetWidth = drawerWidth !== null ? folioWidth.minus(drawerWidth) : folioWidth;

    const appBarView = this.appBar.view;
    if (appBarView !== null) {
      appBarView.style.setIntrinsic({
        left: drawerWidth,
        width: sheetWidth,
      });
    }

    const coverView = this.cover.view;
    if (coverView !== null) {
      if (this.fullBleed.value) {
        coverView.style.setIntrinsic({
          left: 0,
          width: folioWidth,
          paddingLeft: drawerWidth,
        });
      } else {
        coverView.style.setIntrinsic({
          left: drawerWidth,
          width: 0,
          paddingLeft: null,
        });
      }
    }
  }
}
