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

package swim.runtime.lane;

import java.util.Iterator;
import java.util.Map;
import swim.concurrent.Stage;
import swim.runtime.LinkBinding;
import swim.runtime.uplink.ListOperation;
import swim.runtime.uplink.SeqUplinkModem;
import swim.structure.Attr;
import swim.structure.Record;
import swim.structure.Value;
import swim.warp.SyncRequest;

public class ListLaneUplink extends SeqUplinkModem {
  final ListLaneModel laneBinding;

  public ListLaneUplink(ListLaneModel laneBinding, LinkBinding linkBinding) {
    super(linkBinding);
    this.laneBinding = laneBinding;
  }

  @Override
  public ListLaneModel laneBinding() {
    return this.laneBinding;
  }

  @Override
  public Stage stage() {
    return this.laneBinding.stage();
  }

  @Override
  protected Value nextDownKey(Value key, ListOperation listOperation) {
    final int index = key.get("index").intValue();
    final Value listKey = key.get("key");
    final Record header = Record.create(2).slot("key", listKey).slot("index", index);
    switch (listOperation) {
      case UPDATE:
        Value value;
        try {
          value = this.laneBinding.data.get(index, listKey);
        } catch (Exception e) {
          value = null; // FIXME- Catching exception if the index is out of range, is this ok ?
        }
        if (value != null) {
          return Attr.of("update", header).concat(value);
        } else {
          return null;
        }
      case REMOVE: return Record.create(1).attr("remove", header);
      case MOVE: return Record.create(1).attr("move", header);
      default: return null;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  protected void willSync(SyncRequest request) {
    syncDown((Iterator<Map.Entry<Value, Value>>) (Iterator<?>) this.laneBinding.iterator());
    super.willSync(request);
  }
}
