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

import type {Mutable, Class, Timing} from "@swim/util";
import {Affinity} from "@swim/fastener";
import {AnyLength, Length, AnyR2Point, R2Point, R2Segment, R2Box} from "@swim/math";
import {AnyGeoPoint, GeoPoint, GeoBox} from "@swim/geo";
import {AnyColor, Color} from "@swim/style";
import {MoodVector, ThemeMatrix, ThemeAnimator} from "@swim/theme";
import {ViewContextType, ViewFlags, View} from "@swim/view";
import {
  Sprite,
  Graphics,
  GraphicsView,
  Icon,
  FilledIcon,
  IconViewInit,
  IconView,
  IconGraphicsAnimator,
  CanvasRenderer,
} from "@swim/graphics";
import type {GeoViewInit} from "../geo/GeoView";
import {GeoLayerView} from "../layer/GeoLayerView";
import {GeoRippleOptions, GeoRippleView} from "../effect/GeoRippleView";
import type {GeoIconViewObserver} from "./GeoIconViewObserver";

export type AnyGeoIconView = GeoIconView | GeoIconViewInit;

export interface GeoIconViewInit extends GeoViewInit, IconViewInit {
  geoCenter?: AnyGeoPoint;
  viewCenter?: AnyR2Point;
}

export class GeoIconView extends GeoLayerView implements IconView {
  constructor() {
    super();
    this.sprite = null;
    Object.defineProperty(this, "viewBounds", {
      value: R2Box.undefined(),
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly observerType?: Class<GeoIconViewObserver>;

  /** @internal */
  sprite: Sprite | null;

  protected willSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetGeoCenter !== void 0) {
        observer.viewWillSetGeoCenter(newGeoCenter, oldGeoCenter, this);
      }
    }
  }

  protected onSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
    this.setGeoBounds(newGeoCenter !== null ? newGeoCenter.bounds : GeoBox.undefined());
    if (this.mounted) {
      this.projectIcon(this.viewContext as ViewContextType<this>);
    }
  }

  protected didSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetGeoCenter !== void 0) {
        observer.viewDidSetGeoCenter(newGeoCenter, oldGeoCenter, this);
      }
    }
  }

  @ThemeAnimator<GeoIconView, GeoPoint | null, AnyGeoPoint | null>({
    type: GeoPoint,
    state: null,
    didSetState(newGeoCenter: GeoPoint | null, oldGeoCemter: GeoPoint | null): void {
      this.owner.projectGeoCenter(newGeoCenter);
    },
    willSetValue(newGeoCenter: GeoPoint | null, oldGeoCemter: GeoPoint | null): void {
      this.owner.willSetGeoCenter(newGeoCenter, oldGeoCemter);
    },
    didSetValue(newGeoCenter: GeoPoint | null, oldGeoCemter: GeoPoint | null): void {
      this.owner.onSetGeoCenter(newGeoCenter, oldGeoCemter);
      this.owner.didSetGeoCenter(newGeoCenter, oldGeoCemter);
    },
  })
  readonly geoCenter!: ThemeAnimator<this, GeoPoint | null, AnyGeoPoint | null>;

  @ThemeAnimator<GeoIconView, R2Point | null, AnyR2Point | null>({
    type: R2Point,
    state: R2Point.undefined(),
    updateFlags: View.NeedsComposite,
  })
  readonly viewCenter!: ThemeAnimator<this, R2Point | null, AnyR2Point | null>;

  @ThemeAnimator<GeoIconView, number>({
    type: Number,
    state: 0.5,
    updateFlags: View.NeedsRender | View.NeedsRasterize | View.NeedsComposite,
  })
  readonly xAlign!: ThemeAnimator<this, number>;

  @ThemeAnimator<GeoIconView, number>({
    type: Number,
    state: 0.5,
    updateFlags: View.NeedsRender | View.NeedsRasterize | View.NeedsComposite,
  })
  readonly yAlign!: ThemeAnimator<this, number>;

  @ThemeAnimator<GeoIconView, Length | null, AnyLength | null>({
    type: Length,
    state: null,
    updateFlags: View.NeedsRender | View.NeedsRasterize | View.NeedsComposite,
  })
  readonly iconWidth!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator<GeoIconView, Length | null, AnyLength | null>({
    type: Length,
    state: null,
    updateFlags: View.NeedsRender | View.NeedsRasterize | View.NeedsComposite,
  })
  readonly iconHeight!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator<GeoIconView, Color | null, AnyColor | null>({
    type: Color,
    state: null,
    updateFlags: View.NeedsRender | View.NeedsRasterize | View.NeedsComposite,
    didSetValue(newIconColor: Color | null, oldIconColor: Color | null): void {
      if (newIconColor !== null) {
        const oldGraphics = this.owner.graphics.value;
        if (oldGraphics instanceof FilledIcon) {
          const newGraphics = oldGraphics.withFillColor(newIconColor);
          this.owner.graphics.setState(newGraphics, Affinity.Reflexive);
        }
      }
    },
  })
  readonly iconColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  protected willSetGraphics(newGraphics: Graphics | null, oldGraphic: Graphics | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetGraphics !== void 0) {
        observer.viewWillSetGraphics(newGraphics, oldGraphic, this);
      }
    }
  }

  protected onSetGraphics(newGraphics: Graphics | null, oldGraphic: Graphics | null): void {
    this.requireUpdate(View.NeedsRender | View.NeedsRasterize | View.NeedsComposite);
  }

  protected didSetGraphics(newGraphics: Graphics | null, oldGraphic: Graphics | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetGraphics !== void 0) {
        observer.viewDidSetGraphics(newGraphics, oldGraphic, this);
      }
    }
  }

  @ThemeAnimator<GeoIconView, Graphics | null>({
    extends: IconGraphicsAnimator,
    type: Object,
    willSetValue(newGraphics: Graphics | null, oldGraphics: Graphics | null): void {
      this.owner.willSetGraphics(newGraphics, oldGraphics);
    },
    didSetValue(newGraphics: Graphics | null, oldGraphics: Graphics | null): void {
      this.owner.onSetGraphics(newGraphics, oldGraphics);
      this.owner.didSetGraphics(newGraphics, oldGraphics);
    },
  })
  readonly graphics!: ThemeAnimator<this, Graphics | null>;

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    if (!this.graphics.inherited) {
      const oldGraphics = this.graphics.value;
      if (oldGraphics instanceof Icon) {
        const newGraphics = oldGraphics.withTheme(theme, mood);
        this.graphics.setState(newGraphics, oldGraphics.isThemed() ? timing : false, Affinity.Reflexive);
      }
    }
  }

  protected override onProject(viewContext: ViewContextType<this>): void {
    super.onProject(viewContext);
    this.projectIcon(viewContext);
  }

  protected projectGeoCenter(geoCenter: GeoPoint | null): void {
    if (this.mounted) {
      const viewContext = this.viewContext as ViewContextType<this>;
      const viewCenter = geoCenter !== null && geoCenter.isDefined()
                       ? viewContext.geoViewport.project(geoCenter)
                       : null;
      this.viewCenter.setInterpolatedValue(this.viewCenter.value, viewCenter);
      this.projectIcon(viewContext);
    }
  }

  protected projectIcon(viewContext: ViewContextType<this>): void {
    if (this.viewCenter.hasAffinity(Affinity.Intrinsic)) {
      const geoCenter = this.geoCenter.value;
      const viewCenter = geoCenter !== null && geoCenter.isDefined()
                       ? viewContext.geoViewport.project(geoCenter)
                       : null;
      //this.viewCenter.setValue(viewCenter);
      (this.viewCenter as Mutable<typeof this.viewCenter>).value = viewCenter;
    }
    (this as Mutable<GeoIconView>).viewBounds = this.deriveViewBounds();
    const viewFrame = this.viewFrame;
    const p0 = this.viewCenter.value;
    const p1 = this.viewCenter.state;
    if (p0 !== null && p1 !== null && (
        viewFrame.intersectsBox(this.viewBounds) ||
        viewFrame.intersectsSegment(new R2Segment(p0.x, p0.y, p1.x, p1.y)))) {
      this.setCulled(false);
    } else {
      this.setCulled(true);
    }
  }

  protected override onRasterize(viewContext: ViewContextType<this>): void {
    super.onRasterize(viewContext);
    if (!this.isHidden() && !this.culled) {
      this.rasterizeIcon(this.viewBounds);
    }
  }

  protected rasterizeIcon(frame: R2Box): void {
    let sprite = this.sprite;
    const graphics = this.graphics.value;
    if (graphics !== null && frame.isDefined()) {
      const width = frame.width;
      const height = frame.height;
      if (sprite !== null && (width < sprite.width || height < sprite.height)) {
        this.sprite = null;
        sprite.release();
        sprite = null;
      }
      if (sprite === null) {
        sprite = this.spriteProvider.service!.acquireSprite(width, height);
        this.sprite = sprite;
      }

      const renderer = sprite.getRenderer();
      const context = renderer.context;
      context.clearRect(0, 0, sprite.width, sprite.height);

      context.beginPath();
      graphics.render(renderer, new R2Box(0, 0, width, height));
    } else if (sprite !== null) {
      this.sprite = null;
      sprite.release();
    }
  }

  protected override onComposite(viewContext: ViewContextType<this>): void {
    super.onComposite(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.culled) {
      this.compositeIcon(renderer, this.viewBounds);
    }
  }

  protected compositeIcon(renderer: CanvasRenderer, frame: R2Box): void {
    const sprite = this.sprite;
    if (sprite !== null) {
      sprite.draw(renderer.context, frame);
    }
  }

  protected override renderGeoBounds(viewContext: ViewContextType<this>, outlineColor: Color, outlineWidth: number): void {
    // nop
  }

  protected override updateGeoBounds(): void {
    // nop
  }

  override readonly viewBounds!: R2Box;

  override deriveViewBounds(): R2Box {
    const viewCenter = this.viewCenter.value;
    if (viewCenter !== null && viewCenter.isDefined()) {
      const viewFrame = this.viewFrame;
      const viewSize = Math.min(viewFrame.width, viewFrame.height);
      let iconWidth: Length | number | null = this.iconWidth.value;
      iconWidth = iconWidth instanceof Length ? iconWidth.pxValue(viewSize) : viewSize;
      let iconHeight: Length | number | null = this.iconHeight.value;
      iconHeight = iconHeight instanceof Length ? iconHeight.pxValue(viewSize) : viewSize;
      const x = viewCenter.x - iconWidth * this.xAlign.value;
      const y = viewCenter.y - iconHeight * this.yAlign.value;
      return new R2Box(x, y, x + iconWidth, y + iconHeight);
    } else {
      return R2Box.undefined();
    }
  }

  override get popoverFrame(): R2Box {
    const viewCenter = this.viewCenter.value;
    const viewFrame = this.viewFrame;
    if (viewCenter !== null && viewCenter.isDefined()) {
      const viewSize = Math.min(viewFrame.width, viewFrame.height);
      const inversePageTransform = this.pageTransform.inverse();
      const px = inversePageTransform.transformX(viewCenter.x, viewCenter.y);
      const py = inversePageTransform.transformY(viewCenter.x, viewCenter.y);
      let iconWidth: Length | number | null = this.iconWidth.value;
      iconWidth = iconWidth instanceof Length ? iconWidth.pxValue(viewSize) : viewSize;
      let iconHeight: Length | number | null = this.iconHeight.value;
      iconHeight = iconHeight instanceof Length ? iconHeight.pxValue(viewSize) : viewSize;
      const x = px - iconWidth * this.xAlign.getValue();
      const y = py - iconHeight * this.yAlign.getValue();
      return new R2Box(x, y, x + iconWidth, y + iconHeight);
    } else {
      return this.pageBounds;
    }
  }

  protected override hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      return this.hitTestIcon(x, y, renderer, this.viewBounds);
    }
    return null;
  }

  protected hitTestIcon(x: number, y: number, renderer: CanvasRenderer, frame: R2Box): GraphicsView | null {
    // TODO: icon hit test mode
    if (this.hitBounds.contains(x, y)) {
      return this;
    }
    //const graphics = this.graphics.value;
    //if (graphics !== null) {
    //  const context = renderer.context;
    //  context.beginPath();
    //  graphics.render(renderer, frame);
    //  if (context.isPointInPath(x * renderer.pixelRatio, y * renderer.pixelRatio)) {
    //    return this;
    //  }
    //}
    return null;
  }

  ripple(options?: GeoRippleOptions): GeoRippleView | null {
    return GeoRippleView.ripple(this, options);
  }

  protected override onUnmount(): void {
    super.onUnmount();
    const sprite = this.sprite;
    if (sprite !== null) {
      this.sprite = null;
      sprite.release();
    }
  }

  override init(init: GeoIconViewInit): void {
    super.init(init);
    IconView.init(this, init);
    if (init.geoCenter !== void 0) {
      this.geoCenter(init.geoCenter);
    }
    if (init.viewCenter !== void 0) {
      this.viewCenter(init.viewCenter);
    }
  }

  static override readonly MountFlags: ViewFlags = GeoLayerView.MountFlags | View.NeedsRasterize;
  static override readonly UncullFlags: ViewFlags = GeoLayerView.UncullFlags | View.NeedsRasterize;
}
