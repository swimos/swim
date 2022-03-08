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

import {Look} from "../look/Look";
import {NumberLook} from "../look/NumberLook";
import {LengthLook} from "../look/LengthLook";
import {ColorLook} from "../look/ColorLook";
import {FontLook} from "../look/FontLook";
import {ShadowLook} from "../look/ShadowLook";
import {TimingLook} from "../look/TimingLook";

Look.font = new FontLook("font");

Look.textColor = new ColorLook("textColor");
Look.iconColor = new ColorLook("iconColor");
Look.labelColor = new ColorLook("labelColor");
Look.legendColor = new ColorLook("legendColor");
Look.placeholderColor = new ColorLook("placeholderColor");
Look.highlightColor = new ColorLook("highlightColor");

Look.statusColor = new ColorLook("statusColor");
Look.accentColor = new ColorLook("accentColor");

Look.backgroundColor = new ColorLook("backgroundColor");
Look.borderColor = new ColorLook("borderColor");

Look.etchColor = new ColorLook("etchColor");
Look.maskColor = new ColorLook("maskColor");
Look.tickColor = new ColorLook("tickColor");
Look.gridColor = new ColorLook("gridColor");

Look.opacity = new NumberLook("opacity");
Look.shadow = new ShadowLook("shadow");
Look.spacing = new LengthLook("spacing");
Look.timing = new TimingLook("timing");
