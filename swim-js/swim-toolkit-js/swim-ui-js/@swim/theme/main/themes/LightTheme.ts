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

import {Easing} from "@swim/util";
import {Length} from "@swim/math";
import {Font, Color, BoxShadow} from "@swim/style";
import {Look} from "../look/Look";
import {Feel} from "../feel/Feel";
import {FeelVector} from "../feel/FeelVector";
import {Theme} from "../theme/Theme";
import {ThemeMatrix} from "../theme/ThemeMatrix";

const LightFont = Font.parse("14px -apple-system, system-ui, sans-serif");

const LightColor = Color.parse("#4a4a4a");
const LightIconColor = Color.parse("#4a4a4a");
const LightAccentColor = Color.parse("#5c5d5e");
const LightMutedColor = Color.parse("#989898");
const LightNeutralColor = Color.parse("#808080");
const LightSubduedColor = Color.parse("#d7d6d5");
const LightFaintColor = Color.parse("#e0dedc");
const LightHighlightColor = Color.black(0.05);

const LightBackgroundColor = Color.parse("#f9f8f6");
const LightBorderColor = LightBackgroundColor.darker(1 / 2);

const LightRaisedColor = Color.parse("#f7f6f4");
const LightCoveredColor = Color.parse("#f1efed");

const LightPrimaryColor = Color.parse("#4fcfb3");
const LightSecondaryColor = Color.parse("#008cc7");

const LightDisabledColor = Color.parse("#7b7c7d");
const LightInactiveColor = Color.parse("#7b7c7d");
const LightWarningColor = Color.parse("#e6de65");
const LightAlertColor = Color.parse("#df4616");

const LightSpacing = Length.px(10);

const LightAmbient = FeelVector.of(
  [Look.font, LightFont],

  [Look.color, LightColor],
  [Look.iconColor, LightIconColor],
  [Look.statusColor, LightColor],
  [Look.accentColor, LightAccentColor],
  [Look.mutedColor, LightMutedColor],
  [Look.neutralColor, LightNeutralColor],
  [Look.subduedColor, LightSubduedColor],
  [Look.faintColor, LightFaintColor],
  [Look.highlightColor, LightHighlightColor],

  [Look.backgroundColor, LightBackgroundColor],
  [Look.borderColor, LightBorderColor],

  [Look.spacing, LightSpacing],
  [Look.timing, Easing.linear.withDuration(1000)],
);

const LightDefault = FeelVector.of(
  [Look.font, LightFont],

  [Look.color, LightColor],
  [Look.iconColor, LightIconColor],
  [Look.statusColor, LightColor],
  [Look.accentColor, LightAccentColor],
  [Look.mutedColor, LightMutedColor],
  [Look.neutralColor, LightNeutralColor],
  [Look.subduedColor, LightSubduedColor],
  [Look.faintColor, LightFaintColor],
  [Look.highlightColor, LightHighlightColor],

  [Look.backgroundColor, LightBackgroundColor],
  [Look.borderColor, LightBorderColor],

  [Look.spacing, LightSpacing],
  [Look.timing, Easing.cubicOut.withDuration(250)],
);

const LightPrimary = FeelVector.of(
  [Look.accentColor, LightPrimaryColor],
);

const LightSecondary = FeelVector.of(
  [Look.accentColor, LightSecondaryColor],
);

const LightUnselected = FeelVector.of(
  [Look.color, LightMutedColor],
  [Look.iconColor, LightMutedColor],
  [Look.backgroundColor, LightBackgroundColor.darker(1 / 2)],
);

const LightSelected = FeelVector.of(
  [Look.color, LightColor],
  [Look.iconColor, LightIconColor],
  [Look.backgroundColor, LightBackgroundColor.darker(1 / 2)],
);

const LightDisabled = FeelVector.of(
  [Look.color, LightDisabledColor],
  [Look.iconColor, LightDisabledColor],
  [Look.statusColor, LightDisabledColor],
  [Look.accentColor, LightDisabledColor],
);

const LightInactive = FeelVector.of(
  [Look.statusColor, LightInactiveColor],
  [Look.accentColor, LightInactiveColor],
);

const LightWarning = FeelVector.of(
  [Look.statusColor, LightWarningColor],
  [Look.accentColor, LightWarningColor],
);

const LightAlert = FeelVector.of(
  [Look.statusColor, LightAlertColor],
  [Look.accentColor, LightAlertColor],
);

const LightRaised = FeelVector.of(
  [Look.mutedColor, LightMutedColor.darker(1 / 3)],
  [Look.neutralColor, LightNeutralColor.darker(1 / 3)],

  [Look.backgroundColor, LightRaisedColor],
);

const LightCovered = FeelVector.of(
  [Look.mutedColor, LightMutedColor.darker(1 / 3)],
  [Look.neutralColor, LightNeutralColor.darker(1 / 3)],

  [Look.backgroundColor, LightCoveredColor],
);

const LightFloating = FeelVector.of(
  [Look.shadow, BoxShadow.create(0, 2, 4, 0, Color.black(0.5))],
);

const LightTransparent = FeelVector.of(
  [Look.backgroundColor, LightBackgroundColor.alpha(0)],
  [Look.borderColor, LightBorderColor.alpha(0)],
);

const LightTranslucent = FeelVector.of(
  [Look.iconColor, Color.black(0.8)],
  [Look.statusColor, Color.black(0.8)],
  [Look.accentColor, Color.black(0.8)],

  [Look.backgroundColor, Color.black(0.8)],
  [Look.borderColor, Color.black(0.8)],
);

const LightDarker = FeelVector.of(
  [Look.iconColor, Color.black(1)],
  [Look.statusColor, Color.black(1)],
  [Look.accentColor, Color.black(1)],
);

const LightLighter = FeelVector.of(
  [Look.iconColor, Color.black(-1)],
  [Look.statusColor, Color.black(-1)],
  [Look.accentColor, Color.black(-1)],
);

const LightContrasted = FeelVector.of(
  [Look.iconColor, Color.black(1)],
  [Look.statusColor, Color.black(1)],
  [Look.accentColor, Color.black(1)],
);

const LightEmbossed = FeelVector.of(
  [Look.iconColor, Color.black(1)],
  [Look.statusColor, Color.black(1)],
  [Look.accentColor, Color.black(1)],
);

const LightNested = FeelVector.of(
  [Look.backgroundColor, Color.black(1 / 24)],
  [Look.borderColor, Color.black(1 / 24)],
);

const LightHovering = FeelVector.of(
  [Look.statusColor, Color.black(1 / 4)],
  [Look.accentColor, Color.black(1 / 4)],

  [Look.backgroundColor, Color.black(1 / 4)],
);

const LightNavigating = FeelVector.of(
  [Look.timing, Easing.cubicOut.withDuration(350)],
);

const LightTheme = ThemeMatrix.forCols(
  [Feel.ambient, LightAmbient],
  [Feel.default, LightDefault],

  [Feel.primary, LightPrimary],
  [Feel.secondary, LightSecondary],

  [Feel.unselected, LightUnselected],
  [Feel.selected, LightSelected],
  [Feel.disabled, LightDisabled],
  [Feel.inactive, LightInactive],
  [Feel.warning, LightWarning],
  [Feel.alert, LightAlert],

  [Feel.darker, LightDarker],
  [Feel.lighter, LightLighter],
  [Feel.contrasted, LightContrasted],

  [Feel.raised, LightRaised],
  [Feel.covered, LightCovered],

  [Feel.floating, LightFloating],
  [Feel.transparent, LightTransparent],
  [Feel.translucent, LightTranslucent],
  [Feel.embossed, LightEmbossed],
  [Feel.nested, LightNested],
  [Feel.hovering, LightHovering],

  [Feel.navigating, LightNavigating],
);

Theme.light = LightTheme;
