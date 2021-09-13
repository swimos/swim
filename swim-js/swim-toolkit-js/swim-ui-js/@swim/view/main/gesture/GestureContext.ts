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
import type {GestureConstructor, Gesture} from "./Gesture";

/** @hidden */
export interface GestureContextPrototype {
  /** @hidden */
  gestureConstructors?: {[gestureName: string]: GestureConstructor<GestureContext, View> | undefined};
}

export interface GestureContext {
  hasGesture(gestureName: string): boolean;

  getGesture(gestureName: string): Gesture<this, View> | null;

  setGesture(gestureName: string, gesture: Gesture<this, any> | null): void;

  /** @hidden */
  getLazyGesture(gestureName: string): Gesture<this, View> | null;
}

/** @hidden */
export const GestureContext = {} as {
  /** @hidden */
  initGestures(gestureContext: GestureContext): void;

  /** @hidden */
  getGestureConstructor(gestureName: string, gestureContextPrototype: GestureContextPrototype | null): GestureConstructor<GestureContext, any> | null;

  /** @hidden */
  decorateGesture(gestureConstructor: GestureConstructor<GestureContext, View>,
                  target: Object, propertyKey: string | symbol): void;
};

GestureContext.initGestures = function (gestureContext: GestureContext): void {
  let gestureContextPrototype: GestureContextPrototype | null = Object.getPrototypeOf(gestureContext) as GestureContextPrototype;
  do {
    if (Object.prototype.hasOwnProperty.call(gestureContextPrototype, "gestureConstructors")) {
      const gestureConstructors = gestureContextPrototype.gestureConstructors!;
      for (const gestureName in gestureConstructors) {
        const gestureConstructor = gestureConstructors[gestureName]!;
        if (gestureConstructor.prototype.self !== void 0 && !gestureContext.hasGesture(gestureName)) {
          const gesture = new gestureConstructor(gestureContext, gestureName);
          gestureContext.setGesture(gestureName, gesture);
        }
      }
    }
    gestureContextPrototype = Object.getPrototypeOf(gestureContextPrototype);
  } while (gestureContextPrototype !== null);
};

GestureContext.getGestureConstructor = function (gestureName: string, gestureContextPrototype: GestureContextPrototype | null): GestureConstructor<GestureContext, any> | null {
  while (gestureContextPrototype !== null) {
    if (Object.prototype.hasOwnProperty.call(gestureContextPrototype, "gestureConstructors")) {
      const gestureConstructor = gestureContextPrototype.gestureConstructors![gestureName];
      if (gestureConstructor !== void 0) {
        return gestureConstructor;
      }
    }
    gestureContextPrototype = Object.getPrototypeOf(gestureContextPrototype);
  }
  return null;
};

GestureContext.decorateGesture = function (gestureConstructor: GestureConstructor<GestureContext, View>,
                                           target: Object, propertyKey: string | symbol): void {
  const gestureContextPrototype = target as GestureContextPrototype;
  if (!Object.prototype.hasOwnProperty.call(gestureContextPrototype, "gestureConstructors")) {
    gestureContextPrototype.gestureConstructors = {};
  }
  gestureContextPrototype.gestureConstructors![propertyKey.toString()] = gestureConstructor;
  Object.defineProperty(target, propertyKey, {
    get: function (this: GestureContext): Gesture<GestureContext, View> {
      let gesture = this.getGesture(propertyKey.toString());
      if (gesture === null) {
        gesture = new gestureConstructor(this, propertyKey.toString());
        this.setGesture(propertyKey.toString(), gesture);
      }
      return gesture;
    },
    configurable: true,
    enumerable: true,
  });
};
