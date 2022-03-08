// Copyright 2015-2022 Swim.inc
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
import type {PositionGestureInput} from "./PositionGestureInput";
import {PositionGestureClass, PositionGestureFactory, PositionGesture} from "./PositionGesture";
import type {View} from "../view/View";

/** @internal */
export interface MousePositionGesture<O = unknown, V extends View = View> extends PositionGesture<O, V> {
  /** @internal @protected @override */
  attachHoverEvents(view: V): void;

  /** @internal @protected @override */
  detachHoverEvents(view: V): void;

  /** @internal @protected @override */
  attachPressEvents(view: V): void;

  /** @internal @protected @override */
  detachPressEvents(view: V): void;

  /** @internal @protected */
  updateInput(input: PositionGestureInput, event: MouseEvent): void;

  /** @internal @protected */
  onMouseEnter(event: MouseEvent): void;

  /** @internal @protected */
  onMouseLeave(event: MouseEvent): void;

  /** @internal @protected */
  onMouseDown(event: MouseEvent): void;

  /** @internal @protected */
  onMouseMove(event: MouseEvent): void;

  /** @internal @protected */
  onMouseUp(event: MouseEvent): void;

  /** @internal @protected */
  onMouseLeaveDocument(event: MouseEvent): void;
}

/** @internal */
export const MousePositionGesture = (function (_super: typeof PositionGesture) {
  const MousePositionGesture = _super.extend("MousePositionGesture") as PositionGestureFactory<MousePositionGesture<any, any>>;

  MousePositionGesture.prototype.attachHoverEvents = function (this: MousePositionGesture, view: View): void {
    view.on("mouseenter", this.onMouseEnter as EventListener);
    view.on("mouseleave", this.onMouseLeave as EventListener);
    view.on("mousedown", this.onMouseDown as EventListener);
  };

  MousePositionGesture.prototype.detachHoverEvents = function (this: MousePositionGesture, view: View): void {
    view.off("mouseenter", this.onMouseEnter as EventListener);
    view.off("mouseleave", this.onMouseLeave as EventListener);
    view.off("mousedown", this.onMouseDown as EventListener);
  };

  MousePositionGesture.prototype.attachPressEvents = function (this: MousePositionGesture, view: View): void {
    document.body.addEventListener("mousemove", this.onMouseMove);
    document.body.addEventListener("mouseup", this.onMouseUp);
    document.body.addEventListener("mouseleave", this.onMouseLeaveDocument);
  };

  MousePositionGesture.prototype.detachPressEvents = function (this: MousePositionGesture, view: View): void {
    document.body.removeEventListener("mousemove", this.onMouseMove);
    document.body.removeEventListener("mouseup", this.onMouseUp);
    document.body.removeEventListener("mouseleave", this.onMouseLeaveDocument);
  };

  MousePositionGesture.prototype.updateInput = function (this: MousePositionGesture, input: PositionGestureInput, event: MouseEvent): void {
    input.target = event.target;
    input.button = event.button;
    input.buttons = event.buttons;
    input.altKey = event.altKey;
    input.ctrlKey = event.ctrlKey;
    input.metaKey = event.metaKey;
    input.shiftKey = event.shiftKey;

    input.dx = event.clientX - input.x;
    input.dy = event.clientY - input.y;
    input.dt = event.timeStamp - input.y;
    input.x = event.clientX;
    input.y = event.clientY;
    input.t = event.timeStamp;
  };

  MousePositionGesture.prototype.onMouseEnter = function (this: MousePositionGesture, event: MouseEvent): void {
    if (event.buttons === 0) {
      const input = this.getOrCreateInput("mouse", "mouse", true, event.clientX, event.clientY, event.timeStamp);
      this.updateInput(input, event);
      if (!input.hovering) {
        this.beginHover(input, event);
      }
    }
  };

  MousePositionGesture.prototype.onMouseLeave = function (this: MousePositionGesture, event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input !== null) {
      this.updateInput(input, event);
      this.endHover(input, event);
    }
  };

  MousePositionGesture.prototype.onMouseDown = function (this: MousePositionGesture, event: MouseEvent): void {
    const input = this.getOrCreateInput("mouse", "mouse", true, event.clientX, event.clientY, event.timeStamp);
    this.updateInput(input, event);
    if (!input.pressing) {
      this.beginPress(input, event);
    }
    if (event.button !== 0) {
      this.cancelPress(input, event);
    }
  };

  MousePositionGesture.prototype.onMouseMove = function (this: MousePositionGesture, event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input !== null) {
      this.updateInput(input, event);
      this.movePress(input, event);
    }
  };

  MousePositionGesture.prototype.onMouseUp = function (this: MousePositionGesture, event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input !== null) {
      this.updateInput(input, event);
      this.endPress(input, event);
      if (!input.defaultPrevented && event.button === 0) {
        this.press(input, event);
      }
    }
  };

  MousePositionGesture.prototype.onMouseLeaveDocument = function (this: MousePositionGesture, event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input !== null) {
      this.updateInput(input, event);
      this.cancelPress(input, event);
      this.endHover(input, event);
    }
  };

  MousePositionGesture.construct = function <G extends MousePositionGesture<any, any>>(gestureClass: PositionGestureClass<MousePositionGesture<any, any>>, gesture: G | null, owner: FastenerOwner<G>): G {
    gesture = _super.construct(gestureClass, gesture, owner) as G;
    gesture.onMouseEnter = gesture.onMouseEnter.bind(gesture);
    gesture.onMouseLeave = gesture.onMouseLeave.bind(gesture);
    gesture.onMouseDown = gesture.onMouseDown.bind(gesture);
    gesture.onMouseMove = gesture.onMouseMove.bind(gesture);
    gesture.onMouseUp = gesture.onMouseUp.bind(gesture);
    gesture.onMouseLeaveDocument = gesture.onMouseLeaveDocument.bind(gesture);
    return gesture;
  };

  return MousePositionGesture;
})(PositionGesture);
