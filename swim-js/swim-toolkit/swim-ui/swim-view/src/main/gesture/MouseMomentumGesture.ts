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
import type {MomentumGestureInput} from "./MomentumGestureInput";
import {MomentumGestureClass, MomentumGestureFactory, MomentumGesture} from "./MomentumGesture";
import type {View} from "../view/View";

/** @internal */
export interface MouseMomentumGesture<O = unknown, V extends View = View> extends MomentumGesture<O, V> {
  /** @internal @protected @override */
  attachHoverEvents(view: V): void;

  /** @internal @protected @override */
  detachHoverEvents(view: V): void;

  /** @internal @protected @override */
  attachPressEvents(view: V): void;

  /** @internal @protected @override */
  detachPressEvents(view: V): void;

  /** @internal @protected */
  updateInput(input: MomentumGestureInput, event: MouseEvent): void;

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
export const MouseMomentumGesture = (function (_super: typeof MomentumGesture) {
  const MouseMomentumGesture = _super.extend("MouseMomentumGesture") as MomentumGestureFactory<MouseMomentumGesture<any, any>>;

  MouseMomentumGesture.prototype.attachHoverEvents = function (this: MouseMomentumGesture, view: View): void {
    view.on("mouseenter", this.onMouseEnter as EventListener);
    view.on("mouseleave", this.onMouseLeave as EventListener);
    view.on("mousedown", this.onMouseDown as EventListener);
  };

  MouseMomentumGesture.prototype.detachHoverEvents = function (this: MouseMomentumGesture, view: View): void {
    view.off("mouseenter", this.onMouseEnter as EventListener);
    view.off("mouseleave", this.onMouseLeave as EventListener);
    view.off("mousedown", this.onMouseDown as EventListener);
  };

  MouseMomentumGesture.prototype.attachPressEvents = function (this: MouseMomentumGesture, view: View): void {
    document.body.addEventListener("mousemove", this.onMouseMove);
    document.body.addEventListener("mouseup", this.onMouseUp);
    document.body.addEventListener("mouseleave", this.onMouseLeaveDocument);
  };

  MouseMomentumGesture.prototype.detachPressEvents = function (this: MouseMomentumGesture, view: View): void {
    document.body.removeEventListener("mousemove", this.onMouseMove);
    document.body.removeEventListener("mouseup", this.onMouseUp);
    document.body.removeEventListener("mouseleave", this.onMouseLeaveDocument);
  };

  MouseMomentumGesture.prototype.updateInput = function (this: MouseMomentumGesture, input: MomentumGestureInput, event: MouseEvent): void {
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
  };

  MouseMomentumGesture.prototype.onMouseEnter = function (this: MouseMomentumGesture, event: MouseEvent): void {
    if (event.buttons === 0) {
      const input = this.getOrCreateInput("mouse", "mouse", true, event.clientX, event.clientY, event.timeStamp);
      this.updateInput(input, event);
      if (!input.hovering) {
        this.beginHover(input, event);
      }
    }
  };

  MouseMomentumGesture.prototype.onMouseLeave = function (this: MouseMomentumGesture, event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input !== null) {
      this.updateInput(input, event);
      this.endHover(input, event);
    }
  };

  MouseMomentumGesture.prototype.onMouseDown = function (this: MouseMomentumGesture, event: MouseEvent): void {
    const input = this.getOrCreateInput("mouse", "mouse", true, event.clientX, event.clientY, event.timeStamp);
    this.updateInput(input, event);
    if (!input.pressing) {
      this.beginPress(input, event);
    }
    if (event.button !== 0) {
      this.cancelPress(input, event);
    }
  };

  MouseMomentumGesture.prototype.onMouseMove = function (this: MouseMomentumGesture, event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input !== null) {
      this.updateInput(input, event);
      this.movePress(input, event);
    }
  };

  MouseMomentumGesture.prototype.onMouseUp = function (this: MouseMomentumGesture, event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input !== null) {
      this.updateInput(input, event);
      this.endPress(input, event);
      if (!input.defaultPrevented && event.button === 0) {
        this.press(input, event);
      }
    }
  };

  MouseMomentumGesture.prototype.onMouseLeaveDocument = function (this: MouseMomentumGesture, event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input !== null) {
      this.updateInput(input, event);
      this.cancelPress(input, event);
      this.endHover(input, event);
    }
  };

  MouseMomentumGesture.construct = function <G extends MouseMomentumGesture<any, any>>(gestureClass: MomentumGestureClass<MouseMomentumGesture<any, any>>, gesture: G | null, owner: FastenerOwner<G>): G {
    gesture = _super.construct(gestureClass, gesture, owner) as G;
    gesture.onMouseEnter = gesture.onMouseEnter.bind(gesture);
    gesture.onMouseLeave = gesture.onMouseLeave.bind(gesture);
    gesture.onMouseDown = gesture.onMouseDown.bind(gesture);
    gesture.onMouseMove = gesture.onMouseMove.bind(gesture);
    gesture.onMouseUp = gesture.onMouseUp.bind(gesture);
    gesture.onMouseLeaveDocument = gesture.onMouseLeaveDocument.bind(gesture);
    return gesture;
  };

  return MouseMomentumGesture;
})(MomentumGesture);
