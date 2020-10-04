// Copyright 2015-2020 Swim inc.
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

import {Length} from "@swim/length";
import {Color} from "@swim/color";
import {Font} from "@swim/font";
import {BoxShadow} from "@swim/shadow";
import {Ease, Transition} from "@swim/transition";
import {Look} from "../look/Look";
import {Feel} from "../feel/Feel";
import {FeelVector} from "../feel/FeelVector";
import {Theme} from "../theme/Theme";
import {ThemeMatrix} from "../theme/ThemeMatrix";

const DarkFont = Font.parse("14px -apple-system, system-ui, sans-serif");

const DarkColor = Color.parse("#d8d8d8");
const DarkAccentColor = Color.parse("#6c6d6e");
const DarkMutedColor = Color.parse("#989898");
const DarkNeutralColor = Color.parse("#808080");
const DarkHighlightColor = Color.white(0.1);

const DarkBackgroundColor = Color.parse("#1e2022");
const DarkBorderColor = DarkBackgroundColor.lighter(2 / 3);

const DarkPrimaryColor = Color.parse("#66ffdd");
const DarkSecondaryColor = Color.parse("#32c5ff");

const DarkOverlayColor = Color.parse("#26282a");
const DarkDisabledColor = Color.parse("#7b7c7d");
const DarkInactiveColor = Color.parse("#7b7c7d");
const DarkWarningColor = Color.parse("#f9f070");
const DarkAlertColor = Color.parse("#f6511d");

const DarkSpacing = Length.px(10);
const DarkTransition = Transition.duration(250, Ease.cubicOut);

const DarkAmbient = FeelVector.of(
  [Look.font, DarkFont],

  [Look.color, DarkColor],
  [Look.statusColor, DarkColor],
  [Look.accentColor, DarkAccentColor],
  [Look.mutedColor, DarkMutedColor],
  [Look.neutralColor, DarkNeutralColor],
  [Look.highlightColor, DarkHighlightColor],

  [Look.backgroundColor, DarkBackgroundColor],
  [Look.borderColor, DarkBorderColor],

  [Look.spacing, DarkSpacing],
  [Look.transition, Transition.duration(1000, Ease.linear)],
);

const DarkDefault = FeelVector.of(
  [Look.font, DarkFont],

  [Look.color, DarkColor],
  [Look.statusColor, DarkColor],
  [Look.accentColor, DarkAccentColor],
  [Look.mutedColor, DarkMutedColor],
  [Look.neutralColor, DarkNeutralColor],
  [Look.highlightColor, DarkHighlightColor],

  [Look.backgroundColor, DarkBackgroundColor],
  [Look.borderColor, DarkBorderColor],

  [Look.spacing, DarkSpacing],
  [Look.transition, DarkTransition],
);

const DarkPrimary = FeelVector.of(
  [Look.accentColor, DarkPrimaryColor],
);

const DarkSecondary = FeelVector.of(
  [Look.accentColor, DarkSecondaryColor],
);

const DarkSelected = FeelVector.of(
  [Look.backgroundColor, Color.black(1)],
);

const DarkDisabled = FeelVector.of(
  [Look.color, DarkDisabledColor],
  [Look.statusColor, DarkDisabledColor],
  [Look.accentColor, DarkDisabledColor],
);

const DarkInactive = FeelVector.of(
  [Look.statusColor, DarkInactiveColor],
  [Look.accentColor, DarkInactiveColor],
);

const DarkWarning = FeelVector.of(
  [Look.statusColor, DarkWarningColor],
  [Look.accentColor, DarkWarningColor],
);

const DarkAlert = FeelVector.of(
  [Look.statusColor, DarkAlertColor],
  [Look.accentColor, DarkAlertColor],
);

const DarkOverlay = FeelVector.of(
  [Look.mutedColor, DarkMutedColor.darker(1 / 3)],
  [Look.neutralColor, DarkNeutralColor.darker(1 / 3)],

  [Look.backgroundColor, DarkOverlayColor],
);

const DarkFloating = FeelVector.of(
  [Look.shadow, BoxShadow.of(0, 2, 4, 0, Color.black(0.5))],
);

const DarkTransparent = FeelVector.of(
  [Look.backgroundColor, DarkBackgroundColor.alpha(0)],
  [Look.borderColor, DarkBorderColor.alpha(0)],
);

const DarkTranslucent = FeelVector.of(
  [Look.statusColor, Color.black(0.8)],
  [Look.accentColor, Color.black(0.8)],

  [Look.backgroundColor, Color.black(0.8)],
  [Look.borderColor, Color.black(0.8)],
);

const DarkEmbossed = FeelVector.of(
  [Look.statusColor, Color.black(1)],
  [Look.accentColor, Color.black(1)],
);

const DarkNested = FeelVector.of(
  [Look.backgroundColor, Color.black(1 / 3)],
  [Look.borderColor, Color.black(1 / 3)],
);

const DarkHovering = FeelVector.of(
  [Look.statusColor, Color.black(1)],
  [Look.accentColor, Color.black(1)],

  [Look.backgroundColor, Color.black(-1)],
);

const DarkTheme = ThemeMatrix.forCols(
  [Feel.ambient, DarkAmbient],
  [Feel.default, DarkDefault],

  [Feel.primary, DarkPrimary],
  [Feel.secondary, DarkSecondary],

  [Feel.selected, DarkSelected],
  [Feel.disabled, DarkDisabled],
  [Feel.inactive, DarkInactive],
  [Feel.warning, DarkWarning],
  [Feel.alert, DarkAlert],

  [Feel.overlay, DarkOverlay],
  [Feel.floating, DarkFloating],
  [Feel.transparent, DarkTransparent],
  [Feel.translucent, DarkTranslucent],
  [Feel.embossed, DarkEmbossed],
  [Feel.nested, DarkNested],

  [Feel.hovering, DarkHovering],
);

Theme.dark = DarkTheme;
