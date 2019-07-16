// Copyright 2015-2019 SWIM.AI inc.
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

@Unit
class WarpSpec extends Spec {
  @Unit
  eventMessageSpec(): Spec {
    return new EventMessageSpec();
  }

  @Unit
  commandMessageSpec(): Spec {
    return new CommandMessageSpec();
  }

  @Unit
  linkRequestSpec(): Spec {
    return new LinkRequestSpec();
  }

  @Unit
  linkedResponseSpec(): Spec {
    return new LinkedResponseSpec();
  }

  @Unit
  syncRequestSpec(): Spec {
    return new SyncRequestSpec();
  }

  @Unit
  syncedResponseSpec(): Spec {
    return new SyncedResponseSpec();
  }

  @Unit
  unlinkRequestSpec(): Spec {
    return new UnlinkRequestSpec();
  }

  @Unit
  unlinkedResponseSpec(): Spec {
    return new UnlinkedResponseSpec();
  }

  @Unit
  authRequestSpec(): Spec {
    return new AuthRequestSpec();
  }

  @Unit
  authedResponseSpec(): Spec {
    return new AuthedResponseSpec();
  }

  @Unit
  deauthRequestSpec(): Spec {
    return new DeauthRequestSpec();
  }

  @Unit
  deauthedResponseSpec(): Spec {
    return new DeauthedResponseSpec();
  }
}

export {
  EventMessageSpec,
  CommandMessageSpec,
  LinkRequestSpec,
  LinkedResponseSpec,
  SyncRequestSpec,
  SyncedResponseSpec,
  UnlinkRequestSpec,
  UnlinkedResponseSpec,
  AuthRequestSpec,
  AuthedResponseSpec,
  DeauthRequestSpec,
  DeauthedResponseSpec,
  WarpSpec,
};

WarpSpec.run();
