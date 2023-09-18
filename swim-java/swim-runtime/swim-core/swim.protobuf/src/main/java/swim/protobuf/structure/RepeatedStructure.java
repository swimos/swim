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

import swim.protobuf.schema.ProtobufRepeatedType;
import swim.protobuf.schema.ProtobufType;
import swim.structure.Item;
import swim.structure.Record;
import swim.util.Builder;

final class RepeatedStructure<I extends Item> extends ProtobufRepeatedType<I, Record> {

  final ProtobufType<I> itemType;

  RepeatedStructure(ProtobufType<I> itemType) {
    this.itemType = itemType;
  }

  @Override
  public ProtobufType<I> itemType() {
    return this.itemType;
  }

  @SuppressWarnings("unchecked")
  @Override
  public Builder<I, Record> valueBuilder() {
    return (Builder<I, Record>) (Builder<?, Record>) Record.create();
  }

  @Override
  public Record appended(Record record, I item) {
    return record.appended(item);
  }

}
