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

import swim.streamlet.AbstractInlet;
import swim.streamlet.KeyEffect;
import swim.structure.Record;
import swim.structure.Value;

public class RecordFieldUpdater extends AbstractInlet<Value> {
  protected final Record record;
  protected final Value key;

  public RecordFieldUpdater(Record record, Value key) {
    this.record = record;
    this.key = key;
  }

  @Override
  protected void onInvalidateOutput() {
    if (this.record instanceof RecordOutlet) {
      ((RecordOutlet) this.record).invalidateInputKey(this.key, KeyEffect.UPDATE);
    }
  }

  @Override
  protected void onReconcileOutput(int version) {
    if (this.input != null) {
      final Value value = this.input.get();
      if (value != null) {
        this.record.put(this.key, value);
      } else {
        this.record.remove(this.key);
      }
    }
  }
}
