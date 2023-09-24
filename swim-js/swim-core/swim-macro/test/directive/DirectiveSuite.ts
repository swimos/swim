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
import {DefineDirectiveSpec} from "./DefineDirectiveSpec";
import {IncludeDirectiveSpec} from "./IncludeDirectiveSpec";
import {TemplateDirectiveSpec} from "./TemplateDirectiveSpec";
import {ConvertDirectiveSpec} from "./ConvertDirectiveSpec";
import {ExportDirectiveSpec} from "./ExportDirectiveSpec";
import {IfDirectiveSpec} from "./IfDirectiveSpec";
import {EachDirectiveSpec} from "./EachDirectiveSpec";
import {HighlightDirectiveSpec} from "./HighlightDirectiveSpec";

export class DirectiveSuite extends Suite {
  @Unit
  defineDirectiveSpec(): Suite {
    return new DefineDirectiveSpec();
  }

  @Unit
  includeDirectiveSpec(): Suite {
    return new IncludeDirectiveSpec();
  }

  @Unit
  templateDirectiveSpec(): Suite {
    return new TemplateDirectiveSpec();
  }

  @Unit
  convertDirectiveSpec(): Suite {
    return new ConvertDirectiveSpec();
  }

  @Unit
  exportDirectiveSpec(): Suite {
    return new ExportDirectiveSpec();
  }

  @Unit
  ifDirectiveSpec(): Suite {
    return new IfDirectiveSpec();
  }

  @Unit
  eachDirectiveSpec(): Suite {
    return new EachDirectiveSpec();
  }

  @Unit
  highlightDirectiveSpec(): Suite {
    return new HighlightDirectiveSpec();
  }
}
