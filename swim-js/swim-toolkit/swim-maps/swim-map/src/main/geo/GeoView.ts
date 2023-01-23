// Copyright 2015-2023 Swim.inc
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

import type {Mutable, Class} from "@swim/util";
import {Property} from "@swim/component";
import {GeoBox, GeoProjection} from "@swim/geo";
import {AnyColor, Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {ViewFlags, View} from "@swim/view";
import {GraphicsViewInit, GraphicsView, PaintingContext, PaintingRenderer} from "@swim/graphics";
import {GeoViewport} from "./GeoViewport";
import type {GeoViewObserver} from "./GeoViewObserver";

/** @public */
export interface GeoViewInit extends GraphicsViewInit {
}

/** @public */
export class GeoView extends GraphicsView {
  constructor() {
    super();
    this.geoBounds = GeoBox.undefined();
  }

  override readonly observerType?: Class<GeoViewObserver>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true})
  readonly geoBoundsColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  protected override didInsertChild(child: View, target: View | null): void {
    if (child instanceof GeoView) {
      this.onInsertChildGeoBounds(child, child.geoBounds);
    }
    super.didInsertChild(child, target);
  }

  protected override didRemoveChild(child: View): void {
    if (child instanceof GeoView) {
      this.onRemoveChildGeoBounds(child, child.geoBounds);
    }
    super.didRemoveChild(child);
  }

  protected override willProcess(processFlags: ViewFlags): void {
    super.willProcess(processFlags);
    if ((processFlags & (View.NeedsChange | View.NeedsProject)) !== 0) {
      this.geoViewport.recohere(this.updateTime);
    }
  }

  protected override onRender(): void {
    super.onRender();
    const outlineColor = this.geoBoundsColor.value;
    if (outlineColor !== null) {
      this.renderGeoBounds(outlineColor, 1);
    }
  }

  protected renderGeoBounds(outlineColor: Color, outlineWidth: number): void {
    const renderer = this.renderer.value;
    if (renderer instanceof PaintingRenderer && !this.hidden && !this.culled && !this.unbounded) {
      this.renderGeoOutline(this.geoBounds, this.geoViewport.value, renderer.context, outlineColor, outlineWidth);
    }
  }

  protected renderGeoOutline(geoBox: GeoBox, geoProjection: GeoProjection, context: PaintingContext,
                             outlineColor: Color, outlineWidth: number): void {
    if (geoBox.isDefined()) {
      // save
      const contextLineWidth = context.lineWidth;
      const contextStrokeStyle = context.strokeStyle;

      const southWest = geoProjection.project(geoBox.southWest.normalized());
      const northWest = geoProjection.project(geoBox.northWest.normalized());
      const northEast = geoProjection.project(geoBox.northEast.normalized());
      const southEast = geoProjection.project(geoBox.southEast.normalized());
      context.beginPath();
      context.moveTo(southWest.x, southWest.y);
      context.lineTo(northWest.x, northWest.y);
      context.lineTo(northEast.x, northEast.y);
      context.lineTo(southEast.x, southEast.y);
      context.closePath();
      context.lineWidth = outlineWidth;
      context.strokeStyle = outlineColor.toString();
      context.stroke();

      // restore
      context.lineWidth = contextLineWidth;
      context.strokeStyle = contextStrokeStyle;
    }
  }

  protected override onHide(): void {
    super.onHide();
    const parent = this.parent;
    if (parent instanceof GeoView) {
      parent.onHideChild(this);
    }
  }

  protected override onUnhide(): void {
    super.onUnhide();
    const parent = this.parent;
    if (parent instanceof GeoView) {
      parent.onUnhideChild(this);
    }
  }

  protected override onSetUnbounded(unbounded: boolean): void {
    const parent = this.parent;
    if (parent instanceof GeoView) {
      parent.onSetChildUnbounded(this, unbounded);
    }
  }

  cullGeoFrame(geoFrame: GeoBox = this.geoFrame): void {
    this.setCulled(!geoFrame.intersects(this.geoBounds));
  }

  @Property<GeoView["geoViewport"]>({
    valueType: GeoViewport,
    inherits: true,
  })
  readonly geoViewport!: Property<this, GeoViewport>;

  /**
   * The map-specified geo-coordinate bounding box in which this view should layout
   * and render geometry.
   */
  get geoFrame(): GeoBox {
    const parent = this.parent;
    return parent instanceof GeoView ? parent.geoFrame : GeoBox.globe();
  }

  /**
   * The self-defined geo-coordinate bounding box surrounding all geometry this
   * view could possibly render. Views with geo bounds that don't overlap
   * their map frames may be culled from rendering and hit testing.
   */
  readonly geoBounds: GeoBox;

  protected setGeoBounds(newGeoBounds: GeoBox): void {
    const oldGeoBounds = this.geoBounds;
    if (!oldGeoBounds.equals(newGeoBounds)) {
      this.willSetGeoBounds(newGeoBounds, oldGeoBounds);
      (this as Mutable<this>).geoBounds = newGeoBounds;
      this.onSetGeoBounds(newGeoBounds, oldGeoBounds);
      this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
  }

  willSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetGeoBounds !== void 0) {
        observer.viewWillSetGeoBounds(newGeoBounds, oldGeoBounds, this);
      }
    }
  }

  protected onSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    if (!this.unbounded) {
      const parent = this.parent;
      if (parent instanceof GeoView) {
        parent.onSetChildGeoBounds(this, newGeoBounds, oldGeoBounds);
      }
    }
  }

  didSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetGeoBounds !== void 0) {
        observer.viewDidSetGeoBounds(newGeoBounds, oldGeoBounds, this);
      }
    }
  }

  protected updateGeoBounds(): void {
    this.setGeoBounds(this.deriveGeoBounds());
  }

  protected onInsertChildGeoBounds(child: GeoView, newGeoBounds: GeoBox): void {
    this.updateGeoBounds();
  }

  protected onRemoveChildGeoBounds(child: GeoView, oldGeoBounds: GeoBox): void {
    this.updateGeoBounds();
  }

  protected onSetChildGeoBounds(child: GeoView, newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    this.updateGeoBounds();
  }

  protected onHideChild(child: GeoView): void {
    this.updateGeoBounds();
  }

  protected onUnhideChild(child: GeoView): void {
    this.updateGeoBounds();
  }

  protected onSetChildUnbounded(child: GeoView, unbounded: boolean): void {
    this.updateGeoBounds();
  }

  get ownGeoBounds(): GeoBox | null {
    return null;
  }

  deriveGeoBounds(): GeoBox {
    let geoBounds = this.ownGeoBounds;
    let child = this.firstChild;
    while (child !== null) {
      if (child instanceof GeoView && !child.hidden && !child.unbounded) {
        const childGeoBounds = child.geoBounds;
        if (childGeoBounds.isDefined()) {
          if (geoBounds !== null) {
            geoBounds = geoBounds.union(childGeoBounds);
          } else {
            geoBounds = childGeoBounds;
          }
        }
      }
      child = child.nextSibling;
    }
    if (geoBounds === null) {
      geoBounds = this.geoFrame;
    }
    return geoBounds;
  }

  override init(init: GeoViewInit): void {
    super.init(init);
  }

  static override readonly MountFlags: ViewFlags = GraphicsView.MountFlags | View.NeedsProject;
  static override readonly UncullFlags: ViewFlags = GraphicsView.UncullFlags | View.NeedsProject;
}
