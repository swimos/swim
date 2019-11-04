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

final class CsvInput extends Input {
  final CsvParser csv;
  Input input;

  CsvInput(CsvParser csv, Input input) {
    this.csv = csv;
    this.input = input;
  }

  boolean isDelimiter(int c) {
    return c == '\r' || c == '\n' || c == '"' || this.csv.isDelimiter(c);
  }

  @Override
  public boolean isCont() {
    return this.input.isCont() && !isDelimiter(this.input.head());
  }

  @Override
  public boolean isEmpty() {
    return this.input.isEmpty();
  }

  @Override
  public boolean isDone() {
    return this.input.isDone() || this.input.isCont() && isDelimiter(this.input.head());
  }

  @Override
  public boolean isError() {
    return this.input.isError();
  }

  @Override
  public boolean isPart() {
    return this.input.isPart();
  }

  @Override
  public Input isPart(boolean isPart) {
    return new CsvInput(this.csv, this.input.isPart(isPart));
  }

  @Override
  public int head() {
    final int head = this.input.head();
    if (!isDelimiter(head)) {
      return head;
    } else {
      throw new InputException();
    }
  }

  @Override
  public Input step() {
    final int head = this.input.head();
    if (!isDelimiter(head)) {
      this.input = this.input.step();
      return this;
    } else {
      final Throwable error = new InputException("invalid step");
      return Input.error(error, id(), mark(), settings());
    }
  }

  @Override
  public Input seek(Mark mark) {
    return new CsvInput(this.csv, this.input.seek(mark));
  }

  @Override
  public Input fork(Object condition) {
    return new CsvInput(this.csv, this.input.fork(condition));
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
    return new CsvInput(this.csv, this.input.id(id));
  }

  @Override
  public Mark mark() {
    return this.input.mark();
  }

  @Override
  public Input mark(Mark mark) {
    return new CsvInput(this.csv, this.input.mark(mark));
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
    return new CsvInput(this.csv, this.input.settings(settings));
  }

  @Override
  public Input clone() {
    return new CsvInput(this.csv, this.input.clone());
  }
}
