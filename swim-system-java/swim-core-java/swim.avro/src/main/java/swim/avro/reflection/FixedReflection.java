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

import swim.avro.AvroName;
import swim.avro.schema.AvroFixedType;
import swim.codec.Binary;
import swim.codec.Decoder;
import swim.codec.InputBuffer;
import swim.collections.FingerTrieSeq;

final class FixedReflection extends AvroFixedType<byte[]> {
  final AvroName fullName;
  final FingerTrieSeq<AvroName> aliases;
  final int size;

  FixedReflection(AvroName fullName, FingerTrieSeq<AvroName> aliases, int size) {
    this.fullName = fullName;
    this.aliases = aliases;
    this.size = size;
  }

  FixedReflection(AvroName fullName, int size) {
    this(fullName, FingerTrieSeq.empty(), size);
  }

  @Override
  public AvroName fullName() {
    return this.fullName;
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
  public AvroFixedType<byte[]> alias(AvroName alias) {
    return new FixedReflection(this.fullName, this.aliases.appended(alias), this.size);
  }

  @Override
  public int size() {
    return this.size;
  }

  public Decoder<byte[]> decodeFixed(InputBuffer input) {
    return Binary.parseOutput(Binary.byteArrayOutput(this.size), input);
  }
}
