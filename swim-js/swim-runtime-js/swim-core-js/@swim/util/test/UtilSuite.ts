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

import {Spec, Unit} from "@swim/unit";
import {RuntimeSuite} from "./runtime/RuntimeSuite";
import {InterpolateSuite} from "./interpolate/InterpolateSuite";
import {TransitionSuite} from "./transition/TransitionSuite";
import {ScaleSuite} from "./scale/ScaleSuite";

@Unit
export class UtilSuite extends Spec {
  @Unit
  runtimeSuite(): Spec {
    return new RuntimeSuite();
  }

  @Unit
  interpolateSuite(): Spec {
    return new InterpolateSuite();
  }

  @Unit
  transitionSuite(): Spec {
    return new TransitionSuite();
  }

  @Unit
  scaleSuite(): Spec {
    return new ScaleSuite();
  }
}
