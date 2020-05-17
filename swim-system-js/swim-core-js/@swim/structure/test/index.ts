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

import {ItemOrderSpec} from "./ItemOrderSpec";
import {RecordMapSpec} from "./RecordMapSpec";
import {RecordMapViewSpec} from "./RecordMapViewSpec";
import {SelectorSpec} from "./SelectorSpec";
import {OperatorSpec} from "./OperatorSpec";
import {InterpolatorSpec} from "./InterpolatorSpec";

import {FuncSpec} from "./func";
import {FormSpec} from "./form";

@Unit
class StructureSpec extends Spec {
  @Unit
  itemOrderSpec(): Spec {
    return new ItemOrderSpec();
  }

  @Unit
  recordMapSpec(): Spec {
    return new RecordMapSpec();
  }

  @Unit
  recordMapViewSpec(): Spec {
    return new RecordMapViewSpec();
  }

  @Unit
  selectorSpec(): Spec {
    return new SelectorSpec();
  }

  @Unit
  operatorSpec(): Spec {
    return new OperatorSpec();
  }

  @Unit
  funcSpec(): Spec {
    return new FuncSpec();
  }

  @Unit
  formSpec(): Spec {
    return new FormSpec();
  }

  @Unit
  interpolatorSpec(): Spec {
    return new InterpolatorSpec();
  }
}

export {
  ItemOrderSpec,
  RecordMapSpec,
  RecordMapViewSpec,
  SelectorSpec,
  OperatorSpec,
  InterpolatorSpec,
};

export * from "./func";
export * from "./form";

export {StructureSpec};

StructureSpec.run();
