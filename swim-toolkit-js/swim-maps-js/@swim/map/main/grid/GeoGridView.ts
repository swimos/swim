// Copyright 2015-2021 Swim inc.
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

import type {GeoTile, GeoBox, GeoProjection} from "@swim/geo";
import {AnyColor, Color} from "@swim/style";
import {ViewContextType, ViewAnimator} from "@swim/view";
import {CanvasContext, CanvasRenderer} from "@swim/graphics";
import type {GeoViewInit} from "../geo/GeoView";
import {GeoLayerView} from "../layer/GeoLayerView";

export interface GeoGridViewInit extends GeoViewInit {
  gridOutlineColor?: AnyColor;
}

export class GeoGridView extends GeoLayerView {
  constructor(geoTile: GeoTile) {
    super();
    Object.defineProperty(this, "geoTile", {
      value: geoTile,
      enumerable: true,
    });
    Object.defineProperty(this, "geoBounds", {
      value: geoTile.bounds,
      enumerable: true,
    });
  }

  override initView(init: GeoGridViewInit): void {
    super.initView(init);
    if (init.gridOutlineColor !== void 0) {
      this.gridOutlineColor(init.gridOutlineColor);
    }
  }

  readonly geoTile!: GeoTile;

  @ViewAnimator({type: Color, inherit: true})
  readonly gridOutlineColor!: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

  protected override onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    const outlineColor = this.getViewAnimator("gridOutlineColor") as ViewAnimator<this, Color, AnyColor> | null;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled() &&
        outlineColor !== null && outlineColor.value !== void 0) {
      const context = renderer.context;
      context.save();
      this.renderTile(context, viewContext.geoViewport, outlineColor.value);
      context.restore();
    }
  }

  protected renderTile(context: CanvasContext, geoProjection: GeoProjection, outlineColor: Color): void {
    const geoTile = this.geoTile;
    const southWest = geoProjection.project(geoTile.southWest);
    const northWest = geoProjection.project(geoTile.northWest);
    const northEast = geoProjection.project(geoTile.northEast);
    const southEast = geoProjection.project(geoTile.southEast);
    context.beginPath();
    context.moveTo(southWest.x, southWest.y);
    context.lineTo(northWest.x, northWest.y);
    context.lineTo(northEast.x, northEast.y);
    context.lineTo(southEast.x, southEast.y);
    context.closePath();
    const u = Math.min(Math.max(0, geoTile.z / 20), 1);
    context.lineWidth = 4 * (1 - u) + 0.5 * u;
    context.strokeStyle = outlineColor.toString();
    context.stroke();
  }

  protected override setGeoBounds(newGeoBounds: GeoBox): void {
    // immutable
  }

  protected override updateGeoBounds(): void {
    // nop
  }
}
