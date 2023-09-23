// Copyright 2015-2023 Nstream, inc.
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

import type {Color} from "@swim/style";
import type {Look} from "@swim/theme";
import type {Feel} from "@swim/theme";
import type {MoodVectorUpdates} from "@swim/theme";
import type {MoodVector} from "@swim/theme";
import type {MoodMatrix} from "@swim/theme";
import type {ThemeMatrix} from "@swim/theme";
import {Icon} from "./Icon";

/** @public */
export abstract class FilledIcon extends Icon {
  abstract readonly fillColor: Color | null;

  abstract withFillColor(fillColor: Color | null): FilledIcon;

  abstract readonly fillLook: Look<Color> | null;

  abstract withFillLook(fillLook: Look<Color> | null): FilledIcon;

  abstract override withMoodModifier(moodModifier: MoodMatrix | null): FilledIcon;

  abstract override modifyMood(feel: Feel, updates: MoodVectorUpdates<Feel>): FilledIcon;

  abstract override withTheme(theme: ThemeMatrix, mood: MoodVector): FilledIcon;
}
