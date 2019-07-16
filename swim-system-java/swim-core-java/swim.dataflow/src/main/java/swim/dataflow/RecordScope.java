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

import swim.streamlet.StreamletScope;
import swim.structure.Record;
import swim.structure.Value;

public class RecordScope extends RecordModel {
  protected StreamletScope<? extends Value> scope;

  public RecordScope(StreamletScope<? extends Value> scope, Record state) {
    super(state);
    this.scope = scope;
  }

  public RecordScope(StreamletScope<? extends Value> scope) {
    super();
    this.scope = scope;
  }

  @Override
  public final StreamletScope<? extends Value> streamletScope() {
    return this.scope;
  }

  public static RecordScope from(Record record) {
    final RecordScope scope = new RecordScope(globalScope());
    scope.materialize(record);
    scope.compile(record);
    return scope;
  }

  public static RecordScope of() {
    return new RecordScope(globalScope());
  }

  public static RecordScope of(Object object) {
    return from(Record.of(object));
  }

  public static RecordScope of(Object... objects) {
    return from(Record.of(objects));
  }
}
