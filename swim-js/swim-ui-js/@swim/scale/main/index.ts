// Copyright 2015-2019 SWIM.AI inc.
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

export {
  ScaleType,
  Scale,
} from "./Scale";

export {ContinuousScale} from "./ContinuousScale";

export {LinearScale} from "./LinearScale";

export {TimeScale} from "./TimeScale";

export {ScaleForm} from "./ScaleForm";

export {ScaleInterpolator} from "./ScaleInterpolator";
export {LinearScaleInterpolator} from "./LinearScaleInterpolator";
export {TimeScaleInterpolator} from "./TimeScaleInterpolator";

import {ContinuousScale} from "./ContinuousScale";
import {ScaleInterpolator} from "./ScaleInterpolator";
declare module "@swim/interpolate" {
  namespace Interpolator {
    function scale<D extends DU, R extends RU, DU = D, RU = R>(s0?: ContinuousScale<D, R, DU, RU>, s1?: ContinuousScale<D, R, DU, RU>): ScaleInterpolator<D, R, DU, RU>;
  }
}
