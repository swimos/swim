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

import type {FastenerOwner} from "@swim/fastener";
import type {MomentumGestureInput} from "./MomentumGestureInput";
import {MomentumGestureClass, MomentumGestureFactory, MomentumGesture} from "./MomentumGesture";
import type {View} from "../view/View";

/** @internal */
export interface TouchMomentumGesture<O = unknown, V extends View = View> extends MomentumGesture<O, V> {
  /** @internal @protected @override */
  attachHoverEvents(view: V): void;

  /** @internal @protected @override */
  detachHoverEvents(view: V): void;

  /** @internal @protected @override */
  attachPressEvents(view: V): void;

  /** @internal @protected @override */
  detachPressEvents(view: V): void;

  /** @internal @protected */
  updateInput(input: MomentumGestureInput, event: TouchEvent, touch: Touch): void;

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
export const TouchMomentumGesture = (function (_super: typeof MomentumGesture) {
  const TouchMomentumGesture = _super.extend("TouchMomentumGesture") as MomentumGestureFactory<TouchMomentumGesture<any, any>>;

  TouchMomentumGesture.prototype.attachHoverEvents = function (this: TouchMomentumGesture, view: View): void {
    view.on("touchstart", this.onTouchStart as EventListener);
  };

  TouchMomentumGesture.prototype.detachHoverEvents = function (this: TouchMomentumGesture, view: View): void {
    view.off("touchstart", this.onTouchStart as EventListener);
  };

  TouchMomentumGesture.prototype.attachPressEvents = function (this: TouchMomentumGesture, view: View): void {
    view.on("touchmove", this.onTouchMove as EventListener);
    view.on("touchend", this.onTouchEnd as EventListener);
    view.on("touchcancel", this.onTouchCancel as EventListener);
  };

  TouchMomentumGesture.prototype.detachPressEvents = function (this: TouchMomentumGesture, view: View): void {
    view.off("touchmove", this.onTouchMove as EventListener);
    view.off("touchend", this.onTouchEnd as EventListener);
    view.off("touchcancel", this.onTouchCancel as EventListener);
  };

  TouchMomentumGesture.prototype.updateInput = function (this: TouchMomentumGesture, input: MomentumGestureInput, event: TouchEvent, touch: Touch): void {
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

  TouchMomentumGesture.prototype.onTouchStart = function (this: TouchMomentumGesture, event: TouchEvent): void {
    const touches = event.targetTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i]!;
      const input = this.getOrCreateInput(touch.identifier, "touch", false, touch.clientX, touch.clientY, event.timeStamp);
      this.updateInput(input, event, touch);
      if (!input.pressing) {
        this.beginPress(input, event);
      }
    }
  };

  TouchMomentumGesture.prototype.onTouchMove = function (this: TouchMomentumGesture, event: TouchEvent): void {
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

  TouchMomentumGesture.prototype.onTouchEnd = function (this: TouchMomentumGesture, event: TouchEvent): void {
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

  TouchMomentumGesture.prototype.onTouchCancel = function (this: TouchMomentumGesture, event: TouchEvent): void {
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

  TouchMomentumGesture.construct = function <G extends TouchMomentumGesture<any, any>>(gestureClass: MomentumGestureClass<TouchMomentumGesture<any, any>>, gesture: G | null, owner: FastenerOwner<G>): G {
    gesture = _super.construct(gestureClass, gesture, owner) as G;
    gesture.onTouchStart = gesture.onTouchStart.bind(gesture);
    gesture.onTouchMove = gesture.onTouchMove.bind(gesture);
    gesture.onTouchEnd = gesture.onTouchEnd.bind(gesture);
    gesture.onTouchCancel = gesture.onTouchCancel.bind(gesture);
    return gesture;
  };

  return TouchMomentumGesture;
})(MomentumGesture);
