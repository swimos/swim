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

import type {Look, Feel, MoodVector, ThemeMatrix, ThemeContext} from "@swim/theme";
import {DrawingRenderer} from "../drawing/DrawingRenderer";
import type {PaintingContext} from "./PaintingContext";

export abstract class PaintingRenderer extends DrawingRenderer implements ThemeContext {
  abstract override readonly context: PaintingContext;

  abstract readonly theme: ThemeMatrix | null;

  abstract readonly mood: MoodVector | null;

  /** @override */
  getLook<T>(look: Look<T, unknown>, mood?: MoodVector<Feel> | null): T | undefined {
    const theme = this.theme;
    let value: T | undefined;
    if (theme !== null) {
      if (mood === void 0 || mood === null) {
        mood = this.mood;
      }
      if (mood !== null) {
        value = theme.get(look, mood);
      }
    }
    return value;
  }

  /** @override */
  getLookOr<T, E>(look: Look<T, unknown>, elseValue: E): T | E;
  /** @override */
  getLookOr<T, E>(look: Look<T, unknown>, mood: MoodVector<Feel> | null, elseValue: E): T | E;
  getLookOr<T, E>(look: Look<T, unknown>, mood: MoodVector<Feel> | null | E, elseValue?: E): T | E {
    if (arguments.length === 2) {
      elseValue = mood as E;
      mood = null;
    }
    const theme = this.theme;
    let value: T | E;
    if (theme !== null) {
      if (mood === void 0 || mood === null) {
        mood = this.mood;
      }
      if (mood !== null) {
        value = theme.getOr(look, mood as MoodVector<Feel>, elseValue as E);
      } else {
        value = elseValue as E;
      }
    } else {
      value = elseValue as E;
    }
    return value;
  }
}
