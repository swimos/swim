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

package swim.runtime;

import swim.api.Downlink;
import swim.api.policy.Policy;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.store.StoreBinding;
import swim.uri.Uri;
import swim.util.Log;

public interface CellContext extends Log {
  CellAddress cellAddress();

  String edgeName();

  Uri meshUri();

  Policy policy();

  Schedule schedule();

  Stage stage();

  StoreBinding store();

  LinkBinding bindDownlink(Downlink downlink);

  void openDownlink(LinkBinding link);

  void closeDownlink(LinkBinding link);

  void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink);

  void pushDown(PushRequest pushRequest);

  void reportDown(Metric metric);
}
