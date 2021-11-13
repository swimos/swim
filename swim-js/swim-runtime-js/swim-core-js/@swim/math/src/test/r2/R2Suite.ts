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
import {R2CurveParserSpec} from "./R2CurveParserSpec";
import {R2SplineBuilderSpec} from "./R2SplineBuilderSpec";
import {R2SplineParserSpec} from "./R2SplineParserSpec";
import {R2PathBuilderSpec} from "./R2PathBuilderSpec";
import {R2PathParserSpec} from "./R2PathParserSpec";
import {R2PathWriterSpec} from "./R2PathWriterSpec";

@Unit
export class R2Suite extends Spec {
  @Unit
  r2CurveParserSpec(): Spec {
    return new R2CurveParserSpec();
  }

  @Unit
  r2SplineBuilderSpec(): Spec {
    return new R2SplineBuilderSpec();
  }

  @Unit
  r2SplineParserSpec(): Spec {
    return new R2SplineParserSpec();
  }

  @Unit
  r2PathBuilderSpec(): Spec {
    return new R2PathBuilderSpec();
  }

  @Unit
  r2PathParserSpec(): Spec {
    return new R2PathParserSpec();
  }

  @Unit
  r2PathWriterSpec(): Spec {
    return new R2PathWriterSpec();
  }
}
