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
import {EventMessageSpec} from "./EventMessageSpec";
import {CommandMessageSpec} from "./CommandMessageSpec";
import {LinkRequestSpec} from "./LinkRequestSpec";
import {LinkedResponseSpec} from "./LinkedResponseSpec";
import {SyncRequestSpec} from "./SyncRequestSpec";
import {SyncedResponseSpec} from "./SyncedResponseSpec";
import {UnlinkRequestSpec} from "./UnlinkRequestSpec";
import {UnlinkedResponseSpec} from "./UnlinkedResponseSpec";
import {AuthRequestSpec} from "./AuthRequestSpec";
import {AuthedResponseSpec} from "./AuthedResponseSpec";
import {DeauthRequestSpec} from "./DeauthRequestSpec";
import {DeauthedResponseSpec} from "./DeauthedResponseSpec";

export class WarpSuite extends Suite {
  @Unit
  eventMessageSpec(): Suite {
    return new EventMessageSpec();
  }

  @Unit
  commandMessageSpec(): Suite {
    return new CommandMessageSpec();
  }

  @Unit
  linkRequestSpec(): Suite {
    return new LinkRequestSpec();
  }

  @Unit
  linkedResponseSpec(): Suite {
    return new LinkedResponseSpec();
  }

  @Unit
  syncRequestSpec(): Suite {
    return new SyncRequestSpec();
  }

  @Unit
  syncedResponseSpec(): Suite {
    return new SyncedResponseSpec();
  }

  @Unit
  unlinkRequestSpec(): Suite {
    return new UnlinkRequestSpec();
  }

  @Unit
  unlinkedResponseSpec(): Suite {
    return new UnlinkedResponseSpec();
  }

  @Unit
  authRequestSpec(): Suite {
    return new AuthRequestSpec();
  }

  @Unit
  authedResponseSpec(): Suite {
    return new AuthedResponseSpec();
  }

  @Unit
  deauthRequestSpec(): Suite {
    return new DeauthRequestSpec();
  }

  @Unit
  deauthedResponseSpec(): Suite {
    return new DeauthedResponseSpec();
  }
}
