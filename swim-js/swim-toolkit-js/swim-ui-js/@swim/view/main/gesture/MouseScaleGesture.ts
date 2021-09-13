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

import type {View} from "../View";
import type {GestureContext} from "./GestureContext";
import type {ScaleGestureInput} from "./ScaleGestureInput";
import {ScaleGesture} from "./ScaleGesture";

export class MouseScaleGesture<G extends GestureContext, V extends View, X, Y> extends ScaleGesture<G, V, X, Y> {
  constructor(owner: G, gestureName: string | undefined) {
    super(owner, gestureName);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseLeaveDocument = this.onMouseLeaveDocument.bind(this);
    this.onWheel = this.onWheel.bind(this);
  }

  /** @hidden */
  override attachHoverEvents(view: V): void {
    view.on("mouseenter", this.onMouseEnter as EventListener);
    view.on("mouseleave", this.onMouseLeave as EventListener);
    view.on("mousedown", this.onMouseDown as EventListener);
    view.on("wheel", this.onWheel as EventListener);
  }

  /** @hidden */
  override detachHoverEvents(view: V): void {
    view.off("mouseenter", this.onMouseEnter as EventListener);
    view.off("mouseleave", this.onMouseLeave as EventListener);
    view.off("mousedown", this.onMouseDown as EventListener);
    view.off("wheel", this.onWheel as EventListener);
  }

  /** @hidden */
  override attachPressEvents(view: V): void {
    document.body.addEventListener("mousemove", this.onMouseMove);
    document.body.addEventListener("mouseup", this.onMouseUp);
    document.body.addEventListener("mouseleave", this.onMouseLeaveDocument);
  }

  /** @hidden */
  override detachPressEvents(view: V): void {
    document.body.removeEventListener("mousemove", this.onMouseMove);
    document.body.removeEventListener("mouseup", this.onMouseUp);
    document.body.removeEventListener("mouseleave", this.onMouseLeaveDocument);
  }

  protected updateInput(input: ScaleGestureInput<X, Y>, event: MouseEvent): void {
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
  }

  protected onMouseEnter(event: MouseEvent): void {
    if (event.buttons === 0) {
      const input = this.getOrCreateInput("mouse", "mouse", true,
                                          event.clientX, event.clientY, event.timeStamp);
      if (!input.coasting) {
        this.updateInput(input, event);
      }
      if (!input.hovering) {
        this.beginHover(input, event);
      }
    }
  }

  protected onMouseLeave(event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input !== null) {
      if (!input.coasting) {
        this.updateInput(input, event);
      }
      this.endHover(input, event);
    }
  }

  protected onMouseDown(event: MouseEvent): void {
    const input = this.getOrCreateInput("mouse", "mouse", true,
                                        event.clientX, event.clientY, event.timeStamp);
    this.updateInput(input, event);
    if (!input.pressing) {
      this.beginPress(input, event);
    }
    if (event.button !== 0) {
      this.cancelPress(input, event);
    }
  }

  protected onMouseMove(event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input !== null) {
      this.updateInput(input, event);
      this.movePress(input, event);
    }
  }

  protected onMouseUp(event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input !== null) {
      this.updateInput(input, event);
      this.endPress(input, event);
      if (!input.defaultPrevented && event.button === 0) {
        this.press(input, event);
      }
    }
  }

  protected onMouseLeaveDocument(event: MouseEvent): void {
    const input = this.getInput("mouse");
    if (input !== null) {
      this.updateInput(input, event);
      this.cancelPress(input, event);
      this.endHover(input, event);
    }
  }

  protected onWheel(event: WheelEvent): void {
    if (this.wheel) {
      event.preventDefault();
      this.zoom(event.clientX, event.clientY, event.deltaY, event);
    }
  }
}
