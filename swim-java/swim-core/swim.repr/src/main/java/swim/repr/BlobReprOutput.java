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

package swim.repr;

import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;

@Public
@Since("5.0")
public final class BlobReprOutput extends Output<BlobRepr> {

  final BlobRepr blob;

  public BlobReprOutput(BlobRepr blob) {
    this.blob = blob;
  }

  public BlobReprOutput() {
    this(BlobRepr.create());
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
  public boolean isLast() {
    return true;
  }

  @Override
  public BlobReprOutput asLast(boolean last) {
    return this;
  }

  @Override
  public BlobReprOutput write(int b) {
    this.blob.addByte((byte) b);
    return this;
  }

  @Override
  public BlobRepr get() {
    return this.blob;
  }

  @Override
  public BlobReprOutput clone() {
    return new BlobReprOutput(this.blob.clone());
  }

  public static BlobReprOutput withCapacity(int initialCapacity) {
    return new BlobReprOutput(BlobRepr.withCapacity(initialCapacity));
  }

}
