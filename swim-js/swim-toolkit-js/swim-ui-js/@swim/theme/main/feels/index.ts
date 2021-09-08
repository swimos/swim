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

import {Feel} from "../feel/Feel";
import {InterpolatedFeel} from "../feel/InterpolatedFeel";
import {BrightnessFeel} from "../feel/BrightnessFeel";
import {OpacityFeel} from "../feel/OpacityFeel";

Feel.ambient = new InterpolatedFeel("ambient");
Feel.default = new InterpolatedFeel("default");

Feel.primary = new InterpolatedFeel("primary");
Feel.secondary = new InterpolatedFeel("secondary");

Feel.unselected = new InterpolatedFeel("unselected");
Feel.selected = new InterpolatedFeel("selected");
Feel.disabled = new InterpolatedFeel("disabled");
Feel.inactive = new InterpolatedFeel("inactive");
Feel.warning = new InterpolatedFeel("warning");
Feel.alert = new InterpolatedFeel("alert");

Feel.darker = new BrightnessFeel("darker");
Feel.lighter = new BrightnessFeel("lighter");
Feel.contrasted = new BrightnessFeel("contrasted");

Feel.raised = new InterpolatedFeel("raised");
Feel.covered = new InterpolatedFeel("covered");

Feel.floating = new InterpolatedFeel("floating");
Feel.transparent = new InterpolatedFeel("transparent");
Feel.translucent = new OpacityFeel("translucent");
Feel.embossed = new BrightnessFeel("embossed");
Feel.nested = new BrightnessFeel("nested");
Feel.hovering = new BrightnessFeel("hovering");

Feel.navigating = new InterpolatedFeel("navigating");
