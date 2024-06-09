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
import type {Observes} from "@swim/util";
import type {Like} from "@swim/util";
import type {LikeType} from "@swim/util";
import {Property} from "@swim/component";
import {Length} from "@swim/math";
import {Look} from "@swim/theme";
import {Feel} from "@swim/theme";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import {ViewSet} from "@swim/view";
import type {HtmlViewObserver} from "@swim/dom";
import {HtmlView} from "@swim/dom";

/** @public */
export type PaneLayout = "frame" | "stack";

/** @public */
export type PanelStyle = "card" | "none";

/** @public */
export interface PanelViewObserver<V extends PanelView = PanelView> extends HtmlViewObserver<V> {
  viewDidSetUnitWidth?(unitWidth: number, view: V): void;

  viewDidSetUnitHeight?(unitHeight: number, view: V): void;

  viewDidSetMinPanelHeight?(minPanelHeight: number, view: V): void;

  viewDidSetPanelStyle?(panelStyle: PanelStyle, view: V): void;

  viewDidSetPaneLayout?(paneLayout: PaneLayout, view: V): void;

  viewWillAttachHeader(headerView: HtmlView, view: V): void;

  viewDidDetachHeader(headerView: HtmlView, view: V): void;

  viewWillAttachHeaderTitle(titleView: HtmlView, view: V): void;

  viewDidDetachHeaderTitle(titleView: HtmlView, view: V): void;

  viewWillAttachHeaderSubtitle(subtitleView: HtmlView, view: V): void;

  viewDidDetachHeaderSubtitle(subtitleView: HtmlView, view: V): void;

  viewWillAttachPane?(paneView: PanelView, targetView: View | null, view: V): void;

  viewDidDetachPane?(paneView: PanelView, view: V): void;
}

/** @public */
export class PanelView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initPanel();
    node.addEventListener("scroll", this.onPanelScroll.bind(this));
  }

  protected initPanel(): void {
    this.setIntrinsic<PanelView>({
      classList: ["panel"],
      style: {
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
      },
    });
    this.panelStyle.applyPanelStyle(this.panelStyle.value);
  }

  declare readonly observerType?: Class<PanelViewObserver>;

  @Property({valueType: Number, updateFlags: View.NeedsResize})
  readonly widthBasis!: Property<this, number | undefined>;

  @Property({valueType: Number, updateFlags: View.NeedsResize})
  readonly heightBasis!: Property<this, number | undefined>;

  @Property({
    valueType: Number,
    value: 1,
    didSetValue(unitWidth: number): void {
      this.owner.callObservers("viewDidSetUnitWidth", unitWidth, this.owner);
    },
  })
  readonly unitWidth!: Property<this, number>;

  @Property({
    valueType: Number,
    value: 1,
    didSetValue(unitHeight: number): void {
      this.owner.callObservers("viewDidSetUnitHeight", unitHeight, this.owner);
    },
  })
  readonly unitHeight!: Property<this, number>;

  @Property({
    valueType: Number,
    value: 180,
    inherits: true,
    didSetValue(minPanelHeight: number): void {
      this.owner.callObservers("viewDidSetMinPanelHeight", minPanelHeight, this.owner);
    },
  })
  readonly minPanelHeight!: Property<this, number>;

  @Property({
    valueType: String,
    value: "none",
    updateFlags: View.NeedsResize,
    didSetValue(panelStyle: PanelStyle): void {
      this.applyPanelStyle(panelStyle);
      this.owner.callObservers("viewDidSetPanelStyle", panelStyle, this.owner);
    },
    applyPanelStyle(panelStyle: PanelStyle): void {
      const panelView = this.owner;
      if (panelStyle === "card") {
        panelView.classList.add("panel-card");
        panelView.style.setIntrinsic({
          margin: 6,
          borderRadius: 4,
          backgroundColor: Look.backgroundColor,
        });
        panelView.modifyTheme(Feel.default, [[Feel.raised, 1]]);
      } else {
        panelView.classList.remove("panel-card");
        panelView.style.setIntrinsic({
          margin: 0,
          borderRadius: null,
          backgroundColor: null,
        });
        panelView.modifyTheme(Feel.default, [[Feel.raised, void 0]]);
      }
    },
  })
  readonly panelStyle!: Property<this, PanelStyle> & {
    applyPanelStyle(panelStyle: PanelStyle): void,
  };

  @Property({
    valueType: String,
    value: "frame",
    inherits: true,
    updateFlags: View.NeedsResize,
    didSetValue(paneLayout: PaneLayout): void {
      this.owner.callObservers("viewDidSetPaneLayout", paneLayout, this.owner);
    },
  })
  readonly paneLayout!: Property<this, PaneLayout | undefined>;

  @Property({
    valueType: Number,
    value: 720,
    inherits: true,
    updateFlags: View.NeedsResize,
  })
  readonly minFrameWidth!: Property<this, number>;

  @Property({
    valueType: Number,
    value: 540,
    inherits: true,
    updateFlags: View.NeedsResize,
  })
  readonly minFrameHeight!: Property<this, number>;

  @ViewRef({
    viewType: HtmlView,
    viewKey: true,
    binds: true,
    willAttachView(headerView: HtmlView): void {
      this.owner.callObservers("viewWillAttachHeader", headerView, this.owner);
    },
    didDetachView(headerView: HtmlView): void {
      this.owner.callObservers("viewDidDetachHeader", headerView, this.owner);
    },
    insertChild(parent: View, child: HtmlView, target: View | null, key: string | undefined): void {
      if (target !== null) {
        parent.insertChild(child, target, key);
      } else {
        parent.prependChild(child, key);
      }
    },
    createView(): HtmlView {
      return (super.createView() as HtmlView).setIntrinsic({
        classList: ["panel-header"],
        style: {
          display: "flex",
          justifyContent: "space-between",
          position: "absolute",
          left: 0,
          top: 0,
          width: Length.pct(100),
          height: 30,
          paddingLeft: 12,
          paddingRight: 12,
          boxSizing: "border-box",
          userSelect: "none",
          zIndex: 1,
        },
      });
    }
  })
  readonly header!: ViewRef<this, HtmlView>;

  @ViewRef({
    viewType: HtmlView,
    viewKey: "panel-title",
    binds: true,
    get parentView(): HtmlView | null {
      return this.owner.header.insertView();
    },
    willAttachView(titleView: HtmlView): void {
      this.owner.callObservers("viewWillAttachHeaderTitle", titleView, this.owner);
    },
    didDetachView(titleView: HtmlView): void {
      this.owner.callObservers("viewDidDetachHeaderTitle", titleView, this.owner);
    },
    insertChild(parent: View, child: HtmlView, target: View | null, key: string | undefined): void {
      if (target === null) {
        target = this.owner.headerSubtitle.view;
      }
      parent.insertChild(child, target, key);
    },
    fromLike(value: HtmlView | LikeType<HtmlView> | string | undefined): HtmlView {
      if (value === void 0 || typeof value === "string") {
        let view = this.view;
        if (view === null) {
          view = this.createView();
        }
        view.text.setState(value);
        return view;
      }
      return super.fromLike(value);
    },
    createView(): HtmlView {
      return (super.createView() as HtmlView).setIntrinsic({
        classList: ["header-title"],
        style: {
          alignSelf: "center",
          color: Look.legendColor,
        },
      });
    },
  })
  readonly headerTitle!: ViewRef<this, Like<HtmlView, string | undefined>>;

  @ViewRef({
    viewType: HtmlView,
    viewKey: "panel-subtitle",
    binds: true,
    get parentView(): HtmlView | null {
      return this.owner.header.insertView();
    },
    willAttachView(subtitleView: HtmlView): void {
      this.owner.callObservers("viewWillAttachHeaderSubtitle", subtitleView, this.owner);
    },
    didDetachView(subtitleView: HtmlView): void {
      this.owner.callObservers("viewDidDetachHeaderSubtitle", subtitleView, this.owner);
    },
    fromLike(value: HtmlView | LikeType<HtmlView> | string | undefined): HtmlView {
      if (value === void 0 || typeof value === "string") {
        let view = this.view;
        if (view === null) {
          view = this.createView();
        }
        view.text.setState(value);
        return view;
      }
      return super.fromLike(value);
    },
    createView(): HtmlView {
      return (super.createView() as HtmlView).setIntrinsic({
        classList: ["header-subtitle"],
        style: {
          alignSelf: "center",
          color: Look.legendColor,
        },
      });
    },
  })
  readonly headerSubtitle!: ViewRef<this, Like<HtmlView, string | undefined>>;

  @ViewSet({
    get viewType(): typeof PanelView {
      return PanelView;
    },
    binds: true,
    observes: true,
    initView(paneView: PanelView): void {
      paneView.style.setIntrinsic({
        position: "absolute",
        visibility: "hidden",
      });
    },
    willAttachView(paneView: PanelView, target: View | null): void {
      this.owner.callObservers("viewWillAttachPane", paneView, target, this.owner);
    },
    didDetachView(paneView: PanelView): void {
      this.owner.callObservers("viewDidDetachPane", paneView, this.owner);
    },
    viewDidSetUnitWidth(unitWidth: number, paneView: PanelView): void {
      this.owner.requireUpdate(View.NeedsResize);
    },
    viewDidSetUnitHeight(unitHeight: number, paneView: PanelView): void {
      this.owner.requireUpdate(View.NeedsResize);
    },
    viewDidSetMinPanelHeight(minPanelHeight: number, paneView: PanelView): void {
      this.owner.requireUpdate(View.NeedsResize);
    },
    viewDidSetPanelStyle(panelStyle: PanelStyle, paneView: PanelView): void {
      this.owner.requireUpdate(View.NeedsResize);
    },
  })
  readonly panes!: ViewSet<this, PanelView> & Observes<PanelView>;

  protected override onResize(): void {
    super.onResize();
    this.resizePanel();
  }

  protected resizePanel(): void {
    if (!this.paneLayout.derived) {
      const widthBasis = this.widthBasis.value;
      const heightBasis = this.heightBasis.value;
      const width = widthBasis !== void 0 ? widthBasis : this.style.width.pxValue();
      const height = heightBasis !== void 0 ? heightBasis : this.style.height.pxValue();
      let paneLayout: PaneLayout;
      if (width >= this.minFrameWidth.value && height >= this.minFrameHeight.value) {
        paneLayout = "frame";
      } else {
        paneLayout = "stack";
      }
      this.paneLayout.setIntrinsic(paneLayout);
    }

    if (this.panes.viewCount === 0) {
      const widthBasis = this.widthBasis.value;
      if (widthBasis !== void 0) {
        this.style.width.setIntrinsic(widthBasis);
      }
      const heightBasis = this.heightBasis.value;
      if (heightBasis !== void 0) {
        this.style.height.setIntrinsic(heightBasis);
      }
    }
  }

  protected override processChildren(processFlags: ViewFlags, processChild: (this: this, child: View, processFlags: ViewFlags) => void): void {
    if ((processFlags & View.NeedsResize) !== 0 && this.panes.viewCount !== 0) {
      this.paneLayout.recohere(this.updateTime);
      const paneLayout = this.paneLayout.value;
      if (paneLayout === "frame") {
        this.resizeFrameChildren(processFlags, processChild);
      } else {
        this.resizeStackChildren(processFlags, processChild);
      }
    } else {
      super.processChildren(processFlags, processChild);
    }
  }

  protected resizeFrameChildren(processFlags: ViewFlags, processChild: (this: this, child: View, processFlags: ViewFlags) => void): void {
    let x = this.style.paddingLeft.pxValue();
    let y = this.style.paddingTop.pxValue();
    const widthBasis = this.widthBasis.value;
    const heightBasis = this.heightBasis.value;
    const width = (widthBasis !== void 0 ? widthBasis : this.style.width.pxValue()) - x;
    const height = (heightBasis !== void 0 ? heightBasis : this.style.height.pxValue()) - y;
    const left = x;
    const epsilon = 0.01;
    let rowHeight = 0;
    let rightView: PanelView | null = null;

    type self = this;
    function resizeBlockChild(this: self, child: View, processFlags: ViewFlags): void {
      if (child instanceof PanelView) {
        if (rightView === null) { // allocate row
          let unitRowWidth = 0;
          let paneView: PanelView | null = child;
          while (paneView !== null) {
            const unitPanelWidth = paneView.unitWidth.value;
            if (rightView === null || unitRowWidth + unitPanelWidth < 1 + epsilon) {
              unitRowWidth += unitPanelWidth;
              rightView = paneView;
              paneView = paneView.getNextSibling(PanelView);
            } else {
              break;
            }
          }
        }

        const paneWidth = child.unitWidth.value * width;
        const paneHeight = Math.max(child.minPanelHeight.value, child.unitHeight.value * height);
        child.setIntrinsic({
          style: {
            left: x,
            top: y,
            visibility: void 0,
          },
          widthBasis: paneWidth - child.style.marginLeft.pxValue() - child.style.marginRight.pxValue(),
          heightBasis: paneHeight - child.style.marginTop.pxValue() - child.style.marginBottom.pxValue(),
        });
        x += paneWidth;
      }

      processChild.call(this, child, processFlags);

      if (child instanceof PanelView) {
        rowHeight = Math.max(rowHeight, child.style.marginTop.pxValue() + child.style.height.pxValue() + child.style.marginBottom.pxValue());
        if (child === rightView) { // begin new row
          x = left;
          y += rowHeight;
          rowHeight = 0;
          rightView = null;
        }
      }
    }
    super.processChildren(processFlags, resizeBlockChild);

    if (widthBasis !== void 0) {
      this.style.width.setIntrinsic(width);
    }
    if (heightBasis !== void 0) {
      this.style.height.setIntrinsic(y);
    }
  }

  protected resizeStackChildren(processFlags: ViewFlags, processChild: (this: this, child: View, processFlags: ViewFlags) => void): void {
    const x = this.style.paddingLeft.pxValue();
    let y = this.style.paddingTop.pxValue();
    const widthBasis = this.widthBasis.value;
    const heightBasis = this.heightBasis.value;
    const width = (widthBasis !== void 0 ? widthBasis : this.style.width.pxValue()) - x;
    const height = (heightBasis !== void 0 ? heightBasis : this.style.height.pxValue()) - y;

    type self = this;
    function resizeStackChild(this: self, child: View, processFlags: ViewFlags): void {
      if (child instanceof PanelView) {
        const paneHeight = Math.max(child.minPanelHeight.value, child.unitHeight.value * height);
        child.setIntrinsic({
          style: {
            left: x,
            top: y,
          },
          widthBasis: width - child.style.marginLeft.pxValue() - child.style.marginRight.pxValue(),
          heightBasis: paneHeight - child.style.marginTop.pxValue() - child.style.marginBottom.pxValue(),
        });
      }
      processChild.call(this, child, processFlags);
      if (child instanceof PanelView) {
        child.style.visibility.setIntrinsic(void 0);
        y += child.style.marginTop.pxValue() + child.style.height.pxValue() + child.style.marginBottom.pxValue();
      }
    }
    super.processChildren(processFlags, resizeStackChild);

    if (widthBasis !== void 0) {
      this.style.width.setIntrinsic(width);
    }
    if (heightBasis !== void 0) {
      this.style.height.setIntrinsic(y + this.style.paddingBottom.pxValue());
    }
  }

  protected onPanelScroll(event: Event): void {
    this.requireUpdate(View.NeedsScroll);
  }

  static override readonly InsertChildFlags: ViewFlags = View.InsertChildFlags | this.NeedsResize;
  static override readonly RemoveChildFlags: ViewFlags = View.RemoveChildFlags | this.NeedsResize;
}
