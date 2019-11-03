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

package swim.avro.structure;

import swim.avro.schema.AvroMapType;
import swim.avro.schema.AvroType;
import swim.codec.Input;
import swim.codec.Parser;
import swim.codec.Unicode;
import swim.structure.Record;
import swim.structure.Text;
import swim.structure.Value;
import swim.util.PairBuilder;

final class MapStructure<V extends Value> extends AvroMapType<Value, V, Record> {
  final AvroType<V> valueType;

  MapStructure(AvroType<V> valueType) {
    this.valueType = valueType;
  }

  @SuppressWarnings("unchecked")
  @Override
  public Parser<Value> parseKey(Input input) {
    return (Parser<Value>) (Parser<?>) Unicode.parseOutput(Text.output(), input);
  }

  @Override
  public AvroType<V> valueType() {
    return this.valueType;
  }

  @SuppressWarnings("unchecked")
  @Override
  public PairBuilder<Value, V, Record> mapBuilder() {
    return (PairBuilder<Value, V, Record>) (PairBuilder<Value, ?, Record>) Record.create();
  }
}
