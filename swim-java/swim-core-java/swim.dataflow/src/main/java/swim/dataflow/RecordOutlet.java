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

package swim.dataflow;

import swim.streamlet.MapOutlet;
import swim.streamlet.Outlet;
import swim.streamlet.StreamletScope;
import swim.structure.Record;
import swim.structure.Value;

public interface RecordOutlet extends Outlet<Record>, MapOutlet<Value, Value, Record>, StreamletScope<Value> {
  @Override
  Outlet<Value> outlet(Value key);

  @Override
  Outlet<Value> outlet(String key);
}
