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

package swim.protobuf.reflection;

import java.lang.reflect.Constructor;
import swim.collections.BTree;
import swim.protobuf.ProtobufException;
import swim.protobuf.schema.ProtobufFieldType;
import swim.protobuf.schema.ProtobufMessageType;

final class MessageReflection<T> extends ProtobufMessageType<T, T> {

  final Constructor<T> constructor;
  final BTree<Long, ProtobufFieldType<?, T>> fields;

  MessageReflection(Constructor<T> constructor, BTree<Long, ProtobufFieldType<?, T>> fields) {
    this.constructor = constructor;
    this.fields = fields;
  }

  MessageReflection(Constructor<T> constructor) {
    this(constructor, BTree.empty());
  }

  @Override
  public ProtobufFieldType<?, T> getField(long fieldNumber) {
    return this.fields.get(fieldNumber);
  }

  @Override
  public ProtobufMessageType<T, T> field(ProtobufFieldType<?, T> field) {
    return new MessageReflection<T>(this.constructor, this.fields.updated(field.fieldNumber(), field));
  }

  @Override
  public T create() {
    try {
      return this.constructor.newInstance();
    } catch (ReflectiveOperationException cause) {
      throw new ProtobufException(cause);
    }
  }

  @Override
  public T cast(T message) {
    return message;
  }

}
