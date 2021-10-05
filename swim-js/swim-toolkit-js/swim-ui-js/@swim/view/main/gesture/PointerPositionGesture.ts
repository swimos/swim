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
import {GestureInput} from "./GestureInput";
import type {PositionGestureInput} from "./PositionGestureInput";
import {PositionGestureClass, PositionGesture} from "./PositionGesture";
import type {View} from "../view/View";

/** @internal */
export interface PointerPositionGesture<O = unknown, V extends View = View> extends PositionGesture<O, V> {
  /** @internal @protected @override */
  attachHoverEvents(view: V): void;

  /** @internal @protected @override */
  detachHoverEvents(view: V): void;

  /** @internal @protected @override */
  attachPressEvents(view: V): void;

  /** @internal @protected @override */
  detachPressEvents(view: V): void;

  /** @internal @protected */
  updateInput(input: PositionGestureInput, event: PointerEvent): void;

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
}

/** @internal */
export const PointerPositionGesture = (function (_super: typeof PositionGesture) {
  const PointerPositionGesture = _super.extend() as PositionGestureClass<PointerPositionGesture<any, any>>;

  PointerPositionGesture.prototype.attachHoverEvents = function (this: PointerPositionGesture, view: View): void {
    view.on("pointerenter", this.onPointerEnter as EventListener);
    view.on("pointerleave", this.onPointerLeave as EventListener);
    view.on("pointerdown", this.onPointerDown as EventListener);
  };

  PointerPositionGesture.prototype.detachHoverEvents = function (this: PointerPositionGesture, view: View): void {
    view.off("pointerenter", this.onPointerEnter as EventListener);
    view.off("pointerleave", this.onPointerLeave as EventListener);
    view.off("pointerdown", this.onPointerDown as EventListener);
  };

  PointerPositionGesture.prototype.attachPressEvents = function (this: PointerPositionGesture, view: View): void {
    document.body.addEventListener("pointermove", this.onPointerMove);
    document.body.addEventListener("pointerup", this.onPointerUp);
    document.body.addEventListener("pointercancel", this.onPointerCancel);
    document.body.addEventListener("pointerleave", this.onPointerLeaveDocument);
  };

  PointerPositionGesture.prototype.detachPressEvents = function (this: PointerPositionGesture, view: View): void {
    document.body.removeEventListener("pointermove", this.onPointerMove);
    document.body.removeEventListener("pointerup", this.onPointerUp);
    document.body.removeEventListener("pointercancel", this.onPointerCancel);
    document.body.removeEventListener("pointerleave", this.onPointerLeaveDocument);
  };

  PointerPositionGesture.prototype.updateInput = function (this: PointerPositionGesture, input: PositionGestureInput, event: PointerEvent): void {
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

  PointerPositionGesture.prototype.onPointerEnter = function (this: PointerPositionGesture, event: PointerEvent): void {
    if (event.pointerType === "mouse" && event.buttons === 0) {
      const input = this.getOrCreateInput(event.pointerId, GestureInput.pointerInputType(event.pointerType),
                                          event.isPrimary, event.clientX, event.clientY, event.timeStamp);
      this.updateInput(input, event);
      if (!input.hovering) {
        this.beginHover(input, event);
      }
    }
  };

  PointerPositionGesture.prototype.onPointerLeave = function (this: PointerPositionGesture, event: PointerEvent): void {
    if (event.pointerType === "mouse") {
      const input = this.getInput(event.pointerId);
      if (input !== null) {
        this.updateInput(input, event);
        this.endHover(input, event);
      }
    }
  };

  PointerPositionGesture.prototype.onPointerDown = function (this: PointerPositionGesture, event: PointerEvent): void {
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

  PointerPositionGesture.prototype.onPointerMove = function (this: PointerPositionGesture, event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input !== null) {
      this.updateInput(input, event);
      this.movePress(input, event);
    }
  };

  PointerPositionGesture.prototype.onPointerUp = function (this: PointerPositionGesture, event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input !== null) {
      this.updateInput(input, event);
      this.endPress(input, event);
      if (!input.defaultPrevented && event.button === 0) {
        this.press(input, event);
      }
    }
  };

  PointerPositionGesture.prototype.onPointerCancel = function (this: PointerPositionGesture, event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input !== null) {
      this.updateInput(input, event);
      this.cancelPress(input, event);
    }
  };

  PointerPositionGesture.prototype.onPointerLeaveDocument = function (this: PointerPositionGesture, event: PointerEvent): void {
    const input = this.getInput(event.pointerId);
    if (input !== null) {
      this.updateInput(input, event);
      this.cancelPress(input, event);
      this.endHover(input, event);
    }
  };

  PointerPositionGesture.construct = function <G extends PointerPositionGesture<any, any>>(gestureClass: PositionGestureClass<PointerPositionGesture<any, any>>, gesture: G | null, owner: FastenerOwner<G>, gestureName: string): G {
    gesture = _super.construct(gestureClass, gesture, owner, gestureName) as G;
    gesture.onPointerEnter = gesture.onPointerEnter.bind(gesture);
    gesture.onPointerLeave = gesture.onPointerLeave.bind(gesture);
    gesture.onPointerDown = gesture.onPointerDown.bind(gesture);
    gesture.onPointerMove = gesture.onPointerMove.bind(gesture);
    gesture.onPointerUp = gesture.onPointerUp.bind(gesture);
    gesture.onPointerCancel = gesture.onPointerCancel.bind(gesture);
    gesture.onPointerLeaveDocument = gesture.onPointerLeaveDocument.bind(gesture);
    return gesture;
  };

  return PointerPositionGesture;
})(PositionGesture);
