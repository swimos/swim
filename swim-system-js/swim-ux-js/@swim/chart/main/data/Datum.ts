// Copyright 2015-2020 SWIM.AI inc.
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

import {AnyLength} from "@swim/length";
import {AnyColor} from "@swim/color";
import {AnyFont} from "@swim/font";
import {ViewInit, View} from "@swim/view";

export type DatumCategory = "flat" | "increasing" | "decreasing" | "maxima" | "minima";

export type DatumLabelPlacement = "auto" | "above" | "below";

export interface AnyDatum<X, Y> extends ViewInit {
  x: X;
  y: Y;
  y2?: Y;
  r?: AnyLength | null;

  hitRadius?: number;

  category?: DatumCategory | null;

  color?: AnyColor | null;
  opacity?: number | null;

  labelPadding?: AnyLength | null;
  labelPlacement?: DatumLabelPlacement;

  font?: AnyFont | null;
  textColor?: AnyColor | null;

  label?: View | string | null;
}
