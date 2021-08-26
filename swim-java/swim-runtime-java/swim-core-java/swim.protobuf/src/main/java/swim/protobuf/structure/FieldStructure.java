// Copyright 2015-2021 Swim Inc.
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
import swim.protobuf.schema.ProtobufType;
import swim.structure.Record;
import swim.structure.Value;

final class FieldStructure extends ProtobufFieldType<Value, Record> {

  final Value key;
  final long fieldNumber;
  final ProtobufType<? extends Value> valueType;

  FieldStructure(Value key, long fieldNumber, ProtobufType<? extends Value> valueType) {
    this.key = key.commit();
    this.fieldNumber = fieldNumber;
    this.valueType = valueType;
  }

  public Value key() {
    return this.key;
  }

  @Override
  public long fieldNumber() {
    return this.fieldNumber;
  }

  @Override
  public ProtobufType<? extends Value> valueType() {
    return this.valueType;
  }

  @Override
  public Record updated(Record record, Value value) {
    return record.slot(this.key, value);
  }

  @Override
  public ProtobufFieldType<?, Record> packedType() {
    return null;
  }

}
