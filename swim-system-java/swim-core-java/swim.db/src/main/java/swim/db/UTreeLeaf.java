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

package swim.db;

import swim.codec.Output;
import swim.codec.Unicode;
import swim.concurrent.Cont;
import swim.concurrent.Conts;
import swim.recon.Recon;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Cursor;

public final class UTreeLeaf extends UTreePage {
  final UTreePageRef pageRef;
  final long version;
  final Value value;

  protected UTreeLeaf(UTreePageRef pageRef, long version, Value value) {
    this.pageRef = pageRef;
    this.version = version;
    this.value = value;
  }

  @Override
  public boolean isLeaf() {
    return true;
  }

  @Override
  public UTreePageRef pageRef() {
    return this.pageRef;
  }

  @Override
  public PageType pageType() {
    return PageType.LEAF;
  }

  @Override
  public long version() {
    return this.version;
  }

  @Override
  public boolean isEmpty() {
    return false;
  }

  @Override
  public int arity() {
    return 1;
  }

  @Override
  public int childCount() {
    return 0;
  }

  @Override
  public UTreePageRef getChildRef(int index) {
    throw new IndexOutOfBoundsException(Integer.toString(index));
  }

  @Override
  public UTreePage getChild(int index) {
    throw new IndexOutOfBoundsException(Integer.toString(index));
  }

  @Override
  public Value get() {
    return this.value;
  }

  @Override
  public UTreePage updated(Value newValue, long newVersion) {
    if (!newValue.equals(this.value)) {
      return create(this.pageRef.context, this.pageRef.stem, newVersion, newValue);
    } else {
      return this;
    }
  }

  @Override
  public int pageSize() {
    return this.pageRef.pageSize();
  }

  @Override
  public int diffSize() {
    return this.pageRef.diffSize();
  }

  @Override
  public long treeSize() {
    return this.pageRef.treeSize();
  }

  @Override
  void memoizeSize(UTreePageRef pageRef) {
    int pageSize = 12; // "@uleaf(stem:"
    pageSize += Recon.sizeOf(Num.from(this.pageRef.stem));
    pageSize += 3; // ",v:"
    pageSize += Recon.sizeOf(Num.from(this.version));
    pageSize += 1; // ')'

    pageSize += 1; // '{'
    pageSize += Recon.sizeOf(this.value);
    pageSize += 1; // '}'

    pageSize += 1; // '\n'
    pageRef.pageSize = pageSize; // Must match bytes written by writePage
    pageRef.diffSize = pageSize; // Must match bytes written by writeDiff
  }

  @Override
  public Value toHeader() {
    final Record header = Record.create(2)
        .slot("stem", this.pageRef.stem)
        .slot("v", this.version);
    return Record.create(1).attr("uleaf", header);
  }

  @Override
  public Value toValue() {
    final Record record = (Record) toHeader();
    record.add(this.value);
    return record;
  }

  @Override
  public UTreeLeaf evacuated(int post, long version) {
    final int oldPost = this.pageRef.post;
    if (oldPost != 0 && oldPost < post) {
      return create(this.pageRef.context, this.pageRef.stem, version, this.value);
    } else {
      return this;
    }
  }

  @Override
  public UTreeLeaf committed(int zone, long base, long version) {
    return create(this.pageRef.context, this.pageRef.stem, version, zone, base, this.value);
  }

  @Override
  public UTreeLeaf uncommitted(long version) {
    return create(this.pageRef.context, this.pageRef.stem, version, this.value);
  }

  @Override
  public void writePage(Output<?> output) {
    Recon.write(toHeader(), output);
    writePageContent(output);
    output.write('\n');
  }

  void writePageContent(Output<?> output) {
    output.write('{');
    Recon.write(this.value, output);
    output.write('}');
  }

  @Override
  public void writeDiff(Output<?> output) {
    writePage(output);
  }

  @Override
  public void loadTreeAsync(PageLoader pageLoader, Cont<Page> cont) {
    try {
      // Call continuation on fresh stack
      this.pageRef.context.stage().execute(Conts.async(cont, this));
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        cont.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public void soften(long version) {
    // nop
  }

  @Override
  public Cursor<Value> cursor() {
    return Cursor.unary(this.value);
  }

  @Override
  public String toString() {
    final Output<String> output = Unicode.stringOutput(pageSize() - 1); // ignore trailing '\n'
    Recon.write(toHeader(), output);
    writePageContent(output);
    return output.bind();
  }

  public static UTreeLeaf create(PageContext context, int stem, long version,
                                 int zone, long base, Value value) {
    final UTreePageRef pageRef = new UTreePageRef(context, stem, zone, zone, base);
    final UTreeLeaf page = new UTreeLeaf(pageRef, version, value);
    pageRef.page = page;
    return page;
  }

  public static UTreeLeaf create(PageContext context, int stem, long version, Value value) {
    return create(context, stem, version, 0, 0L, value);
  }

  public static UTreeLeaf empty(PageContext context, int stem, long version) {
    return create(context, stem, version, 0, 0L, Value.absent());
  }

  public static UTreeLeaf fromValue(UTreePageRef pageRef, Value value) {
    Throwable cause = null;
    try {
      final Value header = value.header("uleaf");
      final long version = header.get("v").longValue();
      final Value body = value.body();
      return new UTreeLeaf(pageRef, version, body);
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        cause = error;
      } else {
        throw error;
      }
    }
    final Output<String> message = Unicode.stringOutput("Malformed uleaf: ");
    Recon.write(value, message);
    throw new StoreException(message.bind(), cause);
  }
}
