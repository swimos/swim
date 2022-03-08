// Copyright 2015-2022 Swim.inc
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

Theme.dark = (function (): ThemeMatrix {
  const font = Font.parse("14px -apple-system, system-ui, sans-serif");

  const textColor = Color.parse("#ffffff");
  const iconColor = Color.parse("#ffffff");
  const labelColor = Color.parse("#ffffff").alpha(0.85);
  const legendColor = Color.parse("#ffffff").alpha(0.55);
  const placeholderColor = Color.parse("#ffffff").alpha(0.25);
  const highlightColor = Color.white(0.1);

  const accentColor = Color.parse("#6c6d6e");
  const primaryColor = Color.parse("#66ffdd");
  const secondaryColor = Color.parse("#32c5ff");

  const disabledColor = Color.parse("#7b7c7d");
  const inactiveColor = Color.parse("#7b7c7d");
  const warningColor = Color.parse("#f9f070");
  const alertColor = Color.parse("#f6511d");

  const backgroundColor = Color.parse("#181818");
  const borderColor = Color.parse("#ffffff").alpha(0.1);

  const raisedColor = Color.parse("#212121");
  const coveredColor = Color.parse("#363636");

  const etchColor = Color.parse("#262626");
  const maskColor = Color.parse("#343434");
  const tickColor = Color.parse("#c0c0c0");
  const gridColor = Color.parse("#3c3c3c");

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
    [Look.backgroundColor, backgroundColor.darker(1)],
  );

  const selectedFeel = FeelVector.of(
    [Look.textColor, textColor],
    [Look.iconColor, iconColor],
    [Look.backgroundColor, backgroundColor.darker(1)],
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
    [Look.iconColor, Color.black(-1)],
    [Look.statusColor, Color.black(-1)],
    [Look.accentColor, Color.black(-1)],
    [Look.etchColor, Color.black(-1)],
    [Look.maskColor, Color.black(-1)],
  );

  const embossedFeel = FeelVector.of(
    [Look.iconColor, Color.black(2)],
    [Look.statusColor, Color.black(2)],
    [Look.accentColor, Color.black(2)],
  );

  const nestedFeel = FeelVector.of(
    [Look.backgroundColor, Color.black(1 / 3)],
    [Look.borderColor, Color.black(1 / 3)],
  );

  const hoveringFeel = FeelVector.of(
    [Look.backgroundColor, Color.black(-2)],
    [Look.etchColor, Color.black(-1)],
    [Look.maskColor, Color.black(-1)],
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
