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

package swim.codec;

import java.nio.ByteBuffer;

final class ByteOutputBuffer extends ByteOutput<ByteBuffer> {

  ByteOutputBuffer(byte[] array, int size, OutputSettings settings) {
    super(array, size, settings);
  }

  @Override
  public ByteBuffer bind() {
    return this.toByteBuffer();
  }

  @Override
  public Output<ByteBuffer> clone() {
    return new ByteOutputBuffer(this.cloneArray(), this.size, this.settings);
  }

}
