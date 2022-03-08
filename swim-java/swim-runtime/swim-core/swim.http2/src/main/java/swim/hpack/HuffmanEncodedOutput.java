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

package swim.hpack;

import swim.codec.Output;
import swim.codec.OutputSettings;

final class HuffmanEncodedOutput<T> extends Output<T> {

  Output<T> output;
  int[] codes;
  byte[] lengths;
  long current;
  int bits;

  HuffmanEncodedOutput(Output<T> output, int[] codes, byte[] lengths, long current, int bits) {
    this.output = output;
    this.codes = codes;
    this.lengths = lengths;
    this.current = current;
    this.bits = bits;
  }

  HuffmanEncodedOutput(Output<T> output, int[] codes, byte[] lengths) {
    this(output, codes, lengths, 0L, 0);
  }

  HuffmanEncodedOutput(Output<T> output) {
    this(output, Huffman.CODES, Huffman.LENGTHS, 0L, 0);
  }

  @Override
  public boolean isCont() {
    return this.output.isCont();
  }

  @Override
  public boolean isFull() {
    return this.output.isFull();
  }

  @Override
  public boolean isDone() {
    return this.output.isDone();
  }

  @Override
  public boolean isError() {
    return false;
  }

  @Override
  public boolean isPart() {
    return this.output.isPart();
  }

  @Override
  public Output<T> isPart(boolean isPart) {
    this.output = this.output.isPart(isPart);
    return this;
  }

  @Override
  public Output<T> write(int b) {
    while (this.bits >= 8) {
      this.bits -= 8;
      this.output = this.output.write((int) (this.current >> this.bits));
      if (!this.output.isCont()) {
        break;
      }
    }
    if (this.bits < 8) {
      final int code = this.codes[b];
      final int length = this.lengths[b];
      this.current <<= length;
      this.current |= (long) code;
      this.bits += length;
      while (this.bits >= 8 && this.output.isCont()) {
        this.bits -= 8;
        this.output = this.output.write((int) (this.current >> this.bits));
      }
    }
    return this;
  }

  @Override
  public Output<T> flush() {
    if (this.bits > 0) {
      this.current <<= 8 - this.bits;
      this.current |= (long) (0xFF >>> this.bits); // EOS symbol
      this.bits -= 8;
      this.output = this.output.write((int) this.current);
      if (this.output.isError()) {
        return this.output;
      }
    }
    return this;
  }

  @Override
  public OutputSettings settings() {
    return this.output.settings();
  }

  @Override
  public Output<T> settings(OutputSettings settings) {
    this.output.settings(settings);
    return this;
  }

  @SuppressWarnings("unchecked")
  @Override
  public Output<T> fork(Object condition) {
    if (condition instanceof Output<?>) {
      this.output = (Output<T>) condition;
    }
    return this;
  }

  @Override
  public T bind() {
    return this.output.bind();
  }

  @Override
  public Output<T> clone() {
    return new HuffmanEncodedOutput<T>(this.output.clone(), this.codes,
                                       this.lengths, this.current, this.bits);
  }

}
