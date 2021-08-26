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

package swim.protobuf.schema;

public abstract class ProtobufMapEntryType<K, V, E> extends ProtobufMessageType<E, E> {

  public abstract ProtobufFieldType<? extends K, E> keyField();

  public abstract ProtobufFieldType<? extends V, E> valueField();

  @Override
  public ProtobufFieldType<?, E> getField(long fieldNumber) {
    if (fieldNumber == 1L) {
      return this.keyField();
    } else if (fieldNumber == 2L) {
      return this.valueField();
    } else {
      return null;
    }
  }

  @Override
  public ProtobufMapEntryType<K, V, E> field(ProtobufFieldType<?, E> field) {
    throw new UnsupportedOperationException();
  }

}
