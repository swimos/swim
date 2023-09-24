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
import {LengthParserSpec} from "./LengthParserSpec";
import {AngleParserSpec} from "./AngleParserSpec";
import {R2CurveParserSpec} from "./R2CurveParserSpec";
import {R2SplineBuilderSpec} from "./R2SplineBuilderSpec";
import {R2SplineParserSpec} from "./R2SplineParserSpec";
import {R2PathBuilderSpec} from "./R2PathBuilderSpec";
import {R2PathParserSpec} from "./R2PathParserSpec";
import {R2PathWriterSpec} from "./R2PathWriterSpec";
import {TransformParserSpec} from "./TransformParserSpec";

export class MathSuite extends Suite {
  @Unit
  lengthParserSpec(): Suite {
    return new LengthParserSpec();
  }

  @Unit
  angleParserSpec(): Suite {
    return new AngleParserSpec();
  }

  @Unit
  r2CurveParserSpec(): Suite {
    return new R2CurveParserSpec();
  }

  @Unit
  r2SplineBuilderSpec(): Suite {
    return new R2SplineBuilderSpec();
  }

  @Unit
  r2SplineParserSpec(): Suite {
    return new R2SplineParserSpec();
  }

  @Unit
  r2PathBuilderSpec(): Suite {
    return new R2PathBuilderSpec();
  }

  @Unit
  r2PathParserSpec(): Suite {
    return new R2PathParserSpec();
  }

  @Unit
  r2PathWriterSpec(): Suite {
    return new R2PathWriterSpec();
  }

  @Unit
  transformParserSpec(): Suite {
    return new TransformParserSpec();
  }
}
