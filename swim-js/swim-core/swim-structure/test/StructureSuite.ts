// Copyright 2015-2024 Nstream, inc.
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
import {ItemOrderSpec} from "./ItemOrderSpec";
import {RecordMapSpec} from "./RecordMapSpec";
import {RecordMapViewSpec} from "./RecordMapViewSpec";
import {SelectorSpec} from "./SelectorSpec";
import {OperatorSpec} from "./OperatorSpec";
import {InterpolatorSpec} from "./InterpolatorSpec";
import {FuncSuite} from "./func/FuncSuite";
import {FormSuite} from "./form/FormSuite";

export class StructureSuite extends Suite {
  @Unit
  itemOrderSpec(): Suite {
    return new ItemOrderSpec();
  }

  @Unit
  recordMapSpec(): Suite {
    return new RecordMapSpec();
  }

  @Unit
  recordMapViewSpec(): Suite {
    return new RecordMapViewSpec();
  }

  @Unit
  selectorSpec(): Suite {
    return new SelectorSpec();
  }

  @Unit
  operatorSpec(): Suite {
    return new OperatorSpec();
  }

  @Unit
  funcSuite(): Suite {
    return new FuncSuite();
  }

  @Unit
  formSuite(): Suite {
    return new FormSuite();
  }

  @Unit
  interpolatorSpec(): Suite {
    return new InterpolatorSpec();
  }
}
