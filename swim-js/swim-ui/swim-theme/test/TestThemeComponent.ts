// Copyright 2015-2024 Nstream, inc.
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

import {Property} from "@swim/component";
import {Component} from "@swim/component";
import type {Look} from "@swim/theme";
import type {Feel} from "@swim/theme";
import {MoodVector} from "@swim/theme";
import {ThemeMatrix} from "@swim/theme";
import type {ThemeContext} from "@swim/theme";

export class TestThemeComponent extends Component implements ThemeContext {
  @Property({valueType: MoodVector, value: null, inherits: true})
  readonly mood!: Property<this, MoodVector | null>;

  @Property({valueType: ThemeMatrix, value: null, inherits: true})
  readonly theme!: Property<this, ThemeMatrix | null>;

  getLook<T>(look: Look<T>, mood?: MoodVector<Feel> | null): T | undefined {
    const theme = this.theme.value;
    let value: T | undefined;
    if (theme !== null) {
      if (mood === void 0 || mood === null) {
        mood = this.mood.value;
      }
      if (mood !== null) {
        value = theme.get(look, mood);
      }
    }
    return value;
  }

  getLookOr<T, E>(look: Look<T>, elseValue: E): T | E;
  getLookOr<T, E>(look: Look<T>, mood: MoodVector<Feel> | null, elseValue: E): T | E;
  getLookOr<T, E>(look: Look<T>, mood: MoodVector<Feel> | null | E, elseValue?: E): T | E {
    if (arguments.length === 2) {
      elseValue = mood as E;
      mood = null;
    }
    const theme = this.theme.value;
    let value: T | E;
    if (theme !== null) {
      if (mood === void 0 || mood === null) {
        mood = this.mood.value;
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
