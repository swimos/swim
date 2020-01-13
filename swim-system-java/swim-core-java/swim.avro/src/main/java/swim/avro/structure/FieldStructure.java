// Copyright 2015-2020 SWIM.AI inc.
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

import swim.avro.schema.AvroFieldType;
import swim.avro.schema.AvroOrder;
import swim.avro.schema.AvroType;
import swim.collections.FingerTrieSeq;
import swim.structure.Record;
import swim.structure.Text;
import swim.structure.Value;

final class FieldStructure extends AvroFieldType<Record, Value> {

  final Text name;
  final String doc;
  final AvroType<? extends Value> valueType;
  final Value defaultValue;
  final AvroOrder order;
  final FingerTrieSeq<String> aliases;

  FieldStructure(Text name, String doc, AvroType<? extends Value> valueType,
                 Value defaultValue, AvroOrder order, FingerTrieSeq<String> aliases) {
    this.name = name.commit();
    this.doc = doc;
    this.valueType = valueType;
    this.defaultValue = defaultValue;
    this.order = order;
    this.aliases = aliases;
  }

  FieldStructure(String name, AvroType<? extends Value> valueType) {
    this(Text.from(name), null, valueType, Value.absent(), AvroOrder.ASCENDING, FingerTrieSeq.empty());
  }

  @Override
  public String name() {
    return this.name.stringValue();
  }

  @Override
  public String doc() {
    return this.doc;
  }

  @Override
  public AvroFieldType<Record, Value> doc(String doc) {
    return new FieldStructure(this.name, doc, this.valueType, this.defaultValue,
        this.order, this.aliases);
  }

  @Override
  public AvroType<? extends Value> valueType() {
    return this.valueType;
  }

  @Override
  public Value defaultValue() {
    return this.defaultValue;
  }

  @Override
  public AvroOrder order() {
    return this.order;
  }

  @Override
  public int aliasCount() {
    return this.aliases.size();
  }

  @Override
  public String getAlias(int index) {
    return this.aliases.get(index);
  }

  @Override
  public AvroFieldType<Record, Value> alias(String alias) {
    return new FieldStructure(this.name, this.doc, this.valueType, this.defaultValue,
        this.order, this.aliases.appended(alias));
  }

  @Override
  public Record updated(Record record, Value value) {
    return record.slot(this.name, value);
  }

}
