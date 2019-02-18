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

package swim.structure;

import swim.codec.Output;
import swim.codec.OutputSettings;

final class DataOutput extends Output<Data> {
  final Data data;
  OutputSettings settings;

  DataOutput(Data data, OutputSettings settings) {
    this.data = data;
    this.settings = settings;
  }

  @Override
  public boolean isCont() {
    return true;
  }

  @Override
  public boolean isFull() {
    return false;
  }

  @Override
  public boolean isDone() {
    return false;
  }

  @Override
  public boolean isError() {
    return false;
  }

  @Override
  public boolean isPart() {
    return false;
  }

  @Override
  public Output<Data> isPart(boolean isPart) {
    return this;
  }

  @Override
  public Output<Data> write(int b) {
    this.data.addByte((byte) b);
    return this;
  }

  @Override
  public Output<Data> write(String string) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Output<Data> writeln(String string) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Output<Data> writeln() {
    throw new UnsupportedOperationException();
  }

  @Override
  public OutputSettings settings() {
    return this.settings;
  }

  @Override
  public Output<Data> settings(OutputSettings settings) {
    this.settings = settings;
    return this;
  }

  @Override
  public Data bind() {
    return this.data;
  }

  @Override
  public Output<Data> clone() {
    return new DataOutput(this.data.branch(), this.settings);
  }
}
