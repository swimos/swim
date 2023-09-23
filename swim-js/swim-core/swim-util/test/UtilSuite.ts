// Copyright 2015-2023 Nstream, inc.
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

import {Unit} from "@swim/unit";
import {Suite} from "@swim/unit";
import {Murmur3Spec} from "./Murmur3Spec";
import {LazySpec} from "./LazySpec";
import {PiecewiseSpec} from "./PiecewiseSpec";
import {InterpolatorSpec} from "./InterpolatorSpec";
import {TimingSpec} from "./TimingSpec";
import {EasingSpec} from "./EasingSpec";
import {TweeningSpec} from "./TweeningSpec";
import {LinearDomainSpec} from "./LinearDomainSpec";
import {LinearRangeSpec} from "./LinearRangeSpec";
import {LinearScaleSpec} from "./LinearScaleSpec";

export class UtilSuite extends Suite {
  // Runtime
  @Unit
  murmur3Spec(): Suite {
    return new Murmur3Spec();
  }

  @Unit
  lazySpec(): Suite {
    return new LazySpec();
  }

  // Mapping

  @Unit
  piecewiseSpec(): Suite {
    return new PiecewiseSpec();
  }

  // Interpolate

  @Unit
  interpolatorSpec(): Suite {
    return new InterpolatorSpec();
  }

  // Transition

  @Unit
  timingSpec(): Suite {
    return new TimingSpec();
  }

  @Unit
  easingSpec(): Suite {
    return new EasingSpec();
  }

  @Unit
  tweeningSpec(): Suite {
    return new TweeningSpec();
  }

  // Scale

  @Unit
  linearDomainSpec(): Suite {
    return new LinearDomainSpec();
  }

  @Unit
  linearRangeSpec(): Suite {
    return new LinearRangeSpec();
  }

  @Unit
  linearScaleSpec(): Suite {
    return new LinearScaleSpec();
  }
}
