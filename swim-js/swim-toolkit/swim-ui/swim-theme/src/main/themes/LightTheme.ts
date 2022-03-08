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

Theme.light = (function (): ThemeMatrix {
  const font = Font.parse("14px -apple-system, system-ui, sans-serif");

  const textColor = Color.parse("#000000");
  const iconColor = Color.parse("#4a4a4a");
  const labelColor = Color.parse("#000000").alpha(0.85);
  const legendColor = Color.parse("#000000").alpha(0.5);
  const placeholderColor = Color.parse("#000000").alpha(0.25);
  const highlightColor = Color.black(0.05);

  const accentColor = Color.parse("#5c5d5e");
  const primaryColor = Color.parse("#18bdb0");
  const secondaryColor = Color.parse("#47b0ec");

  const disabledColor = Color.parse("#7b7c7d");
  const inactiveColor = Color.parse("#7b7c7d");
  const warningColor = Color.parse("#fec309");
  const alertColor = Color.parse("#fc2125");

  const backgroundColor = Color.parse("#f9f9f9");
  const borderColor = Color.parse("#000000").alpha(0.1);

  const raisedColor = Color.parse("#f1f1f1");
  const coveredColor = Color.parse("#ffffff");

  const etchColor = Color.parse("#d8d8d8");
  const maskColor = Color.parse("#dcdcdc");
  const tickColor = Color.parse("#262626");
  const gridColor = Color.parse("#e0e0e0");

  const spacing = Length.px(10);

  const ambientFeel = FeelVector.of(
    [Look.font, font],

    [Look.textColor, textColor],
    [Look.iconColor, iconColor],
    [Look.labelColor, labelColor],
    [Look.legendColor, legendColor],
    [Look.placeholderColor, placeholderColor],
    [Look.highlightColor, highlightColor],

    [Look.statusColor, textColor],
    [Look.accentColor, accentColor],

    [Look.backgroundColor, backgroundColor],
    [Look.borderColor, borderColor],

    [Look.etchColor, etchColor],
    [Look.maskColor, maskColor],
    [Look.tickColor, tickColor],
    [Look.gridColor, gridColor],

    [Look.spacing, spacing],
    [Look.timing, Easing.linear.withDuration(1000)],
  );

  const defaultFeel = FeelVector.of(
    [Look.font, font],

    [Look.textColor, textColor],
    [Look.iconColor, iconColor],
    [Look.labelColor, labelColor],
    [Look.legendColor, legendColor],
    [Look.placeholderColor, placeholderColor],
    [Look.highlightColor, highlightColor],

    [Look.statusColor, textColor],
    [Look.accentColor, accentColor],

    [Look.backgroundColor, backgroundColor],
    [Look.borderColor, borderColor],

    [Look.etchColor, etchColor],
    [Look.maskColor, maskColor],
    [Look.tickColor, tickColor],
    [Look.gridColor, gridColor],

    [Look.spacing, spacing],
    [Look.timing, Easing.cubicOut.withDuration(250)],
  );

  const primaryFeel = FeelVector.of(
    [Look.accentColor, primaryColor],
  );

  const secondaryFeel = FeelVector.of(
    [Look.accentColor, secondaryColor],
  );

  const unselectedFeel = FeelVector.of(
    [Look.textColor, labelColor],
    [Look.iconColor, labelColor],
    [Look.backgroundColor, backgroundColor.darker(1 / 2)],
  );

  const selectedFeel = FeelVector.of(
    [Look.textColor, textColor],
    [Look.iconColor, iconColor],
    [Look.backgroundColor, backgroundColor.darker(1 / 2)],
  );

  const disabledFeel = FeelVector.of(
    [Look.textColor, disabledColor],
    [Look.iconColor, disabledColor],
    [Look.statusColor, disabledColor],
    [Look.accentColor, disabledColor],
  );

  const inactiveFeel = FeelVector.of(
    [Look.statusColor, inactiveColor],
    [Look.accentColor, inactiveColor],
  );

  const warningFeel = FeelVector.of(
    [Look.statusColor, warningColor],
    [Look.accentColor, warningColor],
  );

  const alertFeel = FeelVector.of(
    [Look.statusColor, alertColor],
    [Look.accentColor, alertColor],
  );

  const raisedFeel = FeelVector.of(
    [Look.labelColor, labelColor.darker(1 / 3)],
    [Look.legendColor, legendColor.darker(1 / 3)],
    [Look.backgroundColor, raisedColor],
  );

  const coveredFeel = FeelVector.of(
    [Look.labelColor, labelColor.darker(1 / 3)],
    [Look.legendColor, legendColor.darker(1 / 3)],
    [Look.backgroundColor, coveredColor],
  );

  const opaqueFeel = FeelVector.of(
    [Look.backgroundColor, backgroundColor],
    [Look.borderColor, borderColor],
  );

  const floatingFeel = FeelVector.of(
    [Look.shadow, BoxShadow.create(0, 2, 4, 0, Color.black(0.5))],
  );

  const transparentFeel = FeelVector.of(
    [Look.backgroundColor, backgroundColor.alpha(0)],
    [Look.borderColor, borderColor.alpha(0)],
  );

  const translucentFeel = FeelVector.of(
    [Look.iconColor, Color.black(0.8)],
    [Look.statusColor, Color.black(0.8)],
    [Look.accentColor, Color.black(0.8)],
    [Look.backgroundColor, Color.black(0.8)],
    [Look.borderColor, Color.black(0.8)],
  );

  const darkerFeel = FeelVector.of(
    [Look.iconColor, Color.black(1)],
    [Look.statusColor, Color.black(1)],
    [Look.accentColor, Color.black(1)],
    [Look.etchColor, Color.black(1)],
    [Look.maskColor, Color.black(1)],
  );

  const lighterFeel = FeelVector.of(
    [Look.iconColor, Color.black(-1)],
    [Look.statusColor, Color.black(-1)],
    [Look.accentColor, Color.black(-1)],
    [Look.etchColor, Color.black(-1)],
    [Look.maskColor, Color.black(-1)],
  );

  const contrastedFeel = FeelVector.of(
    [Look.iconColor, Color.black(1)],
    [Look.statusColor, Color.black(1)],
    [Look.accentColor, Color.black(1)],
    [Look.etchColor, Color.black(1)],
    [Look.maskColor, Color.black(1)],
  );

  const embossedFeel = FeelVector.of(
    [Look.iconColor, Color.black(1)],
    [Look.statusColor, Color.black(1)],
    [Look.accentColor, Color.black(1)],
  );

  const nestedFeel = FeelVector.of(
    [Look.backgroundColor, Color.black(1 / 24)],
    [Look.borderColor, Color.black(1 / 24)],
  );

  const hoveringFeel = FeelVector.of(
    [Look.backgroundColor, Color.black(1 / 4)],
    [Look.etchColor, Color.black(1 / 4)],
    [Look.maskColor, Color.black(1 / 4)],
  );

  const navigatingFeel = FeelVector.of(
    [Look.timing, Easing.cubicOut.withDuration(350)],
  );

  const theme = ThemeMatrix.forCols(
    [Feel.ambient, ambientFeel],
    [Feel.default, defaultFeel],

    [Feel.primary, primaryFeel],
    [Feel.secondary, secondaryFeel],

    [Feel.unselected, unselectedFeel],
    [Feel.selected, selectedFeel],
    [Feel.disabled, disabledFeel],
    [Feel.inactive, inactiveFeel],
    [Feel.warning, warningFeel],
    [Feel.alert, alertFeel],

    [Feel.darker, darkerFeel],
    [Feel.lighter, lighterFeel],
    [Feel.contrasted, contrastedFeel],

    [Feel.raised, raisedFeel],
    [Feel.covered, coveredFeel],

    [Feel.opaque, opaqueFeel],
    [Feel.floating, floatingFeel],
    [Feel.transparent, transparentFeel],
    [Feel.translucent, translucentFeel],
    [Feel.embossed, embossedFeel],
    [Feel.nested, nestedFeel],
    [Feel.hovering, hoveringFeel],

    [Feel.navigating, navigatingFeel],
  );

  return theme;
})();
