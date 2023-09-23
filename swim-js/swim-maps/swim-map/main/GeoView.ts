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

import type {Mutable} from "@swim/util";
import type {Class} from "@swim/util";
import {Property} from "@swim/component";
import {GeoBox} from "@swim/geo";
import {Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import type {GraphicsViewObserver} from "@swim/graphics";
import {GraphicsView} from "@swim/graphics";
import type {PaintingContext} from "@swim/graphics";
import {PaintingRenderer} from "@swim/graphics";
import {GeoViewport} from "./GeoViewport";

/** @public */
export interface GeoViewObserver<V extends GeoView = GeoView> extends GraphicsViewObserver<V> {
  viewWillSetGeoBounds?(newGeoBounds: GeoBox, oldGeoBounds: GeoBox, view: V): void;

  viewDidSetGeoBounds?(newGeoBounds: GeoBox, oldGeoBounds: GeoBox, view: V): void;
}

/** @public */
export class GeoView extends GraphicsView {
  constructor() {
    super();
    this.geoBounds = GeoBox.undefined();
  }

  declare readonly observerType?: Class<GeoViewObserver>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true})
  get geoBoundsColor(): ThemeAnimator<this, Color | null> {
    return ThemeAnimator.getter();
  }

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

  protected override onRender(): void {
    super.onRender();
    const outlineColor = ThemeAnimator.tryValue(this, "geoBoundsColor");
    if (outlineColor !== null) {
      this.renderGeoBounds(outlineColor, 1);
    }
  }

  protected renderGeoBounds(outlineColor: Color, outlineWidth: number): void {
    const renderer = this.renderer.value;
    if (renderer instanceof PaintingRenderer && !this.hidden && !this.culled && !this.unbounded) {
      this.renderGeoOutline(this.geoBounds, renderer.context, outlineColor, outlineWidth);
    }
  }

  protected renderGeoOutline(geoBox: GeoBox, context: PaintingContext,
                             outlineColor: Color, outlineWidth: number): void {
    const geoViewport = this.geoViewport.value;
    if (!geoBox.isDefined() || geoViewport === null) {
      return;
    }

    // save
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    const southWest = geoViewport.project(geoBox.southWest.normalized());
    const northWest = geoViewport.project(geoBox.northWest.normalized());
    const northEast = geoViewport.project(geoBox.northEast.normalized());
    const southEast = geoViewport.project(geoBox.southEast.normalized());
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

  @Property({
    valueType: GeoViewport,
    value: null,
    inherits: true,
  })
  readonly geoViewport!: Property<this, GeoViewport | null>;

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
    if (oldGeoBounds.equals(newGeoBounds)) {
      return;
    }
    this.willSetGeoBounds(newGeoBounds, oldGeoBounds);
    (this as Mutable<this>).geoBounds = newGeoBounds;
    this.onSetGeoBounds(newGeoBounds, oldGeoBounds);
    this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
  }

  willSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    this.callObservers("viewWillSetGeoBounds", newGeoBounds, oldGeoBounds, this);
  }

  protected onSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    if (this.unbounded) {
      return;
    }
    const parent = this.parent;
    if (parent instanceof GeoView) {
      parent.onSetChildGeoBounds(this, newGeoBounds, oldGeoBounds);
    }
  }

  didSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    this.callObservers("viewDidSetGeoBounds", newGeoBounds, oldGeoBounds, this);
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

  static override readonly MountFlags: ViewFlags = GraphicsView.MountFlags | View.NeedsProject;
  static override readonly UncullFlags: ViewFlags = GraphicsView.UncullFlags | View.NeedsProject;
}
