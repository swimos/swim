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

package swim.csv.parser;

import swim.codec.Input;
import swim.codec.InputException;
import swim.codec.InputSettings;
import swim.codec.Mark;

final class CsvQuotedInput extends Input {
  final int quote;
  Input input;
  int head;

  CsvQuotedInput(int quote, Input input, int head) {
    this.quote = quote;
    this.input = input;
    this.head = head;
  }

  CsvQuotedInput(int quote, Input input) {
    this(quote, input, -1);
  }

  int next() {
    if (this.head == -1 && this.input.isCont()) {
      this.head = this.input.head();
      this.input = this.input.step();
      if (this.head == this.quote) {
        this.head = -2;
      }
    } else if (this.head == -1 && this.input.isDone()) {
      this.head = -4;
    }
    if (this.head == -2 && this.input.isCont()) {
      this.head = this.input.head();
      if (this.head == this.quote) {
        this.input = this.input.step();
      } else {
        this.head = -3;
      }
    } else if (this.head == -2 && this.input.isDone()) {
      this.head = -3;
    }
    return this.head;
  }

  @Override
  public boolean isCont() {
    return next() >= 0;
  }

  @Override
  public boolean isEmpty() {
    final int head = next();
    return head == -1 && this.input.isEmpty() || head == -2;
  }

  @Override
  public boolean isDone() {
    final int head = next();
    return head == -1 && this.input.isDone() || head == -3 || head == -4;
  }

  @Override
  public boolean isError() {
    final int head = next();
    return head == -1 && this.input.isError();
  }

  @Override
  public boolean isPart() {
    return this.input.isPart();
  }

  @Override
  public Input isPart(boolean isPart) {
    return new CsvQuotedInput(this.quote, this.input.isPart(isPart), this.head);
  }

  @Override
  public int head() {
    final int head = next();
    if (head >= 0) {
      return head;
    } else {
      throw new InputException();
    }
  }

  @Override
  public Input step() {
    final int head = next();
    if (head >= 0) {
      this.head = -1;
      return this;
    } else {
      final Throwable error = new InputException("invalid step");
      return Input.error(error, id(), mark(), settings());
    }
  }

  @Override
  public Input seek(Mark mark) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Throwable trap() {
    return this.input.trap();
  }

  @Override
  public Object id() {
    return this.input.id();
  }

  @Override
  public Input id(Object id) {
    return new CsvQuotedInput(this.quote, this.input.id(id), this.head);
  }

  @Override
  public Mark mark() {
    return this.input.mark();
  }

  @Override
  public Input mark(Mark mark) {
    return new CsvQuotedInput(this.quote, this.input.mark(mark), this.head);
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
    return new CsvQuotedInput(this.quote, this.input.settings(settings), this.head);
  }

  @Override
  public Input clone() {
    return new CsvQuotedInput(this.quote, this.input.clone(), this.head);
  }
}
