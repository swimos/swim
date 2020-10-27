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

import {AnyAngle, Angle} from "@swim/angle";
import {AnyLength, Length} from "@swim/length";
import {Transition} from "@swim/transition";
import {Height, Width, StyleAnimator} from "@swim/style";
import {PathContext} from "@swim/render";
import {ViewContextType, View, ViewAnimator} from "@swim/view";
import {ViewNodeType, SvgView} from "@swim/dom";
import {Look, MoodVector, ThemeMatrix} from "@swim/theme";
import {TreeCellInit, TreeCell} from "./TreeCell";

export interface PolygonTreeCellInit extends TreeCellInit {
  sides?: number;
  radius?: AnyLength;
  rotation?: AnyAngle;
}

export class PolygonTreeCell extends TreeCell {
  /** @hidden */
  _sides: number;

  constructor(node: HTMLElement) {
    super(node);
    this._sides = 0;
  }

  protected initNode(node: ViewNodeType<this>): void {
    super.initNode(node);
    this.addClass("polygon-tree-cell")
    this.justifyContent.setAutoState("center");

    const icon = this.append(SvgView, "icon");
    icon.append("path", "shape");
  }

  initView(init: PolygonTreeCellInit): void {
    super.initView(init);
    if (init.sides !== void 0) {
      this._sides = Math.round(init.sides);
    }
    if (init.radius !== void 0) {
      this.radius(init.radius);
    }
    if (init.rotation !== void 0) {
      this.rotation(init.rotation);
    }
  }

  get icon(): SvgView {
    return this.getChildView("icon") as SvgView;
  }

  get shape(): SvgView {
    const icon = this.icon;
    return icon.getChildView("shape") as SvgView;
  }

  sides(): number {
    return this._sides;
  }

  setSides(sides: number): void {
    sides = Math.round(sides);
    if (this._sides !== sides) {
      this._sides = sides;
      this.requireUpdate(View.NeedsLayout);
    }
  }

  @StyleAnimator({propertyNames: "height", type: [Length, String], updateFlags: View.NeedsLayout})
  height: StyleAnimator<this, Height>;

  @StyleAnimator({propertyNames: "width", type: [Length, String], updateFlags: View.NeedsLayout})
  width: StyleAnimator<this, Width>;

  @ViewAnimator({type: Length, state: Length.pct(50), updateFlags: View.NeedsLayout})
  radius: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Angle, state: Angle.zero(), updateFlags: View.NeedsLayout})
  rotation: ViewAnimator<this, Angle, AnyAngle>;

  protected onApplyTheme(theme: ThemeMatrix, mood: MoodVector,
                         transition: Transition<any> | null): void {
    super.onApplyTheme(theme, mood, transition);
    const shape = this.shape;
    if (shape !== null && shape.fill.isAuto()) {
      shape.fill.setAutoState(theme.inner(mood, Look.accentColor), transition);
    }
  }

  protected onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    if (this.display.state !== "none") {
      this.layoutPolygon();
    }
  }

  protected layoutPolygon(): void {
    let width: Length | number | string | undefined = this.width.state;
    let height: Length | number | string | undefined = this.height.state;
    if (width instanceof Length) {
      width = width.pxValue();
    } else if (typeof width !== "number") {
      return;
    }
    if (height instanceof Length) {
      height = height.pxValue();
    } else if (typeof height !== "number") {
      return;
    }
    const radius = this.radius.value.pxValue(Math.min(width, height));
    const size = 2 * radius;
    const sides = this._sides;
    const sector = 2 * Math.PI / sides;
    let angle = this.rotation.value.radValue();

    const icon = this.icon;
    icon.width.setAutoState(size);
    icon.height.setAutoState(size);
    icon.viewBox.setAutoState("0 0 " + size + " " + size);

    const shape = icon.getChildView("shape") as SvgView;
    const context = new PathContext();
    if (sides >= 3) {
      context.moveTo(radius + radius * Math.cos(angle),
                     radius + radius * Math.sin(angle));
      angle += sector;
      for (let i = 1; i < sides; i += 1) {
        context.lineTo(radius + radius * Math.cos(angle),
                       radius + radius * Math.sin(angle));
        angle += sector;
      }
      context.closePath();
    }
    shape.d.setAutoState(context.toString());
  }
}
TreeCell.Polygon = PolygonTreeCell;
