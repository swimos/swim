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

import type {Mutable} from "@swim/util";
import {Affinity, Property} from "@swim/fastener";
import {ViewNode, SvgView} from "@swim/dom";
import {PathContext} from "../path/PathContext";
import type {PaintingFillRule, PaintingContext} from "../painting/PaintingContext";

export class SvgContext implements PaintingContext {
  constructor(view: SvgView) {
    this.view = view;
    this.precision = -1;
    this.pathContext = null;
    this.pathView = null;
    this.pathFlags = 0;
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
    if (pathContext == null) {
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
    let pathView = this.pathView;
    if (pathView !== null) {
      let nextNode = pathView.node.nextSibling;
      pathView = null;
      while (nextNode !== null) {
        if (nextNode instanceof SVGPathElement) {
          pathView = SvgView.fromNode(nextNode);
          break;
        }
        nextNode = nextNode.nextSibling;
      }
    }
    return pathView;
  }

  /** @internal */
  finalizePath(): void {
    const pathView = this.pathView;
    if (pathView !== null) {
      const pathFlags = this.pathFlags;
      if ((pathFlags & SvgContext.FillFlag) === 0) {
        const fill = pathView.getFastener("fill", Property);
        if (fill !== null) {
          fill.setState(null, Affinity.Intrinsic);
        }
      }
      if ((pathFlags & SvgContext.FillRuleFlag) === 0) {
        const fillRule = pathView.getFastener("fillRule", Property);
        if (fillRule !== null) {
          fillRule.setState(void 0, Affinity.Intrinsic);
        }
      }
      if ((pathFlags & SvgContext.StrokeFlag) === 0) {
        const stroke = pathView.getFastener("stroke", Property);
        if (stroke !== null) {
          stroke.setState(null, Affinity.Intrinsic);
        }
      }
      if ((pathFlags & SvgContext.PathFlag) === 0) {
        const d = pathView.getFastener("d", Property);
        if (d !== null) {
          d.setState(void 0, Affinity.Intrinsic);
        }
      }
    }
  }

  /** @internal */
  readonly pathFlags: number;

  /** @internal */
  setPathFlags(pathFlags: number): void {
    (this as Mutable<this>).pathFlags = pathFlags;
  }

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
    if (typeof fillStyle === "string") {
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
      pathView.fill.setState(fillStyle, Affinity.Intrinsic);
      this.setPathFlags(this.pathFlags | SvgContext.FillFlag);
      if (fillRule !== void 0) {
        pathView.fillRule.setState(fillRule, Affinity.Intrinsic);
        this.setPathFlags(this.pathFlags | SvgContext.FillRuleFlag);
      }
      if ((this.pathFlags & SvgContext.PathFlag) === 0) {
        const pathString = this.getPathContext().toString();
        pathView.d.setState(pathString, Affinity.Intrinsic);
        this.setPathFlags(this.pathFlags | SvgContext.PathFlag);
      }
      if (created) {
        this.view.appendChild(pathView);
      }
    } else {
      throw new Error("unsupported fill style: " + fillStyle);
    }
  }

  stroke(): void {
    const strokeStyle = this.strokeStyle;
    const lineWidth = this.lineWidth;
    if (typeof strokeStyle === "string" && lineWidth !== 0 && isFinite(lineWidth)) {
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
      pathView.stroke.setState(strokeStyle, Affinity.Intrinsic);
      pathView.strokeWidth.setState(lineWidth, Affinity.Intrinsic);
      pathView.strokeLinecap.setState(this.lineCap, Affinity.Intrinsic);
      pathView.strokeLinejoin.setState(this.lineJoin, Affinity.Intrinsic);
      if (this.lineJoin === "miter") {
        pathView.strokeMiterlimit.setState(this.miterLimit, Affinity.Intrinsic);
      } else {
        pathView.strokeMiterlimit.setState(void 0, Affinity.Intrinsic);
      }
      if (this.lineDash.length !== 0) {
        let dash = "";
        for (let i = 0; i < this.lineDash.length; i += 1) {
          if (i !== 0) {
            dash += " ";
          }
          dash += this.lineDash[i];
        }
        pathView.strokeDasharray.setState(dash, Affinity.Intrinsic);
        if (this.lineDashOffset !== 0) {
          pathView.strokeDashoffset.setState(this.lineDashOffset, Affinity.Intrinsic);
        } else {
          pathView.strokeDashoffset.setState(void 0, Affinity.Intrinsic);
        }
      } else {
        pathView.strokeDasharray.setState(void 0, Affinity.Intrinsic);
        pathView.strokeDashoffset.setState(void 0, Affinity.Intrinsic);
      }
      this.setPathFlags(this.pathFlags | SvgContext.StrokeFlag);
      if ((this.pathFlags & SvgContext.PathFlag) === 0) {
        const pathString = this.getPathContext().toString();
        pathView.d.setState(pathString, Affinity.Intrinsic);
        this.setPathFlags(this.pathFlags | SvgContext.PathFlag);
      }
      if (created) {
        this.view.appendChild(pathView);
      }
    } else {
      throw new Error("unsupported stroke style: " + strokeStyle);
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
    if (pathView !== null) {
      let nextNode = pathView.node.nextSibling;
      if (pathView.fill.state === null && pathView.stroke.state === null) {
        (this as Mutable<this>).pathView = null;
        pathView.remove();
      }
      pathView = null;
      while (nextNode !== null) {
        const nextView = (nextNode as ViewNode).view;
        nextNode = nextNode.nextSibling;
        if (nextView !== void 0) {
          nextView.remove();
        }
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
