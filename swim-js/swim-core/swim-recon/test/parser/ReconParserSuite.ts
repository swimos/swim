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
import {ReconParserSpec} from "./ReconParserSpec";
import {ReconOperatorParserSpec} from "./ReconOperatorParserSpec";
import {ReconSelectorParserSpec} from "./ReconSelectorParserSpec";
import {ReconFuncParserSpec} from "./ReconFuncParserSpec";

export class ReconParserSuite extends Suite {
  @Unit
  reconParserSpec(): Suite {
    return new ReconParserSpec();
  }

  @Unit
  reconOperatorParserSpec(): Suite {
    return new ReconOperatorParserSpec();
  }

  @Unit
  reconSelectorParserSpec(): Suite {
    return new ReconSelectorParserSpec();
  }

  @Unit
  reconFuncParserSpec(): Suite {
    return new ReconFuncParserSpec();
  }
}
