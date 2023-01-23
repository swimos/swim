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

import type {FastenerOwner} from "@swim/component";
import type {View} from "../view/View";
import {GestureInput} from "./GestureInput";
import type {ScaleGestureInput} from "./ScaleGestureInput";
import {ScaleGestureClass, ScaleGesture} from "./ScaleGesture";

/** @internal */
export interface PointerScaleGesture<O = unknown, V extends View = View, X = unknown, Y = unknown> extends ScaleGesture<O, V, X, Y> {
  /** @internal @protected @override */
  attachHoverEvents(view: V): void;

  /** @internal @protected @override */
  detachHoverEvents(view: V): void;

  /** @internal @protected @override */
  attachPressEvents(view: V): void;

  /** @internal @protected @override */
  detachPressEvents(view: V): void;

  /** @internal @protected */
  updateInput(input: ScaleGestureInput<X, Y>, event: PointerEvent): void;

  /** @internal @protected */
  onPointerEnter(event: PointerEvent): void;

  /** @internal @protected */
  onPointerLeave(event: PointerEvent): void;

  /** @internal @protected */
  onPointerDown(event: PointerEvent): void;

  /** @internal @protected */
  onPointerMove(event: PointerEvent): void;

  /** @internal @protected */
  onPointerUp(event: PointerEvent): void;

  /** @internal @protected */
  onPointerCancel(event: PointerEvent): void;

  /** @internal @protected */
  onPointerLeaveDocument(event: PointerEvent): void;

  /** @internal @protected */
  onWheel(event: WheelEvent): void;
}

/** @internal */
export const PointerScaleGesture = (function (_super: typeof ScaleGesture) {
  const PointerScaleGesture = _super.extend("PointerScaleGesture", {
    wheel: true,
  }) as ScaleGestureClass<PointerScaleGesture<any, any, any, any>>;

  PointerScaleGesture.prototype.attachHoverEvents = function (this: PointerScaleGesture, view: View): void {
    view.addEventListener("pointerenter", this.onPointerEnter as EventListener);
    view.addEventListener("pointerleave", this.onPointerLeave as EventListener);
    view.addEventListener("pointerdown", this.onPointerDown as EventListener);
    view.addEventListener("wheel", this.onWheel as EventListener);
  };

  PointerScaleGesture.prototype.detachHoverEvents = function (this: PointerScaleGesture, view: View): void {
    view.removeEventListener("pointerenter", this.onPointerEnter as EventListener);
    view.removeEventListener("pointerleave", this.onPointerLeave as EventListener);
    view.removeEventListener("pointerdown", this.onPointerDown as EventListener);
    view.removeEventListener("wheel", this.onWheel as EventListener);
  };

  PointerScaleGesture.prototype.attachPressEvents = function (this: PointerScaleGesture, view: View): void {
    document.body.addEventListener("pointermove", this.onPointerMove);
    document.body.addEventListener("pointerup", this.onPointerUp);
    document.body.addEventListener("pointercancel", this.onPointerCancel);
    document.body.addEventListener("pointerleave", this.onPointerLeaveDocument);
  };

  PointerScaleGesture.prototype.detachPressEvents = function (this: PointerScaleGesture, view: View): void {
    document.body.removeEventListener("pointermove", this.onPointerMove);
    document.body.removeEventListener("pointerup", this.onPointerUp);
    document.body.removeEventListener("pointercancel", this.onPointerCancel);
    document.body.removeEventListener("pointerleave", this.onPointerLeaveDocument);
  };

  PointerScaleGesture.prototype.updateInput = function <X, Y>(this: PointerScaleGesture<unknown, View, X, Y>, input: ScaleGestureInput<X, Y>, event: PointerEvent): void {
    input.target = event.target;
    input.button = event.button;
    input.buttons = event.buttons;
    input.altKey = event.altKey;
    input.ctrlKey = event.ctrlKey;
    input.metaKey = event.metaKey;
    input.shiftKey = event.shiftKey;

    input.dx = event.clientX - input.x;
    input.dy = event.clientY - input.y;
    input.dt = event.timeStamp - input.t;
    input.x = event.clientX;
    input.y = event.clientY;
    input.t = event.timeStamp;

    input.width = event.width;
    input.height = event.height;
    input.tiltX = event.tiltX;
    input.tiltY = event.tiltY;
    input.twist = event.twist;
    input.pressure = event.pressure;
    input.tangentialPressure = event.tangentialPressure;
  };

  PointerScaleGesture.prototype.onPointerEnter = function (this: PointerScaleGesture, event: PointerEvent): void {
    if (event.pointerType === "mouse" && event.buttons === 0) {
      const input = this.getOrCreateInput(event.pointerId, GestureInput.pointerInputType(event.pointerType),
                                          event.isPrimary, event.clientX, event.clientY, event.timeStamp);
      if (!input.coasting) {
        this.updateInput(input, event);
      }
      if (!input.hovering) {
        this.beginHover(input, event);
      }
    }
  };

  PointerScaleGesture.prototype.onPointerLeave = function (this: PointerScaleGesture, event: PointerEvent): void {
    if (event.pointerType === "mouse") {
      const input = this.getInput(event.pointerId);
      if (input !== null) {
        if (!input.coasting) {
          this.updateInput(input, event);
        }
        this.endHover(input, event);
      }
    }
  };

  PointerScaleGesture.prototype.onPointerDown = function (this: PointerScaleGesture, event: PointerEvent): void {
    const input = this.getOrCreateInput(event.pointerId, GestureInput.pointerInputType(event.pointerType),
                                        event.isPrimary, event.clientX, event.clientY, event.timeStamp);
    this.updateInput(input, event);
    if (!input.pressing) {
      this.beginPress(input, event);
    }
    if (event.pointerType === "mouse" && event.button !== 0) {
      this.cancelPress(input, event);
    }
  };

  PointerScaleGesture.prototype.onPointerMove = function (this: PointerScaleGesture, event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input !== null) {
      this.updateInput(input, event);
      this.movePress(input, event);
    }
  };

  PointerScaleGesture.prototype.onPointerUp = function (this: PointerScaleGesture, event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input !== null) {
      this.updateInput(input, event);
      this.endPress(input, event);
      if (!input.defaultPrevented && event.button === 0) {
        this.press(input, event);
      }
    }
  };

  PointerScaleGesture.prototype.onPointerCancel = function (this: PointerScaleGesture, event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input !== null) {
      this.updateInput(input, event);
      this.cancelPress(input, event);
    }
  };

  PointerScaleGesture.prototype.onPointerLeaveDocument = function (this: PointerScaleGesture, event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input !== null) {
      this.updateInput(input, event);
      this.cancelPress(input, event);
      this.endHover(input, event);
    }
  };

  PointerScaleGesture.prototype.onWheel = function (this: PointerScaleGesture, event: WheelEvent): void {
    if (this.wheel) {
      event.preventDefault();
      this.zoom(event.clientX, event.clientY, event.deltaY, event);
    }
  };

  PointerScaleGesture.construct = function <G extends PointerScaleGesture<any, any, any, any>>(gesture: G | null, owner: FastenerOwner<G>): G {
    gesture = _super.construct.call(this, gesture, owner) as G;
    gesture.onPointerEnter = gesture.onPointerEnter.bind(gesture);
    gesture.onPointerLeave = gesture.onPointerLeave.bind(gesture);
    gesture.onPointerDown = gesture.onPointerDown.bind(gesture);
    gesture.onPointerMove = gesture.onPointerMove.bind(gesture);
    gesture.onPointerUp = gesture.onPointerUp.bind(gesture);
    gesture.onPointerCancel = gesture.onPointerCancel.bind(gesture);
    gesture.onPointerLeaveDocument = gesture.onPointerLeaveDocument.bind(gesture);
    gesture.onWheel = gesture.onWheel.bind(gesture);
    return gesture;
  };

  return PointerScaleGesture;
})(ScaleGesture);
