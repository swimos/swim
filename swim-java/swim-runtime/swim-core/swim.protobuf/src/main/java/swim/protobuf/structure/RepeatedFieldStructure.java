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

package swim.protobuf.structure;

import swim.protobuf.schema.ProtobufFieldType;
import swim.protobuf.schema.ProtobufRepeatedType;
import swim.protobuf.schema.ProtobufType;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;

final class RepeatedFieldStructure extends ProtobufFieldType<Item, Record> {

  final Value key;
  final long fieldNumber;
  final ProtobufRepeatedType<? extends Item, ? extends Value> repeatedType;

  RepeatedFieldStructure(Value key, long fieldNumber, ProtobufRepeatedType<? extends Item, ? extends Value> repeatedType) {
    this.key = key;
    this.fieldNumber = fieldNumber;
    this.repeatedType = repeatedType;
  }

  @Override
  public long fieldNumber() {
    return this.fieldNumber;
  }

  @Override
  public ProtobufType<? extends Item> valueType() {
    return this.repeatedType.itemType();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Record updated(Record record, Item item) {
    final Value oldItem = record.get(this.key);
    final Value newItem = oldItem.appended(item);
    record = record.updatedSlot(this.key, newItem);
    return record;
  }

  @Override
  public ProtobufFieldType<?, Record> packedType() {
    return new FieldStructure(this.key, this.fieldNumber, this.repeatedType);
  }

}
