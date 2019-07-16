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

import {Spec, Unit} from "@swim/unit";

import {LinearScaleSpec} from "./LinearScaleSpec";
import {TimeScaleSpec} from "./TimeScaleSpec";
import {ScaleInterpolatorSpec} from "./ScaleInterpolatorSpec";

@Unit
class ScaleSpec extends Spec {
  @Unit
  linearScaleSpec(): Spec {
    return new LinearScaleSpec();
  }

  @Unit
  timeScaleSpec(): Spec {
    return new TimeScaleSpec();
  }

  @Unit
  scaleInterpolatorSpec(): Spec {
    return new ScaleInterpolatorSpec();
  }
}

export {
  LinearScaleSpec,
  TimeScaleSpec,
  ScaleInterpolatorSpec,
  ScaleSpec,
};

ScaleSpec.run();
