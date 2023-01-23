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

import type {MoodVector} from "./MoodVector";

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
