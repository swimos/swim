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

import type {GraphicsView} from "../graphics/GraphicsView";
import type {GraphicsEventInit, GraphicsEvent} from "./GraphicsEvent";

/** @public */
export interface GraphicsTouchInit extends TouchInit {
  targetView?: GraphicsView;
}

/** @public */
export interface GraphicsTouch extends Touch {
  targetView?: GraphicsView;
}

/** @public */
export interface GraphicsTouchList extends TouchList {
  /** @override */
  item(index: number): GraphicsTouch | null;

  /** @override */
  [index: number]: GraphicsTouch;
}

/** @public */
export interface GraphicsTouchEventInit extends TouchEventInit, GraphicsEventInit {
  targetViewTouches?: GraphicsTouchList;
}

/** @public */
export interface GraphicsTouchEvent extends TouchEvent, GraphicsEvent {
  targetViewTouches?: GraphicsTouchList;
}
