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
import {NodeView} from "@swim/dom";
import {SvgView} from "@swim/dom";
import {PathContext} from "./PathContext";
import type {PaintingFillRule} from "./PaintingContext";
import type {PaintingContext} from "./PaintingContext";

/** @public */
export class SvgContext implements PaintingContext {
  constructor(view: SvgView) {
    this.view = view;
    this.precision = -1;
    this.pathContext = null;
    this.pathView = null;
    this.pathFlags = 0;
    this.globalAlpha = 1;
    this.globalCompositeOperation = "source-over";
    this.fillStyle = "";
    this.strokeStyle = "";
    this.lineWidth = 1;
    this.lineCap = "butt";
    this.lineJoin = "miter";
    this.miterLimit = 10;
    this.lineDashOffset = 0;
    this.lineDash = [];
  }

  readonly view: SvgView;

  readonly precision: number;

  setPrecision(precision: number): void {
    (this as Mutable<this>).precision = precision;
  }

  /** @internal */
  readonly pathContext: PathContext | null;

  protected getPathContext(): PathContext {
    const pathContext = this.pathContext;
    if (pathContext === null) {
      throw new Error("no path");
    }
    return pathContext;
  }

  protected getOrCreatePathContext(): PathContext {
    let pathContext = this.pathContext;
    if (pathContext === null) {
      pathContext = this.createPathContext();
      (this as Mutable<this>).pathContext = pathContext;
      if (this.pathView === null || this.pathFlags !== 0) {
        this.finalizePath();
        const pathView = this.nextPathView();
        this.setPathView(pathView);
      }
      this.setPathFlags(0);
    }
    return pathContext;
  }

  protected createPathContext(): PathContext {
    const pathContext = new PathContext();
    pathContext.setPrecision(this.precision);
    return pathContext;
  }

  /** @internal */
  readonly pathView: SvgView | null;

  /** @internal */
  setPathView(pathView: SvgView | null): void {
    (this as Mutable<this>).pathView = pathView;
  }

  /** @internal */
  nextPathView(): SvgView | null {
    const pathView = this.pathView;
    if (pathView === null) {
      return null;
    }
    let nextNode = pathView.node.nextSibling;
    while (nextNode !== null) {
      if (nextNode instanceof SVGPathElement) {
        return SvgView.fromNode(nextNode);
      }
      nextNode = nextNode.nextSibling;
    }
    return null;
  }

  /** @internal */
  finalizePath(): void {
    const pathView = this.pathView;
    if (pathView === null) {
      return;
    }
    const pathFlags = this.pathFlags;
    if ((pathFlags & SvgContext.FillFlag) === 0) {
      pathView.attributes.fill.setIntrinsic(null);
    }
    if ((pathFlags & SvgContext.FillRuleFlag) === 0) {
      pathView.attributes.fillRule.setIntrinsic(void 0);
    }
    if ((pathFlags & SvgContext.StrokeFlag) === 0) {
      pathView.attributes.stroke.setIntrinsic(null);
    }
    if ((pathFlags & SvgContext.PathFlag) === 0) {
      pathView.attributes.d.setIntrinsic(void 0);
    }
  }

  /** @internal */
  readonly pathFlags: number;

  /** @internal */
  setPathFlags(pathFlags: number): void {
    (this as Mutable<this>).pathFlags = pathFlags;
  }

  globalAlpha: number;

  globalCompositeOperation: string;

  fillStyle: string | CanvasGradient | CanvasPattern;

  strokeStyle: string | CanvasGradient | CanvasPattern;

  lineWidth: number;

  lineCap: CanvasLineCap;

  lineJoin: CanvasLineJoin;

  miterLimit: number;

  lineDashOffset: number;

  /** @internal */
  lineDash: number[];

  getLineDash(): number[] {
    return this.lineDash;
  }

  setLineDash(segments: number[]): void {
    this.lineDash = segments;
  }

  beginPath(): void {
    (this as Mutable<this>).pathContext = null;
  }

  moveTo(x: number, y: number): void {
    this.getOrCreatePathContext().moveTo(x, y);
  }

  lineTo(x: number, y: number): void {
    this.getPathContext().lineTo(x, y);
  }

  quadraticCurveTo(x1: number, y1: number, x: number, y: number): void {
    this.getPathContext().quadraticCurveTo(x1, y1, x, y);
  }

  bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): void {
    this.getPathContext().bezierCurveTo(x1, y1, x2, y2, x, y);
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, r: number): void {
    this.getPathContext().arcTo(x1, y1, x2, y2, r);
  }

  arc(cx: number, cy: number, r: number, a0: number, a1: number, ccw?: boolean): void {
    this.getOrCreatePathContext().arc(cx, cy, r, a0, a1, ccw);
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, phi: number, a0: number, a1: number, ccw?: boolean): void {
    this.getOrCreatePathContext().ellipse(cx, cy, rx, ry, phi, a0, a1, ccw);
  }

  rect(x: number, y: number, w: number, h: number): void {
    this.getOrCreatePathContext().rect(x, y, w, h);
  }

  closePath(): void {
    const pathContext = this.pathContext;
    if (pathContext !== null) {
      pathContext.closePath();
    }
  }

  fill(fillRule?: PaintingFillRule): void {
    const fillStyle = this.fillStyle;
    if (typeof fillStyle !== "string") {
      throw new Error("unsupported fill style: " + fillStyle);
    }
    let pathView = this.pathView;
    if (pathView !== null && (this.pathFlags & SvgContext.FillFlag) !== 0) {
      this.finalizePath();
      pathView = this.nextPathView();
      this.setPathView(pathView);
    }
    let created = false;
    if (pathView === null) {
      pathView = SvgView.fromTag("path");
      this.setPathView(pathView);
      created = true;
    }
    pathView.attributes.fill.setIntrinsic(fillStyle);
    pathView.attributes.fillOpacity.setIntrinsic(this.globalAlpha !== 1 ? this.globalAlpha : void 0);
    this.setPathFlags(this.pathFlags | SvgContext.FillFlag);
    if (fillRule !== void 0) {
      pathView.attributes.fillRule.setIntrinsic(fillRule);
      this.setPathFlags(this.pathFlags | SvgContext.FillRuleFlag);
    }
    if ((this.pathFlags & SvgContext.PathFlag) === 0) {
      const pathString = this.getPathContext().toString();
      pathView.attributes.d.setIntrinsic(pathString);
      this.setPathFlags(this.pathFlags | SvgContext.PathFlag);
    }
    if (created) {
      this.view.appendChild(pathView);
    }
  }

  stroke(): void {
    const strokeStyle = this.strokeStyle;
    const lineWidth = this.lineWidth;
    if (typeof strokeStyle !== "string" || lineWidth === 0 || !isFinite(lineWidth)) {
      throw new Error("unsupported stroke style: " + strokeStyle);
    }
    let pathView = this.pathView;
    if (pathView !== null && (this.pathFlags & SvgContext.StrokeFlag) !== 0) {
      this.finalizePath();
      pathView = this.nextPathView();
      this.setPathView(pathView);
    }
    let created = false;
    if (pathView === null) {
      pathView = SvgView.fromTag("path");
      this.setPathView(pathView);
      created = true;
    }
    pathView.attributes.setIntrinsic({
      stroke: strokeStyle,
      strokeWidth: lineWidth,
      strokeLinecap: this.lineCap,
      strokeLinejoin: this.lineJoin,
      strokeOpacity: this.globalAlpha !== 1 ? this.globalAlpha : void 0,
      strokeMiterlimit: this.lineJoin === "miter" ? this.miterLimit : void 0,
    });
    if (this.lineDash.length !== 0) {
      let dash = "";
      for (let i = 0; i < this.lineDash.length; i += 1) {
        if (i !== 0) {
          dash += " ";
        }
        dash += this.lineDash[i];
      }
      pathView.attributes.setIntrinsic({
        strokeDasharray: dash,
        strokeDashoffset: this.lineDashOffset !== 0 ? this.lineDashOffset : void 0,
      });
    } else {
      pathView.attributes.setIntrinsic({
        strokeDasharray: void 0,
        strokeDashoffset: void 0,
      });
    }
    this.setPathFlags(this.pathFlags | SvgContext.StrokeFlag);
    if ((this.pathFlags & SvgContext.PathFlag) === 0) {
      const pathString = this.getPathContext().toString();
      pathView.attributes.d.setIntrinsic(pathString);
      this.setPathFlags(this.pathFlags | SvgContext.PathFlag);
    }
    if (created) {
      this.view.appendChild(pathView);
    }
  }

  beginSvg(): void {
    let pathView: SvgView | null = null;
    let nextNode = this.view.node.firstChild;
    while (nextNode !== null) {
      if (nextNode instanceof SVGPathElement) {
        pathView = SvgView.fromNode(nextNode);
        break;
      }
      nextNode = nextNode.nextSibling;
    }
    this.setPathView(pathView);
    this.setPathFlags(0);
  }

  finalizeSvg(): void {
    let pathView = this.pathView;
    if (pathView === null) {
      return;
    }
    let nextNode = pathView.node.nextSibling;
    if (pathView.attributes.fill.state === null && pathView.attributes.stroke.state === null) {
      (this as Mutable<this>).pathView = null;
      pathView.remove();
    }
    pathView = null;
    while (nextNode !== null) {
      const nextView = NodeView.get(nextNode);
      nextNode = nextNode.nextSibling;
      if (nextView !== null) {
        nextView.remove();
      }
    }
  }

  /** @internal */
  static readonly FillFlag: number = 1 << 0;
  /** @internal */
  static readonly FillRuleFlag: number = 1 << 1;
  /** @internal */
  static readonly StrokeFlag: number = 1 << 2;
  /** @internal */
  static readonly PathFlag: number = 1 << 3;
}
