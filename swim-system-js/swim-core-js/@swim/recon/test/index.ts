// Copyright 2015-2020 Swim inc.
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

import {ReconParserSpec} from "./ReconParserSpec";
import {ReconOperatorParserSpec} from "./ReconOperatorParserSpec";
import {ReconSelectorParserSpec} from "./ReconSelectorParserSpec";
import {ReconFuncParserSpec} from "./ReconFuncParserSpec";
import {ReconWriterSpec} from "./ReconWriterSpec";
import {ReconOperatorWriterSpec} from "./ReconOperatorWriterSpec";
import {ReconSelectorWriterSpec} from "./ReconSelectorWriterSpec";
import {ReconFuncWriterSpec} from "./ReconFuncWriterSpec";

@Unit
class ReconSpec extends Spec {
  @Unit
  reconParserSpec(): Spec {
    return new ReconParserSpec();
  }

  @Unit
  reconOperatorParserSpec(): Spec {
    return new ReconOperatorParserSpec();
  }

  @Unit
  reconSelectorParserSpec(): Spec {
    return new ReconSelectorParserSpec();
  }

  @Unit
  reconFuncParserSpec(): Spec {
    return new ReconFuncParserSpec();
  }

  @Unit
  reconWriterSpec(): Spec {
    return new ReconWriterSpec();
  }

  @Unit
  reconOperatorWriterSpec(): Spec {
    return new ReconOperatorWriterSpec();
  }

  @Unit
  reconSelectorWriterSpec(): Spec {
    return new ReconSelectorWriterSpec();
  }

  @Unit
  reconFuncWriterSpec(): Spec {
    return new ReconFuncWriterSpec();
  }
}

export {
  ReconParserSpec,
  ReconOperatorParserSpec,
  ReconSelectorParserSpec,
  ReconFuncParserSpec,
  ReconWriterSpec,
  ReconOperatorWriterSpec,
  ReconSelectorWriterSpec,
  ReconFuncWriterSpec,
  ReconSpec,
};

ReconSpec.run();
