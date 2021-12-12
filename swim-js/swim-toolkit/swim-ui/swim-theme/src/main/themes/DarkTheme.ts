// Copyright 2015-2021 Swim.inc
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

import {Easing} from "@swim/util";
import {Length} from "@swim/math";
import {Font, Color, BoxShadow} from "@swim/style";
import {Look} from "../look/Look";
import {Feel} from "../feel/Feel";
import {FeelVector} from "../feel/FeelVector";
import {Theme} from "../theme/Theme";
import {ThemeMatrix} from "../theme/ThemeMatrix";

const DarkFont = Font.parse("14px -apple-system, system-ui, sans-serif");

const DarkColor = Color.parse("#d8d8d8");
const DarkIconColor = Color.parse("#d8d8d8");
const DarkAccentColor = Color.parse("#6c6d6e");
const DarkMutedColor = Color.parse("#989898");
const DarkNeutralColor = Color.parse("#808080");
const DarkSubduedColor = Color.parse("#28292a");
const DarkFaintColor = Color.parse("#1f2123");
const DarkHighlightColor = Color.white(0.1);

const DarkBackgroundColor = Color.parse("#161719");
const DarkBorderColor = DarkBackgroundColor.lighter(2 / 3);

const DarkRaisedColor = Color.parse("#18191b");
const DarkCoveredColor = Color.parse("#1e2022");

const DarkPrimaryColor = Color.parse("#66ffdd");
const DarkSecondaryColor = Color.parse("#32c5ff");

const DarkDisabledColor = Color.parse("#7b7c7d");
const DarkInactiveColor = Color.parse("#7b7c7d");
const DarkWarningColor = Color.parse("#f9f070");
const DarkAlertColor = Color.parse("#f6511d");

const DarkSpacing = Length.px(10);

const DarkAmbient = FeelVector.of(
  [Look.font, DarkFont],

  [Look.color, DarkColor],
  [Look.iconColor, DarkIconColor],
  [Look.statusColor, DarkColor],
  [Look.accentColor, DarkAccentColor],
  [Look.mutedColor, DarkMutedColor],
  [Look.neutralColor, DarkNeutralColor],
  [Look.subduedColor, DarkSubduedColor],
  [Look.faintColor, DarkFaintColor],
  [Look.highlightColor, DarkHighlightColor],

  [Look.backgroundColor, DarkBackgroundColor],
  [Look.borderColor, DarkBorderColor],

  [Look.spacing, DarkSpacing],
  [Look.timing, Easing.linear.withDuration(1000)],
);

const DarkDefault = FeelVector.of(
  [Look.font, DarkFont],

  [Look.color, DarkColor],
  [Look.iconColor, DarkIconColor],
  [Look.statusColor, DarkColor],
  [Look.accentColor, DarkAccentColor],
  [Look.mutedColor, DarkMutedColor],
  [Look.neutralColor, DarkNeutralColor],
  [Look.subduedColor, DarkSubduedColor],
  [Look.faintColor, DarkFaintColor],
  [Look.highlightColor, DarkHighlightColor],

  [Look.backgroundColor, DarkBackgroundColor],
  [Look.borderColor, DarkBorderColor],

  [Look.spacing, DarkSpacing],
  [Look.timing, Easing.cubicOut.withDuration(250)],
);

const DarkPrimary = FeelVector.of(
  [Look.accentColor, DarkPrimaryColor],
);

const DarkSecondary = FeelVector.of(
  [Look.accentColor, DarkSecondaryColor],
);

const DarkUnselected = FeelVector.of(
  [Look.color, DarkMutedColor],
  [Look.iconColor, DarkMutedColor],
  [Look.backgroundColor, DarkBackgroundColor.darker(1)],
);

const DarkSelected = FeelVector.of(
  [Look.color, DarkColor],
  [Look.iconColor, DarkIconColor],
  [Look.backgroundColor, DarkBackgroundColor.darker(1)],
);

const DarkDisabled = FeelVector.of(
  [Look.color, DarkDisabledColor],
  [Look.iconColor, DarkDisabledColor],
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

const DarkRaised = FeelVector.of(
  [Look.mutedColor, DarkMutedColor.darker(1 / 3)],
  [Look.neutralColor, DarkNeutralColor.darker(1 / 3)],

  [Look.backgroundColor, DarkRaisedColor],
);

const DarkCovered = FeelVector.of(
  [Look.mutedColor, DarkMutedColor.darker(1 / 3)],
  [Look.neutralColor, DarkNeutralColor.darker(1 / 3)],

  [Look.backgroundColor, DarkCoveredColor],
);

const DarkOpaque = FeelVector.of(
  [Look.backgroundColor, DarkBackgroundColor],
  [Look.borderColor, DarkBorderColor],
);

const DarkFloating = FeelVector.of(
  [Look.shadow, BoxShadow.create(0, 2, 4, 0, Color.black(0.5))],
);

const DarkTransparent = FeelVector.of(
  [Look.backgroundColor, DarkBackgroundColor.alpha(0)],
  [Look.borderColor, DarkBorderColor.alpha(0)],
);

const DarkTranslucent = FeelVector.of(
  [Look.iconColor, Color.black(0.8)],
  [Look.statusColor, Color.black(0.8)],
  [Look.accentColor, Color.black(0.8)],

  [Look.backgroundColor, Color.black(0.8)],
  [Look.borderColor, Color.black(0.8)],
);

const DarkDarker = FeelVector.of(
  [Look.iconColor, Color.black(1)],
  [Look.statusColor, Color.black(1)],
  [Look.accentColor, Color.black(1)],
);

const DarkLighter = FeelVector.of(
  [Look.iconColor, Color.black(-1)],
  [Look.statusColor, Color.black(-1)],
  [Look.accentColor, Color.black(-1)],
);

const DarkContrasted = FeelVector.of(
  [Look.iconColor, Color.black(-1)],
  [Look.statusColor, Color.black(-1)],
  [Look.accentColor, Color.black(-1)],
);

const DarkEmbossed = FeelVector.of(
  [Look.iconColor, Color.black(2)],
  [Look.statusColor, Color.black(2)],
  [Look.accentColor, Color.black(2)],
);

const DarkNested = FeelVector.of(
  [Look.backgroundColor, Color.black(1 / 3)],
  [Look.borderColor, Color.black(1 / 3)],
);

const DarkHovering = FeelVector.of(
  [Look.statusColor, Color.black(1)],
  [Look.accentColor, Color.black(1)],

  [Look.backgroundColor, Color.black(-2)],
);

const DarkNavigating = FeelVector.of(
  [Look.timing, Easing.cubicOut.withDuration(350)],
);

const DarkTheme = ThemeMatrix.forCols(
  [Feel.ambient, DarkAmbient],
  [Feel.default, DarkDefault],

  [Feel.primary, DarkPrimary],
  [Feel.secondary, DarkSecondary],

  [Feel.unselected, DarkUnselected],
  [Feel.selected, DarkSelected],
  [Feel.disabled, DarkDisabled],
  [Feel.inactive, DarkInactive],
  [Feel.warning, DarkWarning],
  [Feel.alert, DarkAlert],

  [Feel.darker, DarkDarker],
  [Feel.lighter, DarkLighter],
  [Feel.contrasted, DarkContrasted],

  [Feel.raised, DarkRaised],
  [Feel.covered, DarkCovered],

  [Feel.opaque, DarkOpaque],
  [Feel.floating, DarkFloating],
  [Feel.transparent, DarkTransparent],
  [Feel.translucent, DarkTranslucent],
  [Feel.embossed, DarkEmbossed],
  [Feel.nested, DarkNested],
  [Feel.hovering, DarkHovering],

  [Feel.navigating, DarkNavigating],
);

Theme.dark = DarkTheme;
