// Copyright 2015-2022 Swim.inc
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

import swim.protobuf.schema.ProtobufMapEntryType;
import swim.protobuf.schema.ProtobufMapType;
import swim.structure.Field;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Builder;

final class MapStructure<K extends Value, V extends Value> extends ProtobufMapType<K, V, Field, Record> {

  final ProtobufMapEntryType<? extends K, ? extends V, ? extends Field> itemType;

  MapStructure(ProtobufMapEntryType<? extends K, ? extends V, ? extends Field> itemType) {
    this.itemType = itemType;
  }

  @Override
  public ProtobufMapEntryType<? extends K, ? extends V, ? extends Field> itemType() {
    return this.itemType;
  }

  @SuppressWarnings("unchecked")
  @Override
  public Builder<Field, Record> valueBuilder() {
    return (Builder<Field, Record>) (Builder<?, Record>) Record.create();
  }

  @Override
  public Record appended(Record record, Field field) {
    return record.appended(field);
  }

}
