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

import swim.collections.BTree;
import swim.protobuf.schema.ProtobufFieldType;
import swim.protobuf.schema.ProtobufMessageType;
import swim.structure.Record;

final class MessageStructure extends ProtobufMessageType<Record, Record> {

  final BTree<Long, ProtobufFieldType<?, Record>> fields;

  MessageStructure(BTree<Long, ProtobufFieldType<?, Record>> fields) {
    this.fields = fields;
  }

  MessageStructure() {
    this(BTree.empty());
  }

  @Override
  public ProtobufFieldType<?, Record> getField(long fieldNumber) {
    return this.fields.get(fieldNumber);
  }

  @Override
  public ProtobufMessageType<Record, Record> field(ProtobufFieldType<?, Record> field) {
    return new MessageStructure(this.fields.updated(field.fieldNumber(), field));
  }

  @Override
  public Record create() {
    return Record.create();
  }

  @Override
  public Record cast(Record record) {
    return record;
  }

}
