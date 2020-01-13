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

import {Spec, Unit} from "@swim/unit";

import {BoxShadowSpec} from "./BoxShadowSpec";
import {StyleValueSpec} from "./StyleValueSpec";
import {InterpolatorFormSpec} from "./InterpolatorFormSpec";
import {ScaleFormSpec} from "./ScaleFormSpec";
import {TransitionFormSpec} from "./TransitionFormSpec";

@Unit
class StyleSpec extends Spec {
  @Unit
  boxShadowSpec(): Spec {
    return new BoxShadowSpec();
  }

  @Unit
  styleValueSpec(): Spec {
    return new StyleValueSpec();
  }

  @Unit
  interpolatorFormSpec(): Spec {
    return new InterpolatorFormSpec();
  }

  @Unit
  scaleFormSpec(): Spec {
    return new ScaleFormSpec();
  }

  @Unit
  transitionFormSpec(): Spec {
    return new TransitionFormSpec();
  }
}

export {
  BoxShadowSpec,
  StyleValueSpec,
  InterpolatorFormSpec,
  ScaleFormSpec,
  TransitionFormSpec,
  StyleSpec,
};

StyleSpec.run();
