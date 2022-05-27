// Copyright 2015-2022 Swim.inc
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

import type {Class, Observes} from "@swim/util";
import {Affinity, FastenerClass, Property} from "@swim/component";
import {Look, Feel} from "@swim/theme";
import {ViewFlags, View, ViewRef, ViewSet} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {PanelViewObserver} from "./PanelViewObserver";

/** @public */
export type PaneLayout = "frame" | "stack";

/** @public */
export type PanelStyle = "card" | "none";

/** @public */
export class PanelView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initPanel();
    node.addEventListener("scroll", this.onPanelScroll.bind(this));
  }

  protected initPanel(): void {
    this.addClass("panel");
    this.position.setState("relative", Affinity.Intrinsic);
    this.boxSizing.setState("border-box", Affinity.Intrinsic);
    this.overflowX.setState("hidden", Affinity.Intrinsic);
    this.overflowY.setState("hidden", Affinity.Intrinsic);
    this.panelStyle.applyPanelStyle(this.panelStyle.value);
  }

  override readonly observerType?: Class<PanelViewObserver>;

  @Property({valueType: Number, updateFlags: View.NeedsResize})
  readonly widthBasis!: Property<this, number | undefined>;

  @Property({valueType: Number, updateFlags: View.NeedsResize})
  readonly heightBasis!: Property<this, number | undefined>;

  @Property<PanelView["unitWidth"]>({
    valueType: Number,
    value: 1,
    didSetValue(unitWidth: number): void {
      this.owner.callObservers("viewDidSetUnitWidth", unitWidth, this.owner);
    },
  })
  readonly unitWidth!: Property<this, number>;

  @Property<PanelView["unitHeight"]>({
    valueType: Number,
    value: 1,
    didSetValue(unitHeight: number): void {
      this.owner.callObservers("viewDidSetUnitHeight", unitHeight, this.owner);
    },
  })
  readonly unitHeight!: Property<this, number>;

  @Property<PanelView["minPanelHeight"]>({
    valueType: Number,
    value: 180,
    inherits: true,
    didSetValue(minPanelHeight: number): void {
      this.owner.callObservers("viewDidSetMinPanelHeight", minPanelHeight, this.owner);
    },
  })
  readonly minPanelHeight!: Property<this, number>;

  @Property<PanelView["panelStyle"]>({
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
        panelView.addClass("panel-card");
        panelView.marginTop.setState(6, Affinity.Intrinsic);
        panelView.marginRight.setState(6, Affinity.Intrinsic);
        panelView.marginBottom.setState(6, Affinity.Intrinsic);
        panelView.marginLeft.setState(6, Affinity.Intrinsic);
        panelView.borderTopLeftRadius.setState(4, Affinity.Intrinsic);
        panelView.borderTopRightRadius.setState(4, Affinity.Intrinsic);
        panelView.borderBottomLeftRadius.setState(4, Affinity.Intrinsic);
        panelView.borderBottomRightRadius.setState(4, Affinity.Intrinsic);
        panelView.backgroundColor.setLook(Look.backgroundColor, Affinity.Intrinsic);
        panelView.modifyTheme(Feel.default, [[Feel.raised, 1]]);
      } else {
        panelView.removeClass("panel-card");
        panelView.marginTop.setState(0, Affinity.Intrinsic);
        panelView.marginRight.setState(0, Affinity.Intrinsic);
        panelView.marginBottom.setState(0, Affinity.Intrinsic);
        panelView.marginLeft.setState(0, Affinity.Intrinsic);
        panelView.borderTopLeftRadius.setState(null, Affinity.Intrinsic);
        panelView.borderTopRightRadius.setState(null, Affinity.Intrinsic);
        panelView.borderBottomLeftRadius.setState(null, Affinity.Intrinsic);
        panelView.borderBottomRightRadius.setState(null, Affinity.Intrinsic);
        panelView.backgroundColor.setState(null, Affinity.Intrinsic);
        panelView.modifyTheme(Feel.default, [[Feel.raised, void 0]]);
      }
    },
  })
  readonly panelStyle!: Property<this, PanelStyle> & {
    applyPanelStyle(panelStyle: PanelStyle): void,
  };

  @Property<PanelView["paneLayout"]>({
    valueType: String,
    value: "frame",
    inherits: true,
    updateFlags: View.NeedsResize,
    didSetValue(paneLayout: PaneLayout): void {
      this.owner.callObservers("viewDidSetPaneLayout", paneLayout, this.owner);
    },
  })
  readonly paneLayout!: Property<this, PaneLayout | undefined>;

  @Property<PanelView["minFrameWidth"]>({
    valueType: Number,
    value: 720,
    inherits: true,
    updateFlags: View.NeedsResize,
  })
  readonly minFrameWidth!: Property<this, number>;

  @Property<PanelView["minFrameHeight"]>({
    valueType: Number,
    value: 540,
    inherits: true,
    updateFlags: View.NeedsResize,
  })
  readonly minFrameHeight!: Property<this, number>;

  @ViewRef<PanelView["header"]>({
    viewType: HtmlView,
    viewKey: true,
    binds: true,
    willAttachView(headerView: HtmlView): void {
      this.owner.callObservers("viewWillAttachHeader", headerView, this.owner);
    },
    didDetachView(headerView: HtmlView): void {
      this.owner.callObservers("viewDidDetachHeader", headerView, this.owner);
    },
    setTitle(title: string | undefined): HtmlView {
      return this.owner.headerTitle.setText(title);
    },
    setSubtitle(subtitle: string | undefined): HtmlView {
      return this.owner.headerSubtitle.setText(subtitle);
    },
    insertChild(parent: View, child: HtmlView, target: View | null, key: string | undefined): void {
      if (target !== null) {
        parent.insertChild(child, target, key);
      } else {
        parent.prependChild(child, key);
      }
    },
    createView(): HtmlView {
      const headerView = HtmlView.create();
      headerView.addClass("panel-header");
      headerView.display.setState("flex", Affinity.Intrinsic);
      headerView.justifyContent.setState("space-between", Affinity.Intrinsic);
      headerView.position.setState("absolute");
      headerView.left.setState(0, Affinity.Intrinsic);
      headerView.top.setState(0, Affinity.Intrinsic);
      headerView.width.setState("100%", Affinity.Intrinsic);
      headerView.height.setState(30, Affinity.Intrinsic);
      headerView.paddingLeft.setState(12, Affinity.Intrinsic);
      headerView.paddingRight.setState(12, Affinity.Intrinsic);
      headerView.boxSizing.setState("border-box", Affinity.Intrinsic);
      headerView.userSelect.setState("none", Affinity.Intrinsic);
      headerView.zIndex.setState(1, Affinity.Intrinsic);
      return headerView;
    }
  })
  readonly header!: ViewRef<this, HtmlView> & {
    setTitle(title: string | undefined): HtmlView,
    setSubtitle(subtitle: string | undefined): HtmlView,
  };
  static readonly header: FastenerClass<PanelView["header"]>;

  @ViewRef<PanelView["headerTitle"]>({
    viewType: HtmlView,
    viewKey: "panel-title",
    get parentView(): HtmlView | null {
      return this.owner.header.insertView();
    },
    willAttachView(titleView: HtmlView): void {
      this.owner.callObservers("viewWillAttachHeaderTitle", titleView, this.owner);
    },
    didDetachView(titleView: HtmlView): void {
      this.owner.callObservers("viewDidDetachHeaderTitle", titleView, this.owner);
    },
    setText(title: string | undefined): HtmlView {
      const titleView = this.insertView();
      titleView.text(title);
      return titleView;
    },
    insertChild(parent: View, child: HtmlView, target: View | null, key: string | undefined): void {
      if (target === null) {
        target = this.owner.headerSubtitle.view;
      }
      parent.insertChild(child, target, key);
    },
    createView(): HtmlView {
      const titleView = HtmlView.create();
      titleView.addClass("header-title");
      titleView.alignSelf.setState("center", Affinity.Intrinsic);
      titleView.color.setLook(Look.legendColor, Affinity.Intrinsic);
      return titleView;
    },
  })
  readonly headerTitle!: ViewRef<this, HtmlView> & {
    setText(tite: string | undefined): HtmlView,
  };
  static readonly headerTitle: FastenerClass<PanelView["headerTitle"]>;

  @ViewRef<PanelView["headerSubtitle"]>({
    viewType: HtmlView,
    viewKey: "panel-subtitle",
    get parentView(): HtmlView | null {
      return this.owner.header.insertView();
    },
    willAttachView(subtitleView: HtmlView): void {
      this.owner.callObservers("viewWillAttachHeaderSubtitle", subtitleView, this.owner);
    },
    didDetachView(subtitleView: HtmlView): void {
      this.owner.callObservers("viewDidDetachHeaderSubtitle", subtitleView, this.owner);
    },
    setText(title: string | undefined): HtmlView {
      const subtitleView = this.insertView();
      subtitleView.text(title);
      return subtitleView;
    },
    createView(): HtmlView {
      const subtitleView = HtmlView.create();
      subtitleView.addClass("header-subtitle");
      subtitleView.alignSelf.setState("center", Affinity.Intrinsic);
      subtitleView.color.setLook(Look.legendColor, Affinity.Intrinsic);
      return subtitleView;
    },
  })
  readonly headerSubtitle!: ViewRef<this, HtmlView> & {
    setText(subtitle: string | undefined): HtmlView,
  };
  static readonly headerSubtitle: FastenerClass<PanelView["headerSubtitle"]>;

  @ViewSet<PanelView["panes"]>({
    viewType: PanelView,
    binds: true,
    observes: true,
    initView(paneView: PanelView): void {
      paneView.position.setState("absolute", Affinity.Intrinsic);
      paneView.visibility.setState("hidden", Affinity.Intrinsic);
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
  static readonly panes: FastenerClass<PanelView["panes"]>;

  protected override onResize(): void {
    super.onResize();
    this.resizePanel();
  }

  protected resizePanel(): void {
    if (!this.paneLayout.derived) {
      const widthBasis = this.widthBasis.value;
      const heightBasis = this.heightBasis.value;
      const width = widthBasis !== void 0 ? widthBasis : this.width.pxValue();
      const height = heightBasis !== void 0 ? heightBasis : this.height.pxValue();
      let paneLayout: PaneLayout;
      if (width >= this.minFrameWidth.value && height >= this.minFrameHeight.value) {
        paneLayout = "frame";
      } else {
        paneLayout = "stack";
      }
      this.paneLayout.setValue(paneLayout, Affinity.Intrinsic);
    }

    if (this.panes.viewCount === 0) {
      const widthBasis = this.widthBasis.value;
      if (widthBasis !== void 0) {
        this.width.setState(widthBasis, Affinity.Intrinsic);
      }
      const heightBasis = this.heightBasis.value;
      if (heightBasis !== void 0) {
        this.height.setState(heightBasis, Affinity.Intrinsic);
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
    let x = this.paddingLeft.pxValue();
    let y = this.paddingTop.pxValue();
    const widthBasis = this.widthBasis.value;
    const heightBasis = this.heightBasis.value;
    const width = (widthBasis !== void 0 ? widthBasis : this.width.pxValue()) - x;
    const height = (heightBasis !== void 0 ? heightBasis : this.height.pxValue()) - y;
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
        child.left.setState(x, Affinity.Intrinsic);
        child.top.setState(y, Affinity.Intrinsic);
        child.widthBasis.setValue(paneWidth - child.marginLeft.pxValue() - child.marginRight.pxValue(), Affinity.Intrinsic);
        child.heightBasis.setValue(paneHeight - child.marginTop.pxValue() - child.marginBottom.pxValue(), Affinity.Intrinsic);
        child.visibility.setState(void 0, Affinity.Intrinsic);
        x += paneWidth;
      }

      processChild.call(this, child, processFlags);

      if (child instanceof PanelView) {
        rowHeight = Math.max(rowHeight, child.marginTop.pxValue() + child.height.pxValue() + child.marginBottom.pxValue());
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
      this.width.setState(width, Affinity.Intrinsic);
    }
    if (heightBasis !== void 0) {
      this.height.setState(y, Affinity.Intrinsic);
    }
  }

  protected resizeStackChildren(processFlags: ViewFlags, processChild: (this: this, child: View, processFlags: ViewFlags) => void): void {
    const x = this.paddingLeft.pxValue();
    let y = this.paddingTop.pxValue();
    const widthBasis = this.widthBasis.value;
    const heightBasis = this.heightBasis.value;
    const width = (widthBasis !== void 0 ? widthBasis : this.width.pxValue()) - x;
    const height = (heightBasis !== void 0 ? heightBasis : this.height.pxValue()) - y;

    type self = this;
    function resizeStackChild(this: self, child: View, processFlags: ViewFlags): void {
      if (child instanceof PanelView) {
        const paneHeight = Math.max(child.minPanelHeight.value, child.unitHeight.value * height);
        child.left.setState(x, Affinity.Intrinsic);
        child.top.setState(y, Affinity.Intrinsic);
        child.widthBasis.setValue(width - child.marginLeft.pxValue() - child.marginRight.pxValue(), Affinity.Intrinsic);
        child.heightBasis.setValue(paneHeight - child.marginTop.pxValue() - child.marginBottom.pxValue(), Affinity.Intrinsic);
      }
      processChild.call(this, child, processFlags);
      if (child instanceof PanelView) {
        child.visibility.setState(void 0, Affinity.Intrinsic);
        y += child.marginTop.pxValue() + child.height.pxValue() + child.marginBottom.pxValue();
      }
    }
    super.processChildren(processFlags, resizeStackChild);

    if (widthBasis !== void 0) {
      this.width.setState(width, Affinity.Intrinsic);
    }
    if (heightBasis !== void 0) {
      this.height.setState(y + this.paddingBottom.pxValue(), Affinity.Intrinsic);
    }
  }

  protected onPanelScroll(event: Event): void {
    this.requireUpdate(View.NeedsScroll);
  }
}
