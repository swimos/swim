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

import {MoodVector} from "./MoodVector";
import {Feel} from "./Feel";

/** @public */
export interface Mood {
  readonly name: string;
}

/** @public */
export const Mood = {} as {
  ambient: MoodVector; // defined by moods
  default: MoodVector; // defined by moods

  primary: MoodVector; // defined by moods
  secondary: MoodVector; // defined by moods
  disabled: MoodVector; // defined by moods
  inactive: MoodVector; // defined by moods
  warning: MoodVector; // defined by moods
  alert: MoodVector; // defined by moods

  unselected: MoodVector; // defined by moods
  selected: MoodVector; // defined by moods

  darker: MoodVector; // defined by moods
  lighter: MoodVector; // defined by moods
  contrasted: MoodVector; // defined by moods

  raised: MoodVector; // defined by moods
  covered: MoodVector; // defined by moods

  opaque: MoodVector; // defined by moods
  floating: MoodVector; // defined by moods
  transparent: MoodVector; // defined by moods
  translucent: MoodVector; // defined by moods
  embossed: MoodVector; // defined by moods
  nested: MoodVector; // defined by moods
  hovering: MoodVector; // defined by moods

  navigating: MoodVector; // defined by moods
};

Mood.ambient = MoodVector.of([Feel.ambient, 1]);
Mood.default = MoodVector.of([Feel.default, 1]);

Mood.primary = MoodVector.of([Feel.primary, 1]);
Mood.secondary = MoodVector.of([Feel.secondary, 1]);
Mood.disabled = MoodVector.of([Feel.disabled, 1]);
Mood.inactive = MoodVector.of([Feel.inactive, 1]);
Mood.warning = MoodVector.of([Feel.warning, 1]);
Mood.alert = MoodVector.of([Feel.alert, 1]);

Mood.unselected = MoodVector.of([Feel.unselected, 1]);
Mood.selected = MoodVector.of([Feel.selected, 1]);

Mood.darker = MoodVector.of([Feel.darker, 1]);
Mood.lighter = MoodVector.of([Feel.lighter, 1]);
Mood.contrasted = MoodVector.of([Feel.contrasted, 1]);

Mood.raised = MoodVector.of([Feel.raised, 1]);
Mood.covered = MoodVector.of([Feel.covered, 1]);

Mood.opaque = MoodVector.of([Feel.opaque, 1]);
Mood.floating = MoodVector.of([Feel.floating, 1]);
Mood.transparent = MoodVector.of([Feel.transparent, 1]);
Mood.translucent = MoodVector.of([Feel.translucent, 1]);
Mood.embossed = MoodVector.of([Feel.embossed, 1]);
Mood.nested = MoodVector.of([Feel.nested, 1]);
Mood.hovering = MoodVector.of([Feel.hovering, 1]);

Mood.navigating = MoodVector.of([Feel.navigating, 1]);
