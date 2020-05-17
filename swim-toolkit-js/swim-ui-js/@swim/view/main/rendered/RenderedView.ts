// Copyright 2015-2020 SWIM.AI inc.
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

import {BoxR2} from "@swim/math";
import {Renderer} from "@swim/render";
import {ViewEvent} from "../ViewEvent";
import {ViewFlags, ViewInit, View} from "../View";
import {AnimatedView} from "../animated/AnimatedView";
import {RenderedViewContext} from "./RenderedViewContext";
import {RenderedViewController} from "./RenderedViewController";
import {ElementViewConstructor, ElementView} from "../element/ElementView";
import {CanvasView} from "../canvas/CanvasView";

export interface RenderedViewConstructor<V extends RenderedView = RenderedView> {
  new(): V;
}

export interface RenderedViewInit extends ViewInit {
  hidden?: boolean;
  culled?: boolean;
}

export interface RenderedView extends AnimatedView {
  readonly viewController: RenderedViewController | null;

  readonly canvasView: CanvasView | null;

  readonly renderer: Renderer | null;

  needsProcess(processFlags: ViewFlags, viewContext: RenderedViewContext): ViewFlags;

  needsDisplay(displayFlags: ViewFlags, viewContext: RenderedViewContext): ViewFlags;

  /**
   * Returns `true` if this view is ineligible for rendering and hit testing,
   * and should be excluded from its parent's layout and hit bounds.
   */
  isHidden(): boolean;

  /**
   * Makes this view ineligible for rendering and hit testing, and excludes
   * this view from its parent's layout and hit bounds, when `hidden` is `true`.
   * Makes this view eligible for rendering and hit testing, and includes this
   * view in its parent's layout and hit bounds, when `hidden` is `false`.
   */
  setHidden(hidden: boolean): void;

  /**
   * Returns `true` if this view should be excluded from rendering and hit testing.
   */
  isCulled(): boolean;

  /**
   * Excludes this view from rendering and hit testing when `culled` is `true`.
   * Includes this view in rendering and hit testing when `culled` is `false`.
   */
  setCulled(culled: boolean): void;

  /**
   * The parent-specified view-coordinate bounding box in which this view
   * should layout and render graphics.
   */
  readonly viewFrame: BoxR2;

  /**
   * Sets the view-coordinate bounding box in which this view should layout
   * and render graphics.  Should only be invoked by the view's parent view.
   */
  setViewFrame(viewFrame: BoxR2): void;

  /**
   * The self-defined view-coordinate bounding box surrounding all graphics
   * this view could possibly render.  Views with view bounds that don't
   * overlap their view frames may be culled from rendering and hit testing.
   */
  readonly viewBounds: BoxR2;

  /**
   * The self-defined view-coordinate bounding box surrounding all hit regions
   * in this view.
   */
  readonly hitBounds: BoxR2;

  hitTest(x: number, y: number, viewContext: RenderedViewContext): RenderedView | null;

  /** @hidden */
  handleEvent(event: ViewEvent): void;

  /**
   * Invokes event handlers registered with this `View` before propagating the
   * `event` up the view hierarchy.  Returns a `View`, without invoking any
   * registered event handlers, on which `dispatchEvent` should be called to
   * continue event propagation.
   * @hidden
   */
  bubbleEvent(event: ViewEvent): View | null;
}

/** @hidden */
export const RenderedView = {
  fromConstructor<C extends ElementViewConstructor | RenderedViewConstructor>(viewConstructor: C): InstanceType<C> {
    if (!ElementView.isConstructor(viewConstructor)) {
      return new (viewConstructor as RenderedViewConstructor)() as InstanceType<C>;
    }
    throw new TypeError("" + viewConstructor);
  },

  create<C extends RenderedViewConstructor>(source: RenderedViewConstructor): InstanceType<C> {
    if (typeof source === "function") {
      return RenderedView.fromConstructor(source) as InstanceType<C>;
    }
    throw new TypeError("" + source);
  },

  is(object: unknown): object is RenderedView {
    if (typeof object === "object" && object !== null) {
      const view = object as RenderedView;
      return view instanceof View.Graphics
          || AnimatedView.is(view) && typeof view.hitTest === "function";
    }
    return false;
  },
};
View.Rendered = RenderedView;
