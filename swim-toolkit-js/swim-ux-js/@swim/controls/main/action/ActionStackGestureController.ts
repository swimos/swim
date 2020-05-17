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

import {View} from "@swim/view";
import {GestureViewTrack, GestureView, GestureViewObserver} from "@swim/gesture";
import {ActionStack} from "./ActionStack";

export class ActionStackGestureController<V extends GestureView = GestureView> implements GestureViewObserver<V> {
  /** @hidden */
  _actionStack: ActionStack;

  constructor(actionStack: ActionStack) {
    this._actionStack = actionStack;
  }

  viewDidBeginTrack(track: GestureViewTrack, event: Event | null, view: V): void {
    // hook
  }

  viewDidHoldTrack(track: GestureViewTrack, view: V): void {
    this._actionStack.toggle();
    track.preventDefault();
  }

  viewDidMoveTrack(track: GestureViewTrack, event: Event | null, view: V): void {
    if (!track.defaultPrevented) {
      const actionStack = this._actionStack;
      if (actionStack.isCollapsed()) {
        const stackPhase = Math.min(Math.max(0, -track.dy / 100), 1);
        actionStack.stackPhase.setState(stackPhase);
        actionStack.requireUpdate(View.NeedsLayout);
        if (stackPhase > 0.1) {
          track.clearHoldTimer();
        }
      }
    }
  }

  viewDidEndTrack(track: GestureViewTrack, event: Event | null, view: V): void {
    if (!track.defaultPrevented) {
      const actionStack = this._actionStack;
      const stackPhase = actionStack.stackPhase.value!;
      if (track.dt < track.holdDelay) {
        if (stackPhase < 0.1 || actionStack.stackState === "expanded") {
          actionStack.collapse();
        } else {
          actionStack.expand();
        }
      } else {
        if (stackPhase < 0.5) {
          actionStack.collapse();
        } else if (stackPhase >= 0.5) {
          actionStack.expand();
        }
      }
    }
  }

  viewDidCancelTrack(track: GestureViewTrack, event: Event | null, view: V): void {
    const actionStack = this._actionStack;
    if (track.buttons === 2) {
      actionStack.toggle();
    } else {
      const stackPhase = actionStack.stackPhase.value!;
      if (stackPhase < 0.1 || actionStack.stackState === "expanded") {
        actionStack.collapse();
      } else {
        actionStack.expand();
      }
    }
  }
}
