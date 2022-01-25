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

package swim.db;

import java.lang.ref.WeakReference;
import swim.codec.Output;
import swim.codec.Unicode;
import swim.concurrent.Cont;
import swim.concurrent.Sync;
import swim.recon.Recon;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Builder;
import swim.util.Cursor;

public final class UTreePageRef extends PageRef {

  final PageContext context;
  final int stem;
  final int post;
  final int zone;
  final long base;
  Object page;
  int pageRefSize;
  int pageSize;
  int diffSize;

  public UTreePageRef(PageContext context, int stem, int post, int zone, long base, Object page,
                      int pageRefSize, int pageSize, int diffSize) {
    this.context = context;
    this.stem = stem;
    this.post = post;
    this.zone = zone;
    this.base = base;
    this.page = page;
    this.pageRefSize = pageRefSize;
    this.pageSize = pageSize;
    this.diffSize = diffSize;
  }

  public UTreePageRef(PageContext context, int stem, int post, int zone, long base, Object page) {
    this(context, stem, post, zone, base, page, -1, -1, -1);
  }

  public UTreePageRef(PageContext context, int stem, int post, int zone, long base) {
    this(context, stem, post, zone, base, null, -1, -1, -1);
  }

  @Override
  public PageContext pageContext() {
    return this.context;
  }

  @Override
  public PageType pageType() {
    return PageType.LEAF;
  }

  @Override
  public int stem() {
    return this.stem;
  }

  @Override
  public int post() {
    return this.post;
  }

  @Override
  public int zone() {
    return this.zone;
  }

  @Override
  public long base() {
    return this.base;
  }

  @Override
  public long span() {
    return 1L;
  }

  @Override
  public Value fold() {
    return Value.absent();
  }

  @Override
  public UTreePage page() {
    Object page = this.page;
    if (page instanceof WeakReference<?>) {
      page = ((WeakReference<?>) page).get();
    }
    if (page instanceof UTreePage) {
      this.context.hitPage((UTreePage) page);
      return (UTreePage) page;
    } else {
      try (PageLoader pageLoader = this.context.openPageLoader(false)) {
        return (UTreePage) pageLoader.loadPage(this);
      } catch (Throwable error) {
        if (Cont.isNonFatal(error)) {
          throw new StoreException(this.toDebugString(), error);
        } else {
          throw error;
        }
      }
    }
  }

  @Override
  public UTreePage hardPage() {
    final Object page = this.page;
    if (page instanceof UTreePage) {
      return (UTreePage) page;
    } else {
      return null;
    }
  }

  @Override
  public UTreePage softPage() {
    Object page = this.page;
    if (page instanceof WeakReference<?>) {
      page = ((WeakReference<?>) page).get();
    }
    if (page instanceof UTreePage) {
      return (UTreePage) page;
    } else {
      return null;
    }
  }

  @Override
  public long softVersion() {
    final UTreePage page = this.softPage();
    if (page != null) {
      return page.version();
    } else {
      return 0L;
    }
  }

  @Override
  public boolean isEmpty() {
    return false;
  }

  @Override
  public boolean isCommitted() {
    return this.zone > 0 && this.base > 0L;
  }

  @Override
  public int pageRefSize() {
    int pageRefSize = this.pageRefSize;
    if (pageRefSize < 0) {
      pageRefSize = 5; // "@page"
      if (this.post != this.zone) {
        pageRefSize += 6; // "(post:"
        pageRefSize += Recon.sizeOf(Num.from(this.post));
      }
      pageRefSize += 6; // "[(,]zone:"
      pageRefSize += Recon.sizeOf(Num.from(this.zone));
      pageRefSize += 6; // ",base:"
      pageRefSize += Recon.sizeOf(Num.from(this.base));
      pageRefSize += 6; // ",size:"
      pageRefSize += Recon.sizeOf(Num.from(this.pageSize()));
      pageRefSize += 1; // ')'
      this.pageRefSize = pageRefSize; // Must match bytes written by writePageRef
    }
    return pageRefSize;
  }

  @Override
  public int pageSize() {
    if (this.pageSize < 0) {
      this.page().memoizeSize(this);
    }
    return this.pageSize;
  }

  @Override
  public int diffSize() {
    if (this.diffSize < 0) {
      this.page().memoizeSize(this);
    }
    return this.diffSize;
  }

  @Override
  public long treeSize() {
    return (long) this.pageSize();
  }

  @Override
  public Value toValue() {
    final Record header = Record.create(4);
    if (this.post != this.zone) {
      header.slot("post", this.post);
    }
    header.slot("zone", this.zone)
          .slot("base", this.base)
          .slot("size", this.pageSize());
    return Record.create(1).attr(this.pageType().tag(), header);
  }

  @Override
  public UTreePageRef evacuated(int post, long version) {
    if (this.post != 0 && this.post < post) {
      return this.page().evacuated(post, version).pageRef();
    } else {
      return this;
    }
  }

  @Override
  public UTreePageRef committed(int zone, long base, long version) {
    final UTreePage page = this.hardPage();
    if (page != null) {
      return page.committed(zone, base, version).pageRef();
    } else {
      return this;
    }
  }

  @Override
  public UTreePageRef uncommitted(long version) {
    final UTreePage page = this.hardPage();
    if (page != null && page.version() >= version) {
      return page.uncommitted(version).pageRef();
    } else {
      return this;
    }
  }

  @Override
  public void writePageRef(Output<?> output) {
    Recon.write(output, this.toValue());
  }

  @Override
  public void writePage(Output<?> output) {
    this.page().writePage(output);
  }

  @Override
  public void writeDiff(Output<?> output) {
    this.page().writeDiff(output);
  }

  @Override
  public void buildDiff(Builder<Page, ?> builder) {
    this.page().buildDiff(builder);
  }

  @Override
  public UTreePage setPageValue(Value value, boolean isResident) {
    try {
      final UTreePage page = UTreePage.fromValue(this, value);
      if (isResident) {
        this.page = page;
      } else {
        this.context.hitPage(page);
        this.page = new WeakReference<Object>(page);
      }
      return page;
    } catch (Throwable cause) {
      if (Cont.isNonFatal(cause)) {
        throw new StoreException(this.toDebugString(), cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public void loadPageAsync(boolean isResident, Cont<Page> cont) {
    try {
      Object page = this.page;
      if (page instanceof WeakReference<?>) {
        page = ((WeakReference<?>) page).get();
      }
      if (page instanceof UTreePage) {
        // Call continuation on fresh stack
        this.context.stage().execute(Cont.async(cont, (UTreePage) page));
      } else {
        final PageLoader pageLoader = this.context.openPageLoader(isResident);
        pageLoader.loadPageAsync(this, new LoadPage(pageLoader, cont));
      }
    } catch (Throwable cause) {
      if (Cont.isNonFatal(cause)) {
        cont.trap(new StoreException(this.toDebugString(), cause));
      } else {
        throw cause;
      }
    }
  }

  @Override
  public void loadTreeAsync(boolean isResident, Cont<Page> cont) {
    try {
      final PageLoader pageLoader = this.context.openPageLoader(isResident);
      this.loadTreeAsync(pageLoader, new LoadPage(pageLoader, cont));
    } catch (Throwable cause) {
      if (Cont.isNonFatal(cause)) {
        cont.trap(new StoreException(this.toDebugString(), cause));
      } else {
        throw cause;
      }
    }
  }

  @Override
  public void loadTreeAsync(PageLoader pageLoader, Cont<Page> cont) {
    try {
      Object page = this.page;
      if (page instanceof WeakReference<?>) {
        page = ((WeakReference<?>) page).get();
      }
      if (page instanceof UTreePage) {
        final Cont<Page> andThen = Cont.constant(cont, (UTreePage) page);
        ((UTreePage) page).loadTreeAsync(pageLoader, andThen);
      } else {
        pageLoader.loadPageAsync(this, new LoadTree(pageLoader, cont));
      }
    } catch (Throwable cause) {
      if (Cont.isNonFatal(cause)) {
        cont.trap(new StoreException(this.toDebugString(), cause));
      } else {
        throw cause;
      }
    }
  }

  @Override
  public void soften(long version) {
    final Object page = this.page;
    if (page instanceof UTreePage) {
      if (((UTreePage) page).version() <= version && this.isCommitted()) {
        this.context.hitPage((UTreePage) page);
        this.page = new WeakReference<Object>(page);
      }
      ((UTreePage) page).soften(version);
    }
  }

  @Override
  public Cursor<Value> cursor() {
    return this.page().cursor();
  }

  @Override
  public String toString() {
    final Output<String> output = Unicode.stringOutput(this.pageRefSize());
    this.writePageRef(output);
    return output.bind();
  }

  public static UTreePageRef empty(PageContext context, int stem, long version) {
    return UTreeLeaf.empty(context, stem, version).pageRef();
  }

  public static UTreePageRef fromValue(PageContext context, int stem, Value value) {
    Throwable cause = null;
    try {
      final String tag = value.tag();
      final PageType pageType = PageType.fromTag(tag);
      if (pageType == null) {
        return null;
      }
      final Value header = value.header(tag);
      final int zone = header.get("zone").intValue();
      final int post = header.get("post").intValue(zone);
      final long base = header.get("base").longValue();
      final int size = header.get("size").intValue();
      if (base < 0L) {
        throw new StoreException("negative page base: " + base);
      } else if (size < 0) {
        throw new StoreException("negative page size: " + size);
      }
      return new UTreePageRef(context, stem, post, zone, base, null, -1, size, 0);
    } catch (Throwable error) {
      if (Cont.isNonFatal(error)) {
        cause = error;
      } else {
        throw error;
      }
    }
    final Output<String> message = Unicode.stringOutput("Malformed utree page ref: ");
    Recon.write(message, value);
    throw new StoreException(message.bind(), cause);
  }

}
