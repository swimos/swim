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

package swim.hpack;

import swim.codec.Input;
import swim.codec.InputException;
import swim.codec.InputSettings;
import swim.codec.Mark;

final class HuffmanDecodedInput extends Input {

  Input input;
  HuffmanTree root;
  HuffmanTree node;
  int current;
  int bits;
  int head;
  int state;
  Throwable error;

  HuffmanDecodedInput(Input input, HuffmanTree root, HuffmanTree node,
                      int current, int bits, int head, int state, Throwable error) {
    this.input = input;
    this.root = root;
    this.node = node;
    this.current = current;
    this.bits = bits;
    this.head = head;
    this.state = state;
    this.error = error;
  }

  HuffmanDecodedInput(Input input) {
    this(input, Huffman.tree(), Huffman.tree(), 0, 0, -1, HuffmanDecodedInput.DECODE, null);
  }

  @Override
  public boolean isCont() {
    return this.state() == HuffmanDecodedInput.CONT;
  }

  @Override
  public boolean isEmpty() {
    return this.state() == HuffmanDecodedInput.EMPTY;
  }

  @Override
  public boolean isDone() {
    return this.state() == HuffmanDecodedInput.DONE;
  }

  @Override
  public boolean isError() {
    return this.state() == HuffmanDecodedInput.ERROR;
  }

  @Override
  public boolean isPart() {
    return this.input.isPart();
  }

  @Override
  public Input isPart(boolean isPart) {
    this.input = this.input.isPart(isPart);
    return this;
  }

  int state() {
    if (this.head < 0 && this.state == HuffmanDecodedInput.DECODE) {
      do {
        if (this.bits >= 8) {
          final int c = this.current >>> this.bits - 8 & 0xFF;
          this.node = this.node.children[c];
          this.bits -= this.node.bits;
          if (this.node.isTerminal()) {
            if (this.node.symbol == Huffman.EOS) {
              this.state = HuffmanDecodedInput.ERROR;
              this.error = new InputException("unexpected EOS symbol");
            } else {
              this.head = this.node.symbol;
              this.state = HuffmanDecodedInput.CONT;
              this.node = this.root;
            }
          } else {
            continue;
          }
        } else if (this.input.isCont()) {
          final int b = this.input.head();
          this.input = this.input.step();
          this.current = this.current << 8 | b;
          this.bits += 8;
          continue;
        } else if (this.input.isEmpty()) {
          this.state = HuffmanDecodedInput.EMPTY;
        } else if (this.input.isDone()) {
          this.state = HuffmanDecodedInput.FINISH;
        } else if (this.input.isError()) {
          this.state = HuffmanDecodedInput.ERROR;
          this.error = this.input.trap();
        }
        break;
      } while (true);
    }
    if (this.head < 0 && this.state == HuffmanDecodedInput.FINISH) {
      if (this.bits > 0) {
        final int c = this.current << 8 - this.bits & 0xFF;
        this.node = this.node.children[c];
        if (this.node.isTerminal() && this.node.bits <= this.bits) {
          this.bits -= this.node.bits;
          this.head = this.node.symbol;
          this.state = HuffmanDecodedInput.CONT;
          this.node = this.root;
        } else {
          // RFC 7541 Section 5.2
          // A padding strictly longer than 7 bits MUST be treated as a decoding
          // error. A padding not corresponding to the most significant bits of
          // the code for the EOS symbol MUST be treated as a decoding error.
          final int mask = (1 << this.bits) - 1;
          if ((this.current & mask) != mask) {
            this.state = HuffmanDecodedInput.ERROR;
            this.error = new InputException("invalid padding");
          } else {
            this.state = HuffmanDecodedInput.DONE;
          }
        }
      }
    }
    return this.state;
  }

  @Override
  public int head() {
    final int head = this.head;
    if (head < 0) {
      throw new InputException();
    }
    return head;
  }

  @Override
  public Input step() {
    if (this.head >= 0) {
      this.head = -1;
      this.state = HuffmanDecodedInput.DECODE;
      return this;
    } else {
      final Throwable error = new InputException("invalid step");
      return Input.error(error, this.input.id(), this.mark(), this.input.settings());
    }
  }

  @Override
  public Input fork(Object condition) {
    if (condition instanceof Input) {
      this.input = (Input) condition;
      this.state = HuffmanDecodedInput.DECODE;
    }
    return this;
  }

  @Override
  public Throwable trap() {
    if (this.state() == HuffmanDecodedInput.ERROR) {
      return this.error;
    } else {
      throw new IllegalStateException();
    }
  }

  @Override
  public Input seek(Mark mark) {
    this.input = this.input.seek(mark);
    this.state = HuffmanDecodedInput.DECODE;
    this.error = null;
    return this;
  }

  @Override
  public Object id() {
    return this.input.id();
  }

  @Override
  public Input id(Object id) {
    this.input = this.input.id(id);
    return this;
  }

  @Override
  public Mark mark() {
    return this.input.mark();
  }

  @Override
  public Input mark(Mark mark) {
    this.input = this.input.mark(mark);
    return this;
  }

  @Override
  public long offset() {
    return this.input.offset();
  }

  @Override
  public int line() {
    return this.input.line();
  }

  @Override
  public int column() {
    return this.input.column();
  }

  @Override
  public InputSettings settings() {
    return this.input.settings();
  }

  @Override
  public Input settings(InputSettings settings) {
    this.input = this.input.settings(settings);
    return this;
  }

  @Override
  public Input clone() {
    return new HuffmanDecodedInput(this.input.clone(), this.root, this.node, this.current,
                                   this.bits, this.state, this.head, this.error);
  }

  private static final int DECODE = 0;
  private static final int FINISH = 1;
  private static final int CONT = 2;
  private static final int EMPTY = 3;
  private static final int DONE = 4;
  private static final int ERROR = 5;

}
