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
import {AnyLength, Length, AnyPointR2, PointR2, SegmentR2, BoxR2} from "@swim/math";
import {AnyGeoPoint, GeoPoint} from "@swim/geo";
import {AnyColor, Color} from "@swim/style";
import type {MoodVector, ThemeMatrix} from "@swim/theme";
import {ViewContextType, ViewFlags, View, ViewAnimator} from "@swim/view";
import {
  Graphics,
  GraphicsView,
  Icon,
  FilledIcon,
  IconViewInit,
  IconView,
  IconViewAnimator,
  CanvasRenderer,
} from "@swim/graphics";
import type {GeoViewInit} from "../geo/GeoView";
import type {GeoViewController} from "../geo/GeoViewController";
import {GeoLayerView} from "../layer/GeoLayerView";
import type {GeoIconViewObserver} from "./GeoIconViewObserver";

export type AnyGeoIconView = GeoIconView | GeoIconViewInit;

export interface GeoIconViewInit extends GeoViewInit, IconViewInit {
  viewController?: GeoViewController;
  geoCenter?: AnyGeoPoint;
  viewCenter?: AnyPointR2;
}

export class GeoIconView extends GeoLayerView implements IconView {
  constructor() {
    super();
    Object.defineProperty(this, "canvas", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "iconBounds", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  initView(init: GeoIconViewInit): void {
    super.initView(init);
    IconView.initView(this, init);
    if (init.geoCenter !== void 0) {
      this.geoCenter(init.geoCenter);
    }
    if (init.viewCenter !== void 0) {
      this.viewCenter(init.viewCenter);
    }
  }

  declare readonly viewController: GeoViewController<GeoIconView> & GeoIconViewObserver | null;

  declare readonly viewObservers: ReadonlyArray<GeoIconViewObserver>;

  /** @hidden */
  declare readonly canvas: HTMLCanvasElement | null;

  protected willSetGeoCenter(newGeoCenter: GeoPoint, oldGeoCenter: GeoPoint): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetGeoCenter !== void 0) {
      viewController.viewWillSetGeoCenter(newGeoCenter, oldGeoCenter, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetGeoCenter !== void 0) {
        viewObserver.viewWillSetGeoCenter(newGeoCenter, oldGeoCenter, this);
      }
    }
  }

  protected onSetGeoCenter(newGeoCenter: GeoPoint, oldGeoCenter: GeoPoint): void {
    this.setGeoBounds(newGeoCenter.bounds);
    if (this.isMounted()) {
      this.projectIcon(this.viewContext as ViewContextType<this>);
    }
  }

  protected didSetGeoCenter(newGeoCenter: GeoPoint, oldGeoCenter: GeoPoint): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetGeoCenter !== void 0) {
        viewObserver.viewDidSetGeoCenter(newGeoCenter, oldGeoCenter, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetGeoCenter !== void 0) {
      viewController.viewDidSetGeoCenter(newGeoCenter, oldGeoCenter, this);
    }
  }

  @ViewAnimator<GeoIconView, GeoPoint, AnyGeoPoint>({
    type: GeoPoint,
    state: GeoPoint.origin(),
    didSetState(newGeoCenter: GeoPoint, oldGeoCemter: GeoPoint): void {
      this.owner.projectGeoCenter(newGeoCenter);
    },
    willSetValue(newGeoCenter: GeoPoint, oldGeoCemter: GeoPoint): void {
      this.owner.willSetGeoCenter(newGeoCenter, oldGeoCemter);
    },
    didSetValue(newGeoCenter: GeoPoint, oldGeoCemter: GeoPoint): void {
      this.owner.onSetGeoCenter(newGeoCenter, oldGeoCemter);
      this.owner.didSetGeoCenter(newGeoCenter, oldGeoCemter);
    },
  })
  declare geoCenter: ViewAnimator<this, GeoPoint, AnyGeoPoint>;

  protected onSetViewCenter(newViewCenter: PointR2, oldViewCenter: PointR2): void {
    Object.defineProperty(this, "iconBounds", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  @ViewAnimator<GeoIconView, PointR2, AnyPointR2>({
    type: PointR2,
    state: PointR2.origin(),
    didSetValue(newViewCenter: PointR2, oldViewCenter: PointR2): void {
      this.owner.onSetViewCenter(newViewCenter, oldViewCenter);
    },
  })
  declare viewCenter: ViewAnimator<this, PointR2, AnyPointR2>;

  @ViewAnimator({type: Number, state: 0.5, updateFlags: View.NeedsLayout | View.NeedsRender | View.NeedsComposite})
  declare xAlign: ViewAnimator<this, number>;

  @ViewAnimator({type: Number, state: 0.5, updateFlags: View.NeedsLayout | View.NeedsRender | View.NeedsComposite})
  declare yAlign: ViewAnimator<this, number>;

  @ViewAnimator({type: Length, state: null, updateFlags: View.NeedsLayout | View.NeedsRender | View.NeedsComposite})
  declare iconWidth: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewAnimator({type: Length, state: null, updateFlags: View.NeedsLayout | View.NeedsRender | View.NeedsComposite})
  declare iconHeight: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewAnimator({type: Color, state: null, updateFlags: View.NeedsRender | View.NeedsComposite})
  declare iconColor: ViewAnimator<this, Color | null, AnyColor | null>;

  protected willSetGraphics(newGraphics: Graphics | null, oldGraphic: Graphics | null): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetGraphics !== void 0) {
      viewController.viewWillSetGraphics(newGraphics, oldGraphic, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetGraphics !== void 0) {
        viewObserver.viewWillSetGraphics(newGraphics, oldGraphic, this);
      }
    }
  }

  protected onSetGraphics(newGraphics: Graphics | null, oldGraphic: Graphics | null): void {
    this.requireUpdate(View.NeedsRender | View.NeedsComposite);
  }

  protected didSetGraphics(newGraphics: Graphics | null, oldGraphic: Graphics | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetGraphics !== void 0) {
        viewObserver.viewDidSetGraphics(newGraphics, oldGraphic, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetGraphics !== void 0) {
      viewController.viewDidSetGraphics(newGraphics, oldGraphic, this);
    }
  }

  @ViewAnimator<GeoIconView, Graphics | null>({
    extends: IconViewAnimator,
    type: Object,
    willSetValue(newGraphics: Graphics | null, oldGraphics: Graphics | null): void {
      this.owner.willSetGraphics(newGraphics, oldGraphics);
    },
    didSetValue(newGraphics: Graphics | null, oldGraphics: Graphics | null): void {
      this.owner.onSetGraphics(newGraphics, oldGraphics);
      this.owner.didSetGraphics(newGraphics, oldGraphics);
    },
  })
  declare graphics: ViewAnimator<this, Graphics | null>;

  protected onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    if (!this.graphics.isInherited()) {
      const oldGraphics = this.graphics.value;
      if (oldGraphics instanceof Icon) {
        const newGraphics = oldGraphics.withTheme(theme, mood);
        this.graphics.setOwnState(newGraphics, oldGraphics.isThemed() ? timing : false);
      }
    }
  }

  protected onAnimate(viewContext: ViewContextType<this>): void {
    super.onAnimate(viewContext);
    const iconColor = this.iconColor.takeUpdatedValue();
    if (iconColor !== void 0 && iconColor !== null) {
      const oldGraphics = this.graphics.value;
      if (oldGraphics instanceof FilledIcon) {
        const newGraphics = oldGraphics.withFillColor(iconColor);
        this.graphics.setOwnState(newGraphics);
      }
    }
  }

  protected onProject(viewContext: ViewContextType<this>): void {
    super.onProject(viewContext);
    this.projectIcon(viewContext);
  }

  protected projectGeoCenter(geoCenter: GeoPoint): void {
    if (this.isMounted()) {
      const viewContext = this.viewContext as ViewContextType<this>;
      const viewCenter = viewContext.geoViewport.project(geoCenter);
      this.viewCenter.setIntermediateValue(this.viewCenter.value, viewCenter);
      this.projectIcon(viewContext);
    }
  }

  protected projectIcon(viewContext: ViewContextType<this>): void {
    if (this.viewCenter.takesPrecedence(View.Intrinsic)) {
      this.viewCenter.setValue(viewContext.geoViewport.project(this.geoCenter.getValue()));
    }
    const viewFrame = this.viewFrame;
    const p0 = this.viewCenter.getValue();
    const p1 = this.viewCenter.getState();
    if (viewFrame.intersectsBox(this.viewBounds) ||
        viewFrame.intersectsSegment(new SegmentR2(p0.x, p0.y, p1.x, p1.y))) {
      this.setCulled(false);
    } else {
      this.setCulled(true);
    }
  }

  needsDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((this.viewFlags & View.NeedsLayout) === 0) {
      displayFlags &= ~View.NeedsLayout;
    }
    if ((this.viewFlags & View.NeedsRender) === 0) {
      displayFlags &= ~View.NeedsRender;
    }
    return displayFlags;
  }

  protected onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    Object.defineProperty(this, "iconBounds", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  protected onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      this.renderIcon(renderer, this.viewBounds);
    }
  }

  protected renderIcon(renderer: CanvasRenderer, frame: BoxR2): void {
    const graphics = this.graphics.value;
    if (graphics !== null) {
      let canvas = this.canvas;
      if (canvas === null) {
        canvas = document.createElement("canvas");
        Object.defineProperty(this, "canvas", {
          value: canvas,
          enumerable: true,
          configurable: true,
        });
      }
      const pixelRatio = renderer.pixelRatio;
      const width = frame.width;
      const height = frame.height;

      const iconContext = canvas.getContext("2d")!;
      if (canvas.width !== pixelRatio * width || canvas.height !== pixelRatio * height) {
        canvas.width = pixelRatio * width;
        canvas.height = pixelRatio * height;
        iconContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      }
      iconContext.clearRect(0, 0, width, height);

      iconContext.beginPath();
      const iconRenderer = new CanvasRenderer(iconContext, pixelRatio, this.theme.state, this.mood.state);
      const iconFrame = new BoxR2(0, 0, width, height);
      graphics.render(iconRenderer, iconFrame);
    } else {
      Object.defineProperty(this, "canvas", {
        value: null,
        enumerable: true,
        configurable: true,
      });
    }
  }

  protected onComposite(viewContext: ViewContextType<this>): void {
    super.onComposite(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      this.compositeIcon(renderer, this.viewBounds);
    }
  }

  protected compositeIcon(renderer: CanvasRenderer, frame: BoxR2): void {
    const canvas = this.canvas;
    if (canvas !== null) {
      renderer.context.drawImage(canvas, frame.x, frame.y, frame.width, frame.height);
    }
  }

  protected updateGeoBounds(): void {
    // nop
  }

  get popoverFrame(): BoxR2 {
    const frame = this.viewFrame;
    const viewSize = Math.min(frame.width, frame.height);
    const inversePageTransform = this.pageTransform.inverse();
    const viewCenter = this.viewCenter.getValue();
    const px = inversePageTransform.transformX(viewCenter.x, viewCenter.y);
    const py = inversePageTransform.transformY(viewCenter.x, viewCenter.y);
    let iconWidth: Length | number | null = this.iconWidth.value;
    iconWidth = iconWidth instanceof Length ? iconWidth.pxValue(viewSize) : viewSize;
    let iconHeight: Length | number | null = this.iconHeight.value;
    iconHeight = iconHeight instanceof Length ? iconHeight.pxValue(viewSize) : viewSize;
    const x = px - iconWidth * this.xAlign.getValue();
    const y = py - iconHeight * this.yAlign.getValue();
    return new BoxR2(x, y, x + iconWidth, y + iconHeight);
  }

  /** @hidden */
  declare readonly iconBounds: BoxR2 | null;

  get viewBounds(): BoxR2 {
    let iconBounds = this.iconBounds;
    if (iconBounds === null) {
      const frame = this.viewFrame;
      const viewSize = Math.min(frame.width, frame.height);
      const viewCenter = this.viewCenter.getValue();
      let iconWidthValue: Length | number | null = this.iconWidth.value;
      iconWidthValue = iconWidthValue instanceof Length ? iconWidthValue.pxValue(viewSize) : viewSize;
      let iconWidthState: Length | number | null = this.iconWidth.state;
      iconWidthState = iconWidthState instanceof Length ? iconWidthState.pxValue(viewSize) : viewSize;
      const iconWidth = Math.max(iconWidthValue, iconWidthState);
      let iconHeightValue: Length | number | null = this.iconHeight.value;
      iconHeightValue = iconHeightValue instanceof Length ? iconHeightValue.pxValue(viewSize) : viewSize;
      let iconHeightState: Length | number | null = this.iconHeight.state;
      iconHeightState = iconHeightState instanceof Length ? iconHeightState.pxValue(viewSize) : viewSize;
      const iconHeight = Math.max(iconHeightValue, iconHeightState);
      const x = viewCenter.x - iconWidth * this.xAlign.getValue();
      const y = viewCenter.y - iconHeight * this.yAlign.getValue();
      iconBounds = new BoxR2(x, y, x + iconWidth, y + iconHeight);
      Object.defineProperty(this, "iconBounds", {
        value: iconBounds,
        enumerable: true,
        configurable: true,
      });
    }
    return iconBounds;
  }

  protected doHitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    let hit = super.doHitTest(x, y, viewContext);
    if (hit === null) {
      const renderer = viewContext.renderer;
      if (renderer instanceof CanvasRenderer) {
        const context = renderer.context;
        context.save();
        hit = this.hitTestIcon(x, y, renderer, this.viewBounds);
        context.restore();
      }
    }
    return hit;
  }

  protected hitTestIcon(x: number, y: number, renderer: CanvasRenderer, frame: BoxR2): GraphicsView | null {
    // TODO: icon hit test mode
    if (this.hitBounds.contains(x, y)) {
      return this;
    }
    //const graphics = this.graphics.value;
    //if (graphics !== null) {
    //  const context = renderer.context;
    //  graphics.render(renderer, frame);
    //  if (context.isPointInPath(x * renderer.pixelRatio, y * renderer.pixelRatio)) {
    //    return this;
    //  }
    //}
    return null;
  }

  static create(): GeoIconView {
    return new GeoIconView();
  }

  static fromInit(init: GeoIconViewInit): GeoIconView {
    const view = new GeoIconView();
    view.initView(init);
    return view;
  }

  static fromAny(value: AnyGeoIconView): GeoIconView {
    if (value instanceof GeoIconView) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
