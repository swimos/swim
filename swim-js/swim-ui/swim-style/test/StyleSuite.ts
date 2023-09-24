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
import {FontParserSpec} from "./FontParserSpec";
import {FontWriterSpec} from "./FontWriterSpec";
import {ColorParserSpec} from "./ColorParserSpec";
import {ColorStopSpec} from "./ColorStopSpec";
import {LinearGradientSpec} from "./LinearGradientSpec";
import {BoxShadowSpec} from "./BoxShadowSpec";
import {StyleValueSpec} from "./StyleValueSpec";

export class StyleSuite extends Suite {
  @Unit
  fontParserSpec(): Suite {
    return new FontParserSpec();
  }

  @Unit
  fontWriterSpec(): Suite {
    return new FontWriterSpec();
  }

  @Unit
  colorParserSpec(): Suite {
    return new ColorParserSpec();
  }

  @Unit
  colorStopSpec(): Suite {
    return new ColorStopSpec();
  }

  @Unit
  linearGradientSpec(): Suite {
    return new LinearGradientSpec();
  }

  @Unit
  boxShadowSpec(): Suite {
    return new BoxShadowSpec();
  }

  @Unit
  styleValueSpec(): Suite {
    return new StyleValueSpec();
  }
}
