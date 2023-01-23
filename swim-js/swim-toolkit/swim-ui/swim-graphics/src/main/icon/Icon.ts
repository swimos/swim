// Copyright 2015-2023 Swim.inc
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

import type {R2Box} from "@swim/math";
import type {Feel, MoodVectorUpdates, MoodVector, MoodMatrix, ThemeMatrix} from "@swim/theme";
import type {GraphicsRenderer} from "../graphics/GraphicsRenderer";
import type {Graphics} from "../graphics/Graphics";
import type {DrawingContext} from "../drawing/DrawingContext";
import type {PaintingContext} from "../painting/PaintingContext";

/** @public */
export abstract class Icon implements Graphics {
  abstract readonly moodModifier: MoodMatrix | null;

  abstract withMoodModifier(moodModifier: MoodMatrix | null): Icon;

  abstract modifyMood(feel: Feel, updates: MoodVectorUpdates<Feel>): Icon;

  abstract isThemed(): boolean;

  abstract withTheme(theme: ThemeMatrix, mood: MoodVector): Icon;

  abstract render(renderer: GraphicsRenderer, frame: R2Box): void;

  abstract paint(context: PaintingContext, frame: R2Box): void;

  abstract draw(context: DrawingContext, frame: R2Box): void;
}
