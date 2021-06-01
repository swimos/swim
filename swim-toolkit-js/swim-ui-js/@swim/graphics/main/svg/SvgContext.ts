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

import {View} from "@swim/view";
import {ViewNode, SvgView} from "@swim/dom";
import {PathContext} from "../path/PathContext";
import type {PaintingFillRule, PaintingContext} from "../painting/PaintingContext";

export class SvgContext implements PaintingContext {
  constructor(view: SvgView) {
    Object.defineProperty(this, "view", {
      value: view,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "precision", {
      value: -1,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "pathContext", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "pathView", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "pathFlags", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    this.fillStyle = "";
    this.strokeStyle = "";
  }

  readonly view!: SvgView;

  readonly precision!: number;

  setPrecision(precision: number): void {
    Object.defineProperty(this, "precision", {
      value: precision,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  readonly pathContext!: PathContext;

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
      Object.defineProperty(this, "pathContext", {
        value: pathContext,
        enumerable: true,
        configurable: true,
      });
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

  /** @hidden */
  readonly pathView!: SvgView | null;

  /** @hidden */
  setPathView(pathView: SvgView | null): void {
    Object.defineProperty(this, "pathView", {
      value: pathView,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
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

  /** @hidden */
  finalizePath(): void {
    const pathView = this.pathView;
    if (pathView !== null) {
      const pathFlags = this.pathFlags;
      if ((pathFlags & SvgContext.FillFlag) === 0) {
        const fill = pathView.getAttributeAnimator("fill");
        if (fill !== null) {
          fill.setState(null, View.Intrinsic);
        }
      }
      if ((pathFlags & SvgContext.FillRuleFlag) === 0) {
        const fillRule = pathView.getAttributeAnimator("fillRule");
        if (fillRule !== null) {
          fillRule.setState(void 0, View.Intrinsic);
        }
      }
      if ((pathFlags & SvgContext.StrokeFlag) === 0) {
        const stroke = pathView.getAttributeAnimator("stroke");
        if (stroke !== null) {
          stroke.setState(null, View.Intrinsic);
        }
      }
      if ((pathFlags & SvgContext.PathFlag) === 0) {
        const d = pathView.getAttributeAnimator("d");
        if (d !== null) {
          d.setState(void 0, View.Intrinsic);
        }
      }
    }
  }

  /** @hidden */
  readonly pathFlags!: number;

  /** @hidden */
  setPathFlags(pathFlags: number): void {
    Object.defineProperty(this, "pathFlags", {
      value: pathFlags,
      enumerable: true,
      configurable: true,
    });
  }

  fillStyle: string | CanvasGradient | CanvasPattern;

  strokeStyle: string | CanvasGradient | CanvasPattern;

  beginPath(): void {
    Object.defineProperty(this, "pathContext", {
      value: null,
      enumerable: true,
      configurable: true,
    });
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
        pathView = SvgView.path.create();
        this.setPathView(pathView);
        created = true;
      }
      pathView.fill.setState(fillStyle, View.Intrinsic);
      this.setPathFlags(this.pathFlags | SvgContext.FillFlag);
      if (fillRule !== void 0) {
        pathView.fillRule.setState(fillRule, View.Intrinsic);
        this.setPathFlags(this.pathFlags | SvgContext.FillRuleFlag);
      }
      if ((this.pathFlags & SvgContext.PathFlag) === 0) {
        const pathString = this.getPathContext().toString();
        pathView.d.setState(pathString, View.Intrinsic);
        this.setPathFlags(this.pathFlags | SvgContext.PathFlag);
      }
      if (created) {
        this.view.appendChildView(pathView);
      }
    } else {
      throw new Error("unsupported fill style: " + fillStyle);
    }
  }

  stroke(): void {
    const strokeStyle = this.strokeStyle;
    if (typeof strokeStyle === "string") {
      let pathView = this.pathView;
      if (pathView !== null && (this.pathFlags & SvgContext.StrokeFlag) !== 0) {
        this.finalizePath();
        pathView = this.nextPathView();
        this.setPathView(pathView);
      }
      let created = false;
      if (pathView === null) {
        pathView = SvgView.path.create();
        this.setPathView(pathView);
        created = true;
      }
      pathView.stroke.setState(strokeStyle, View.Intrinsic);
      this.setPathFlags(this.pathFlags | SvgContext.StrokeFlag);
      if ((this.pathFlags & SvgContext.PathFlag) === 0) {
        const pathString = this.getPathContext().toString();
        pathView.d.setState(pathString, View.Intrinsic);
        this.setPathFlags(this.pathFlags | SvgContext.PathFlag);
      }
      if (created) {
        this.view.appendChildView(pathView);
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
        Object.defineProperty(this, "pathView", {
          value: null,
          enumerable: true,
          configurable: true,
        });
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

  /** @hidden */
  static readonly FillFlag: number = 1 << 0;
  /** @hidden */
  static readonly FillRuleFlag: number = 1 << 1;
  /** @hidden */
  static readonly StrokeFlag: number = 1 << 2;
  /** @hidden */
  static readonly PathFlag: number = 1 << 3;
}
