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

package swim.db;

import java.lang.ref.WeakReference;
import swim.codec.Output;
import swim.codec.Unicode;
import swim.concurrent.Cont;
import swim.recon.Recon;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Builder;
import swim.util.CombinerFunction;
import swim.util.OrderedMapCursor;

public final class BTreePageRef extends PageRef {

  final PageContext context;
  final PageType pageType;
  final int stem;
  final int post;
  final int zone;
  final long base;
  final long span;
  final Value fold;
  Object page;
  int pageRefSize;
  int pageSize;
  int diffSize;
  long treeSize;

  public BTreePageRef(PageContext context, PageType pageType, int stem, int post,
                      int zone, long base, long span, Value fold, Object page,
                      int pageRefSize, int pageSize, int diffSize, long treeSize) {
    this.context = context;
    this.pageType = pageType;
    this.stem = stem;
    this.post = post;
    this.zone = zone;
    this.base = base;
    this.span = span;
    this.fold = fold;
    this.page = page;
    this.pageRefSize = pageRefSize;
    this.pageSize = pageSize;
    this.diffSize = diffSize;
    this.treeSize = treeSize;
  }

  public BTreePageRef(PageContext context, PageType pageType, int stem, int post,
                      int zone, long base, long span, Value fold, Object page) {
    this(context, pageType, stem, post, zone, base, span, fold, page, -1, -1, -1, -1L);
  }

  public BTreePageRef(PageContext context, PageType pageType, int stem, int post,
                      int zone, long base, long span, Value fold) {
    this(context, pageType, stem, post, zone, base, span, fold, null, -1, -1, -1, -1L);
  }

  @Override
  public PageContext pageContext() {
    return this.context;
  }

  @Override
  public PageType pageType() {
    return this.pageType;
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
    return this.span;
  }

  @Override
  public Value fold() {
    return this.fold;
  }

  @Override
  public BTreePage page() {
    Object page = this.page;
    if (page instanceof WeakReference<?>) {
      page = ((WeakReference<?>) page).get();
    }
    if (page instanceof BTreePage) {
      this.context.hitPage((BTreePage) page);
      return (BTreePage) page;
    } else {
      try (PageLoader pageLoader = this.context.openPageLoader(false)) {
        return (BTreePage) pageLoader.loadPage(this);
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
  public BTreePage hardPage() {
    final Object page = this.page;
    if (page instanceof BTreePage) {
      return (BTreePage) page;
    } else {
      return null;
    }
  }

  @Override
  public BTreePage softPage() {
    Object page = this.page;
    if (page instanceof WeakReference<?>) {
      page = ((WeakReference<?>) page).get();
    }
    if (page instanceof BTreePage) {
      return (BTreePage) page;
    } else {
      return null;
    }
  }

  @Override
  public long softVersion() {
    final BTreePage page = this.softPage();
    if (page != null) {
      return page.version();
    } else {
      return 0L;
    }
  }

  @Override
  public boolean isEmpty() {
    return this.span == 0L;
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
      pageRefSize += 6; // ",area:"
      pageRefSize += Recon.sizeOf(Num.from(this.treeSize()));
      pageRefSize += 6; // ",span:"
      pageRefSize += Recon.sizeOf(Num.from(this.span));
      final Value fold = this.fold();
      if (fold.isDefined()) {
        pageRefSize += 6; // ",fold:"
        pageRefSize += Recon.sizeOf(fold);
      }
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
    if (this.treeSize < 0L) {
      this.page().memoizeSize(this);
    }
    return this.treeSize;
  }

  @Override
  public Value toValue() {
    final Record header = Record.create(7);
    if (this.post != this.zone) {
      header.slot("post", this.post);
    }
    header.slot("zone", this.zone)
          .slot("base", this.base)
          .slot("size", this.pageSize())
          .slot("area", this.treeSize())
          .slot("span", this.span);
    final Value fold = this.fold();
    if (fold.isDefined()) {
      header.slot("fold", fold);
    }
    return Record.create(1).attr(this.pageType.tag(), header);
  }

  public BTreePageRef reduced(Value identity, CombinerFunction<? super Value, Value> accumulator,
                              CombinerFunction<Value, Value> combiner, long newVersion) {
    if (!this.fold.isDefined()) {
      return this.page().reduced(identity, accumulator, combiner, newVersion).pageRef();
    } else {
      return this;
    }
  }

  @Override
  public BTreePageRef evacuated(int post, long version) {
    if (this.post != 0 && this.post < post) {
      final BTreePage page = this.page();
      try {
        return page.evacuated(post, version).pageRef();
      } catch (Throwable cause) {
        if (Cont.isNonFatal(cause)) {
          throw new StoreException(cause);
        } else {
          throw new StoreException(this.toDebugString(), cause);
        }
      }
    } else {
      return this;
    }
  }

  @Override
  public BTreePageRef committed(int zone, long base, long version) {
    final BTreePage page = this.hardPage();
    if (page != null) {
      return page.committed(zone, base, version).pageRef();
    } else {
      return this;
    }
  }

  @Override
  public BTreePageRef uncommitted(long version) {
    final BTreePage page = this.hardPage();
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
  public BTreePage setPageValue(Value value, boolean isResident) {
    try {
      final BTreePage page = BTreePage.fromValue(this, value);
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
  public BTreePage loadPage(boolean isResident) {
    Object page = this.page;
    if (page instanceof WeakReference<?>) {
      page = ((WeakReference<?>) page).get();
    }
    if (page instanceof BTreePage) {
      this.context.hitPage((BTreePage) page);
      return (BTreePage) page;
    } else {
      try (PageLoader pageLoader = this.context.openPageLoader(isResident)) {
        return (BTreePage) pageLoader.loadPage(this);
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
  public BTreePage loadPage(PageLoader pageLoader) {
    Object page = this.page;
    if (page instanceof WeakReference<?>) {
      page = ((WeakReference<?>) page).get();
    }
    if (page instanceof BTreePage) {
      this.context.hitPage((BTreePage) page);
      return (BTreePage) page;
    } else {
      try {
        return (BTreePage) pageLoader.loadPage(this);
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
  public BTreePage loadTree(boolean isResident) {
    try (PageLoader pageLoader = this.context.openPageLoader(isResident)) {
      return this.loadTree(pageLoader);
    }
  }

  @Override
  public BTreePage loadTree(PageLoader pageLoader) {
    final BTreePage page = this.loadPage(pageLoader);
    return page.loadTree(pageLoader);
  }

  @Override
  public void soften(long version) {
    final Object page = this.page;
    if (page instanceof BTreePage) {
      if (((BTreePage) page).version() <= version && this.isCommitted()) {
        this.context.hitPage((BTreePage) page);
        this.page = new WeakReference<Object>(page);
      }
      ((BTreePage) page).soften(version);
    }
  }

  @Override
  public OrderedMapCursor<Value, Value> cursor() {
    return this.page().cursor();
  }

  public OrderedMapCursor<Value, Value> depthCursor(int maxDepth) {
    if (maxDepth > 0) {
      return this.page().depthCursor(maxDepth);
    } else {
      final Value fold = this.fold();
      if (fold instanceof Record) {
        return new BTreePageRefCursor(this, (Record) fold);
      } else if (fold.isDefined()) {
        return new BTreePageRefCursor(this, Record.of(fold));
      } else {
        return new BTreePageRefCursor(this, Record.empty());
      }
    }
  }

  public OrderedMapCursor<Value, Value> deltaCursor(long sinceVersion) {
    return this.page().deltaCursor(sinceVersion);
  }

  @Override
  public String toString() {
    final Output<String> output = Unicode.stringOutput(this.pageRefSize());
    this.writePageRef(output);
    return output.bind();
  }

  public static BTreePageRef empty(PageContext context, int stem, long version) {
    return BTreeLeaf.empty(context, stem, version).pageRef();
  }

  public static BTreePageRef fromValue(PageContext context, int stem, Value value) {
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
      final long area = header.get("area").longValue();
      final long span = header.get("span").longValue();
      final Value fold = header.get("fold");
      if (base < 0L) {
        throw new StoreException("negative page base: " + base);
      } else if (size < 0) {
        throw new StoreException("negative page size: " + size);
      } else if (area < 0) {
        throw new StoreException("negative page area: " + area);
      } else if (span < 0) {
        throw new StoreException("negative page span: " + span);
      }
      return new BTreePageRef(context, pageType, stem, post, zone, base, span,
                              fold, null, -1, size, 0, area);
    } catch (Throwable error) {
      if (Cont.isNonFatal(error)) {
        cause = error;
      } else {
        throw error;
      }
    }
    final Output<String> message = Unicode.stringOutput("Malformed btree page ref: ");
    Recon.write(message, value);
    throw new StoreException(message.bind(), cause);
  }

}
