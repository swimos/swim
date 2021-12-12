// Copyright 2015-2021 Swim.inc
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

import type {FastenerOwner} from "@swim/component";
import type {ScaleGestureInput} from "./ScaleGestureInput";
import {ScaleGestureClass, ScaleGestureFactory, ScaleGesture} from "./ScaleGesture";
import type {View} from "../view/View";

/** @internal */
export interface TouchScaleGesture<O = unknown, V extends View = View, X = unknown, Y = unknown> extends ScaleGesture<O, V, X, Y> {
  /** @internal @protected @override */
  attachHoverEvents(view: V): void;

  /** @internal @protected @override */
  detachHoverEvents(view: V): void;

  /** @internal @protected @override */
  attachPressEvents(view: V): void;

  /** @internal @protected @override */
  detachPressEvents(view: V): void;

  /** @internal @protected */
  updateInput(input: ScaleGestureInput<X, Y>, event: TouchEvent, touch: Touch): void;

  /** @internal @protected */
  onTouchStart(event: TouchEvent): void;

  /** @internal @protected */
  onTouchMove(event: TouchEvent): void;

  /** @internal @protected */
  onTouchEnd(event: TouchEvent): void;

  /** @internal @protected */
  onTouchCancel(event: TouchEvent): void;
}

/** @internal */
export const TouchScaleGesture = (function (_super: typeof ScaleGesture) {
  const TouchScaleGesture = _super.extend("TouchScaleGesture") as ScaleGestureFactory<TouchScaleGesture<any, any, any, any>>;

  TouchScaleGesture.prototype.attachHoverEvents = function (this: TouchScaleGesture, view: View): void {
    view.on("touchstart", this.onTouchStart as EventListener);
  };

  TouchScaleGesture.prototype.detachHoverEvents = function (this: TouchScaleGesture, view: View): void {
    view.off("touchstart", this.onTouchStart as EventListener);
  };

  TouchScaleGesture.prototype.attachPressEvents = function (this: TouchScaleGesture, view: View): void {
    view.on("touchmove", this.onTouchMove as EventListener);
    view.on("touchend", this.onTouchEnd as EventListener);
    view.on("touchcancel", this.onTouchCancel as EventListener);
  };

  TouchScaleGesture.prototype.detachPressEvents = function (this: TouchScaleGesture, view: View): void {
    view.off("touchmove", this.onTouchMove as EventListener);
    view.off("touchend", this.onTouchEnd as EventListener);
    view.off("touchcancel", this.onTouchCancel as EventListener);
  };

  TouchScaleGesture.prototype.updateInput = function <X, Y>(this: TouchScaleGesture<unknown, View, X, Y>, input: ScaleGestureInput<X, Y>, event: TouchEvent, touch: Touch): void {
    input.target = touch.target;
    input.altKey = event.altKey;
    input.ctrlKey = event.ctrlKey;
    input.metaKey = event.metaKey;
    input.shiftKey = event.shiftKey;

    input.dx = touch.clientX - input.x;
    input.dy = touch.clientY - input.y;
    input.dt = event.timeStamp - input.t;
    input.x = touch.clientX;
    input.y = touch.clientY;
    input.t = event.timeStamp;
  };

  TouchScaleGesture.prototype.onTouchStart = function (this: TouchScaleGesture, event: TouchEvent): void {
    const touches = event.targetTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i]!;
      const input = this.getOrCreateInput(touch.identifier, "touch", false,
                                          touch.clientX, touch.clientY, event.timeStamp);
      this.updateInput(input, event, touch);
      if (!input.pressing) {
        this.beginPress(input, event);
      }
    }
  };

  TouchScaleGesture.prototype.onTouchMove = function (this: TouchScaleGesture, event: TouchEvent): void {
    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i]!;
      const input = this.getInput(touch.identifier);
      if (input !== null) {
        this.updateInput(input, event, touch);
        this.movePress(input, event);
      }
    }
  };

  TouchScaleGesture.prototype.onTouchEnd = function (this: TouchScaleGesture, event: TouchEvent): void {
    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i]!;
      const input = this.getInput(touch.identifier);
      if (input !== null) {
        this.updateInput(input, event, touch);
        this.endPress(input, event);
        if (!input.defaultPrevented) {
          this.press(input, event);
        }
        this.endHover(input, event);
      }
    }
  };

  TouchScaleGesture.prototype.onTouchCancel = function (this: TouchScaleGesture, event: TouchEvent): void {
    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i]!;
      const input = this.getInput(touch.identifier);
      if (input !== null) {
        this.updateInput(input, event, touch);
        this.cancelPress(input, event);
        this.endHover(input, event);
      }
    }
  };

  TouchScaleGesture.construct = function <G extends TouchScaleGesture<any, any, any, any>>(gestureClass: ScaleGestureClass<TouchScaleGesture<any, any, any, any>>, gesture: G | null, owner: FastenerOwner<G>): G {
    gesture = _super.construct(gestureClass, gesture, owner) as G;
    gesture.onTouchStart = gesture.onTouchStart.bind(gesture);
    gesture.onTouchMove = gesture.onTouchMove.bind(gesture);
    gesture.onTouchEnd = gesture.onTouchEnd.bind(gesture);
    gesture.onTouchCancel = gesture.onTouchCancel.bind(gesture);
    return gesture;
  };

  return TouchScaleGesture;
})(ScaleGesture);
