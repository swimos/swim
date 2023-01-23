// Copyright 2015-2023 Swim.inc
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
import {FontParserSpec} from "./FontParserSpec";
import {FontWriterSpec} from "./FontWriterSpec";
import {ColorParserSpec} from "./ColorParserSpec";
import {ColorStopSpec} from "./ColorStopSpec";
import {LinearGradientSpec} from "./LinearGradientSpec";
import {BoxShadowSpec} from "./BoxShadowSpec";
import {StyleValueSpec} from "./StyleValueSpec";

@Unit
export class StyleSuite extends Spec {
  @Unit
  fontParserSpec(): Spec {
    return new FontParserSpec();
  }

  @Unit
  fontWriterSpec(): Spec {
    return new FontWriterSpec();
  }

  @Unit
  colorParserSpec(): Spec {
    return new ColorParserSpec();
  }

  @Unit
  colorStopSpec(): Spec {
    return new ColorStopSpec();
  }

  @Unit
  linearGradientSpec(): Spec {
    return new LinearGradientSpec();
  }

  @Unit
  boxShadowSpec(): Spec {
    return new BoxShadowSpec();
  }

  @Unit
  styleValueSpec(): Spec {
    return new StyleValueSpec();
  }
}
