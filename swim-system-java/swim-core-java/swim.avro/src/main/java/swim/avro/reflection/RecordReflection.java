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

package swim.avro.reflection;

import java.lang.reflect.Constructor;
import swim.avro.AvroException;
import swim.avro.AvroName;
import swim.avro.schema.AvroFieldType;
import swim.avro.schema.AvroRecordType;
import swim.collections.FingerTrieSeq;

final class RecordReflection<T> extends AvroRecordType<T, T> {
  final AvroName fullName;
  final Constructor<T> constructor;
  final String doc;
  final FingerTrieSeq<AvroName> aliases;
  final FingerTrieSeq<AvroFieldType<T, ?>> fields;

  RecordReflection(AvroName fullName, Constructor<T> constructor, String doc,
                   FingerTrieSeq<AvroName> aliases, FingerTrieSeq<AvroFieldType<T, ?>> fields) {
    this.fullName = fullName;
    this.constructor = constructor;
    this.doc = doc;
    this.aliases = aliases;
    this.fields = fields;
  }

  RecordReflection(AvroName fullName, Constructor<T> constructor) {
    this(fullName, constructor, null, FingerTrieSeq.empty(), FingerTrieSeq.empty());
  }

  @Override
  public AvroName fullName() {
    return this.fullName;
  }

  @Override
  public String doc() {
    return this.doc;
  }

  @Override
  public AvroRecordType<T, T> doc(String doc) {
    return new RecordReflection<T>(this.fullName, this.constructor, doc,
                                   this.aliases, this.fields);
  }

  @Override
  public int aliasCount() {
    return this.aliases.size();
  }

  @Override
  public AvroName getAlias(int index) {
    return this.aliases.get(index);
  }

  @Override
  public AvroRecordType<T, T> alias(AvroName alias) {
    return new RecordReflection<T>(this.fullName, this.constructor, this.doc,
                                   this.aliases.appended(alias), this.fields);
  }

  @Override
  public int fieldCount() {
    return this.fields.size();
  }

  @Override
  public AvroFieldType<T, ?> getField(int index) {
    return this.fields.get(index);
  }

  @Override
  public AvroRecordType<T, T> field(AvroFieldType<T, ?> field) {
    return new RecordReflection<T>(this.fullName, this.constructor, this.doc,
                                   this.aliases, this.fields.appended(field));
  }

  @Override
  public T create() {
    try {
      return this.constructor.newInstance();
    } catch (ReflectiveOperationException cause) {
      throw new AvroException(cause);
    }
  }

  @Override
  public T cast(T record) {
    return record;
  }
}
